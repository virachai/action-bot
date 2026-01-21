import { z } from 'zod';

/**
 * Environment variable validation schema
 */
const envSchema = z.object({
    // Gemini AI Configuration
    GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
    GEMINI_MODEL: z.string().default('gemini-1.5-flash'),

    // AWS S3 Configuration
    AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS Access Key ID is required'),
    AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS Secret Access Key is required'),
    AWS_REGION: z.string().default('us-east-1'),
    S3_BUCKET_INPUT: z.string().default('auto-short-factory-input'),
    S3_BUCKET_OUTPUT: z.string().default('auto-short-factory-output'),
    S3_BUCKET_ASSETS: z.string().default('auto-short-factory-assets'),

    // Video Configuration
    VIDEO_TOPIC: z.string().optional(),
    VIDEO_WIDTH: z.coerce.number().default(1080),
    VIDEO_HEIGHT: z.coerce.number().default(1920),
    VIDEO_FPS: z.coerce.number().default(30),

    // Node Environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and returns environment variables
 * @throws {Error} if validation fails
 */
export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            throw new Error(
                `Environment validation failed:\n${missingVars.join('\n')}\n\nPlease check your .env file.`
            );
        }
        throw error;
    }
}

/**
 * Get environment variables with defaults (for optional vars)
 */
export const env = envSchema.parse(process.env);
