import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { sendMessageApi } from './chatService';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

export type ChatState = {
  conversations: Conversation[];
  activeConversationId: string;
};

const createEmptyState = (): ChatState => {
  const id = nanoid();
  return {
    conversations: [
      {
        id,
        title: 'New Chat',
        messages: [],
      },
    ],
    activeConversationId: id,
  };
};

const initialState: ChatState = createEmptyState();

/* ================= ASYNC ================= */

export const sendMessage = createAsyncThunk(
  'chat/send',
  async (message: string) => {
    const { data } = await sendMessageApi(message);
    return data.reply;
  }
);

/* ================= SLICE ================= */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    hydrateChats(_, action) {
      const state = action.payload as ChatState;

      if (
        !state.activeConversationId ||
        !state.conversations.find(c => c.id === state.activeConversationId)
      ) {
        state.activeConversationId = state.conversations[0]?.id ?? '';
      }

      return state;
    },

    newConversation(state) {
      const id = nanoid();
      state.conversations.push({
        id,
        title: 'New Chat',
        messages: [],
      });
      state.activeConversationId = id;
    },

    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },

    renameConversation(state, action) {
      const convo = state.conversations.find(
        c => c.id === action.payload.id
      );
      if (convo) {
        convo.title = action.payload.title.trim() || convo.title;
      }
    },

    removeConversation(state, action) {
      state.conversations = state.conversations.filter(
        c => c.id !== action.payload
      );

      if (!state.conversations.length) {
        const id = nanoid();
        state.conversations.push({
          id,
          title: 'New Chat',
          messages: [],
        });
        state.activeConversationId = id;
      }
    },

    resetChats() {
      return createEmptyState();
    },

    /* 🔴 THIS WAS MISSING */
    addUserMessage(state, action) {
      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        role: 'user',
        text: action.payload,
      });

      if (convo.messages.length === 1) {
        convo.title = action.payload.slice(0, 40);
      }
    },
  },

  extraReducers: (builder) => {
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        role: 'assistant',
        text: action.payload,
      });
    });
  },
});

export const {
  hydrateChats,
  newConversation,
  setActiveConversation,
  renameConversation,
  removeConversation,
  resetChats,
  addUserMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
