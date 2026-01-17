// Shared TypeScript type definitions

/* ================= USER & AUTH ================= */

export interface User {
    email: string;
    name?: string;
    given_name?: string;
    family_name?: string;
    roles: string[];
    groups: string[];
    sub: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in?: number;
}

/* ================= CONVERSATION & MESSAGES ================= */

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: Date | string;
}

export interface Conversation {
    id: string;
    title: string;
    created_at?: Date | string;
}

export interface ConversationWithMessages extends Conversation {
    messages: Message[];
}

/* ================= API RESPONSES ================= */

export interface LoginResponse {
    message: string;
    user: User;
    expires_in: number;
}

export interface MessagePairResponse {
    user: Message;
    assistant: Message;
}

export interface ErrorResponse {
    message: string;
    error?: string;
}
