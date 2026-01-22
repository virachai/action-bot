import { WorkflowOrchestrator } from './index.js';

/**
 * Main entry point for CLI usage
 */
async function main() {
    try {
        // Get topic from environment or use default
        const topic = process.env.VIDEO_TOPIC || 'The Future of AI in 2026';

        console.log('╔════════════════════════════════════════╗');
        console.log('║   AUTO-SHORT-FACTORY ORCHESTRATOR     ║');
        console.log('╚════════════════════════════════════════╝\n');

        const orchestrator = new WorkflowOrchestrator();

        // Health check
        console.log('🔍 Performing health checks...');
        const health = await orchestrator.healthCheck();
        console.log(`   AI Logic: ${health.aiLogic ? '✅' : '❌'}`);
        console.log(`   Video Engine: ${health.videoEngine ? '✅' : '❌'}`);
        console.log(`   S3: ${health.s3 ? '✅' : '❌'}\n`);

        if (!health.aiLogic || !health.videoEngine || !health.s3) {
            console.error('⚠️  Some services are unavailable. Please check configuration.\n');
            process.exit(1);
        }

        // Execute workflow
        await orchestrator.executeWorkflow(topic);

        console.log('👋 Orchestrator finished successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    }
}

main();
