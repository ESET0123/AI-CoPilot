import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import http from 'http';
import https from 'https';

/**
 * Centralized client for communicating with the AI Service (LLM-service).
 * Provides consistent configuration, timeout handling, connection pooling, and error management.
 */
class AIServiceClient {
    private static instance: AIServiceClient;
    private client: AxiosInstance;

    private constructor() {
        // Create HTTP agents with connection pooling
        const httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000, // Keep connections alive for 30 seconds
            maxSockets: 50, // Maximum number of sockets to allow per host
            maxFreeSockets: 10, // Maximum number of idle sockets to keep open
            timeout: 60000, // Socket timeout
        });

        const httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 60000,
        });

        this.client = axios.create({
            baseURL: env.AI_SERVICE_URL,
            timeout: 240000, // 4 minutes for heavy operations
            headers: {
                'Content-Type': 'application/json',
            },
            httpAgent,
            httpsAgent,
        });

        // Add response interceptor for consistent error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('[AI Service Client] Request failed:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            }
        );
    }

    public static getInstance(): AIServiceClient {
        if (!AIServiceClient.instance) {
            AIServiceClient.instance = new AIServiceClient();
        }
        return AIServiceClient.instance;
    }

    /**
     * Get the underlying axios instance for custom requests
     */
    public getClient(): AxiosInstance {
        return this.client;
    }

    /**
     * Make a POST request to the AI service
     */
    public async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.post(url, data, config);
        return response.data;
    }

    /**
     * Make a GET request to the AI service
     */
    public async get<T = any>(url: string, config?: any): Promise<T> {
        const response = await this.client.get(url, config);
        return response.data;
    }
}

export const aiServiceClient = AIServiceClient.getInstance();
