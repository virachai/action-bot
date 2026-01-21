import { env } from './env';

/**
 * Gemini AI Configuration
 */
export const geminiConfig = {
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
    generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    },
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
} as const;

/**
 * AWS S3 Configuration
 */
export const s3Config = {
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    buckets: {
        input: env.S3_BUCKET_INPUT,
        output: env.S3_BUCKET_OUTPUT,
        assets: env.S3_BUCKET_ASSETS,
    },
} as const;

/**
 * Video Output Specifications (9:16 vertical format)
 */
export const videoConfig = {
    width: env.VIDEO_WIDTH,
    height: env.VIDEO_HEIGHT,
    fps: env.VIDEO_FPS,
    aspectRatio: '9:16' as const,
    codec: 'libx264' as const,
    audioCodec: 'aac' as const,
    bitrate: '5000k' as const,
    audioBitrate: '192k' as const,
    preset: 'medium' as const,
    pixelFormat: 'yuv420p' as const,
} as const;

/**
 * Platform-specific requirements
 */
export const platformRequirements = {
    tiktok: {
        maxDuration: 180, // 3 minutes in seconds
        minDuration: 3,
        aspectRatio: '9:16',
        maxFileSize: 287 * 1024 * 1024, // 287 MB
    },
    instagram: {
        maxDuration: 90, // 1.5 minutes in seconds
        minDuration: 3,
        aspectRatio: '9:16',
        maxFileSize: 100 * 1024 * 1024, // 100 MB
    },
    youtube: {
        maxDuration: 60, // 1 minute for Shorts
        minDuration: 1,
        aspectRatio: '9:16',
        maxFileSize: 256 * 1024 * 1024, // 256 MB
    },
} as const;

/**
 * Export all configurations
 */
export { env, validateEnv } from './env';

export const config = {
    gemini: geminiConfig,
    s3: s3Config,
    video: videoConfig,
    platforms: platformRequirements,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
} as const;

export type Config = typeof config;
