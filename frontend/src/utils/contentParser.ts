export type ParsedContent = {
    text: string;
    type: 'text' | 'chart' | 'table' | 'sql' | 'error' | 'data';
    data: any | null;
    extras: Record<string, any>;
};

/**
 * Parses the raw text content of a message.
 * Attempts to parse as JSON first. If successful and strictly valid, returns structure.
 * Otherwise returns plain text structure.
 */
export function parseMessageContent(text: string, isUser: boolean): ParsedContent {
    // 1. User messages are always text
    if (isUser || !text) {
        return { text: text || '', type: 'text', data: null, extras: {} };
    }

    // 2. Try to parse as JSON (Assistant messages)
    try {
        const parsed = JSON.parse(text);

        // Validate expected structure
        if (
            parsed &&
            typeof parsed === 'object' &&
            typeof parsed.text === 'string' &&
            typeof parsed.type === 'string'
        ) {
            return {
                text: parsed.text,
                type: parsed.type,
                data: parsed.data || null,
                extras: parsed.extras || {},
            };
        }
    } catch (e) {
        // Not JSON, fall back to plain text
        // We suppress the error log here to keep console clean during normal text streaming
    }

    // 3. Fallback to plain text
    return { text, type: 'text', data: null, extras: {} };
}
