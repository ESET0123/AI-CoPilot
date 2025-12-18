import type { ChatState } from '../features/chat/chatSlice';

export const chatStorage = {
  load(userId: string): ChatState | null {
    const raw = localStorage.getItem(`chats:${userId}`);
    return raw ? (JSON.parse(raw) as ChatState) : null;
  },

  save(userId: string, state: ChatState) {
    localStorage.setItem(`chats:${userId}`, JSON.stringify(state));
  },

  clear(userId: string) {
    localStorage.removeItem(`chats:${userId}`);
  },
};
