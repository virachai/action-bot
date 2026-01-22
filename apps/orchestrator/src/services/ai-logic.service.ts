import axios from 'axios';
import { GeminiRequest, GeminiResponse, VideoScript } from '@repo/types';

/**
 * AI Logic Service Client
 * Communicates with the Python ai-logic service
 */
export class AILogicService {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8001') {
        this.baseUrl = baseUrl;
    }

    /**
     * Generate video script from topic
     */
    async generateScript(request: GeminiRequest): Promise<VideoScript> {
        try {
            console.log(`🤖 Generating script for topic: ${request.topic}`);

            const response = await axios.post<GeminiResponse>(
                `${this.baseUrl}/generate-script`,
                request,
                {
                    timeout: 60000, // 60 second timeout
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.data.success || !response.data.script) {
                throw new Error(response.data.error || 'Failed to generate script');
            }

            console.log(`✅ Script generated successfully: ${response.data.script.id}`);
            return response.data.script;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.error || error.message;
                throw new Error(`AI Logic Service error: ${message}`);
            }
            throw error;
        }
    }

    /**
     * Health check for AI logic service
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
