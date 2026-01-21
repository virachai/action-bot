import axios from 'axios';
import { VideoGenerationRequest, VideoGenerationResponse, VideoMetadata } from '@repo/types';

/**
 * Video Engine Service Client
 * Communicates with the Python video-engine service
 */
export class VideoEngineService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8002') {
        this.baseUrl = baseUrl;
    }

    /**
     * Generate video from script
     */
    async generateVideo(request: VideoGenerationRequest): Promise<VideoMetadata> {
        try {
            console.log(`🎬 Generating video for script: ${request.script.id}`);

            const response = await axios.post<VideoGenerationResponse>(
                `${this.baseUrl}/generate-video`,
                request,
                {
                    timeout: 300000, // 5 minute timeout for video processing
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.success || !response.data.metadata) {
                throw new Error(response.data.error || 'Failed to generate video');
            }

            console.log(`✅ Video generated successfully: ${response.data.metadata.id}`);
            return response.data.metadata;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || error.message;
                throw new Error(`Video Engine Service error: ${message}`);
            }
            throw error;
        }
    }

    /**
     * Health check for video engine service
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: 5000,
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }
}
