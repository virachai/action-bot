import { EventEmitter } from 'events';
import { config } from '@repo/config';
import { VideoScript, VideoMetadata, WorkflowState, WorkflowJob, WorkflowError } from '@repo/types';
import { JobStatus, prisma } from '@repo/database';
import { S3Service } from './services/s3.service.js';
import { AILogicService } from './services/ai-logic.service.js';
import { VideoEngineService } from './services/video-engine.service.js';
import { GoogleSheetsService } from './services/google-sheets.service.js';

/**
 * Workflow Orchestrator
 * Manages the end-to-end video generation pipeline
 */
export class WorkflowOrchestrator {
    public static events = new EventEmitter();
    private s3Service: S3Service;
    private aiService: AILogicService;
    private videoService: VideoEngineService;
    private sheetsService: GoogleSheetsService;

    constructor() {
        this.s3Service = new S3Service();
        this.aiService = new AILogicService(process.env.AI_LOGIC_URL);
        this.videoService = new VideoEngineService(process.env.VIDEO_ENGINE_URL);
        this.sheetsService = new GoogleSheetsService();
    }

    /**
     * Step 1: Generate script with AI
     */
    async generateScriptStep(job: WorkflowJob): Promise<VideoScript> {
        job.state = WorkflowState.GENERATING_SCRIPT;
        await this.updateJob(job);

        const script = await this.aiService.generateScript({
            topic: job.topic || 'Unknown',
            targetDuration: 60,
            targetPlatforms: ['tiktok', 'instagram', 'youtube'],
            style: 'entertaining',
        });

        job.scriptId = script.id;

        // Save script to S3
        const scriptKey = `scripts/${script.id}.json`;
        await this.s3Service.uploadJson(script, config.s3.buckets.output, scriptKey);
        console.log(`💾 Script saved to S3: ${scriptKey}\n`);

        return script;
    }

    /**
     * Step 2: Assemble video
     */
    async assembleVideoStep(job: WorkflowJob, script: VideoScript): Promise<VideoMetadata> {
        job.state = WorkflowState.ASSEMBLING_VIDEO;
        await this.updateJob(job);

        const videoMetadata = await this.videoService.generateVideo({
            script,
            outputBucket: config.s3.buckets.output,
            outputKey: `videos/${script.id}.mp4`,
        });

        job.videoId = videoMetadata.id;
        console.log(`📤 Video uploaded to S3: ${videoMetadata.outputUrl}\n`);

        return videoMetadata;
    }

    /**
     * Step 3: Finalize workflow (Sheets logging, etc.)
     */
    async finalizeWorkflowStep(job: WorkflowJob, videoMetadata: VideoMetadata): Promise<void> {
        job.state = WorkflowState.COMPLETED;
        await this.updateJob(job);

        console.log(`✨ Workflow completed successfully!`);
        console.log(`📊 Video Metadata:`);
        console.log(`   - Duration: ${videoMetadata.duration}s`);
        console.log(`   - Size: ${(videoMetadata.fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   - URL: ${videoMetadata.outputUrl}\n`);

        // Log to Google Sheets
        await this.sheetsService.logData({
            timestamp: new Date().toISOString(),
            workflowId: job.id,
            topic: job.topic || 'Unknown',
            status: 'COMPLETED',
            videoUrl: videoMetadata.outputUrl,
            duration: videoMetadata.duration,
            fileSize: videoMetadata.fileSize,
        });
    }

    /**
     * Execute the complete video generation workflow
     */
    async executeWorkflow(topic: string): Promise<WorkflowJob> {
        const job: WorkflowJob = {
            id: this.generateId(),
            state: WorkflowState.IDLE,
            topic,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            console.log(`\n🚀 Starting workflow: ${job.id}`);
            console.log(`📝 Topic: ${topic}\n`);

            // Step 1: Generate script
            const script = await this.generateScriptStep(job);

            // Step 2: Download assets (skipped in orchestrator for now)
            job.state = WorkflowState.DOWNLOADING_ASSETS;
            await this.updateJob(job);

            // Step 3: Assemble video
            const videoMetadata = await this.assembleVideoStep(job, script);

            // Step 4: Finalize
            await this.finalizeWorkflowStep(job, videoMetadata);

            return job;
        } catch (error) {
            job.state = WorkflowState.FAILED;
            job.error = {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
            };
            await this.updateJob(job);

            console.error(`❌ Workflow failed: ${job.error.message}\n`);

            throw new WorkflowError(
                `Workflow failed at state ${job.state}`,
                job.state,
                error as Error
            );
        }
    }

    /**
     * Health check all services
     */
    async healthCheck(): Promise<{
        aiLogic: boolean;
        videoEngine: boolean;
        s3: boolean;
    }> {
        const [aiLogic, videoEngine] = await Promise.all([
            this.aiService.healthCheck(),
            this.videoService.healthCheck(),
        ]);

        // Simple S3 health check by listing buckets
        let s3 = false;
        try {
            await this.s3Service.listObjects(config.s3.buckets.output, '');
            s3 = true;
        } catch {
            s3 = false;
        }

        return { aiLogic, videoEngine, s3 };
    }

    /**
     * Update job state in database (Production Schema)
     */
    private async updateJob(job: WorkflowJob): Promise<void> {
        job.updatedAt = new Date().toISOString();
        console.log(`📍 State: ${job.state}`);

        try {
            const topicId = `topic_${job.topic?.replace(/\s+/g, '_').toLowerCase() || 'default'}`;
            const topic = await prisma.topic.upsert({
                where: { id: topicId },
                update: {},
                create: {
                    id: topicId,
                    content: job.topic || 'Unknown Topic',
                }
            });

            // 2. Ensure Script exists if we have a scriptId
            if (job.scriptId) {
                await prisma.script.upsert({
                    where: { id: job.scriptId },
                    update: {},
                    create: {
                        id: job.scriptId,
                        topicId: topic.id,
                        title: job.topic || 'Untitled',
                        rawJson: {}, // Placeholder
                        scenes: [],
                        captions: [],
                    }
                });
            }

            // 3. Update or Create VideoJob
            const statusMap: Record<WorkflowState, JobStatus> = {
                [WorkflowState.IDLE]: JobStatus.PENDING,
                [WorkflowState.GENERATING_SCRIPT]: JobStatus.PROCESSING,
                [WorkflowState.DOWNLOADING_INPUT]: JobStatus.PROCESSING,
                [WorkflowState.DOWNLOADING_ASSETS]: JobStatus.PROCESSING,
                [WorkflowState.ASSEMBLING_VIDEO]: JobStatus.PROCESSING,
                [WorkflowState.UPLOADING_OUTPUT]: JobStatus.PROCESSING,
                [WorkflowState.COMPLETED]: JobStatus.COMPLETED,
                [WorkflowState.FAILED]: JobStatus.FAILED,
            };

            await prisma.videoJob.upsert({
                where: { id: job.id },
                update: {
                    status: statusMap[job.state] || JobStatus.PROCESSING,
                    error: job.error?.message,
                    updatedAt: new Date(),
                },
                create: {
                    id: job.id,
                    scriptId: job.scriptId || 'pending_script',
                    status: statusMap[job.state] || JobStatus.PENDING,
                    error: job.error?.message,
                },
            });

            // Emit event for real-time updates
            WorkflowOrchestrator.events.emit('stateChange', {
                id: job.id,
                status: statusMap[job.state] || 'PROCESSING',
                state: job.state,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error(`⚠️  Failed to persist job state to database: ${error}`);
        }
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `wf_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}
