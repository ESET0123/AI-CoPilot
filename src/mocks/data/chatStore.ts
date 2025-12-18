import type { Message, Conversation } from "../../features/chat/types";

export type ChatStore = {
  [userId: string]: {
    conversations: Conversation[];
    messages: Message[];
  };
};

export const chatStore: ChatStore = {};
