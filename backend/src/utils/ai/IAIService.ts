export interface AIChatPayload {
    conversationId: string;
    message: string;
}

export interface IAIService {
    callChat(payload: AIChatPayload, signal?: AbortSignal): Promise<string>;
    stopChat(conversationId: string): Promise<void>;
    transcribeAudio(audioData: Buffer | Blob): Promise<string>;
}
