import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import http from 'http';
import https from 'https';

/**
 * Specialized client for communicating with the Speech Processing Service.
 * Separated from AI service to allow independent scaling and vertical focus.
 */
class SpeechServiceClient {
    private static instance: SpeechServiceClient;
    private client: AxiosInstance;

    private constructor() {
        const httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 60000,
        });

        const httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 30000,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 60000,
        });

        this.client = axios.create({
            baseURL: env.SPEECH_SERVICE_URL,
            timeout: 300000, // 5 minutes (speech processing can be slow)
            headers: {
                // Multi-part content will be handled by axios automatically when passing FormData
            },
            httpAgent,
            httpsAgent,
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('[Speech Service Client] Request failed:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message,
                });
                throw error;
            }
        );
    }

    public static getInstance(): SpeechServiceClient {
        if (!SpeechServiceClient.instance) {
            SpeechServiceClient.instance = new SpeechServiceClient();
        }
        return SpeechServiceClient.instance;
    }

    public getClient(): AxiosInstance {
        return this.client;
    }
}

export const speechServiceClient = SpeechServiceClient.getInstance();
