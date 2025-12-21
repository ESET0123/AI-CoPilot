import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../services/api';
import { logout } from '../auth/authSlice';
import type { RootState } from '../../app/store';

/* ================= TYPES ================= */

// const delay = (ms: number) =>
//   new Promise(resolve => setTimeout(resolve, ms));


export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

type BackendMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type BackendConversation = {
  id: string;
  title: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

export type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  draftMessageMode: boolean;
};

/* ================= INITIAL STATE ================= */

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  draftMessageMode: true,
};

/* ================= THUNKS ================= */

export const fetchConversations = createAsyncThunk<
  BackendConversation[],
  void,
  { state: RootState }
>('chat/fetchConversations', async (_, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.fetchConversations();
  return data;
});

export const fetchMessages = createAsyncThunk<
  { conversationId: string; messages: BackendMessage[] },
  string,
  { state: RootState }
>('chat/fetchMessages', async (conversationId, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.fetchMessages(conversationId);
  return { conversationId, messages: data };
});

export const createConversation = createAsyncThunk<
  BackendConversation,
  string,
  { state: RootState }
>('chat/createConversation', async (title, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.createConversation(title);
  return data;
});

export const renameConversation = createAsyncThunk<
  BackendConversation,
  { conversationId: string; title: string },
  { state: RootState }
>('chat/renameConversation', async (payload, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.renameConversation(
    payload.conversationId,
    payload.title
  );

  return data;
});

export const deleteConversation = createAsyncThunk<
  string,
  string,
  { state: RootState }
>('chat/deleteConversation', async (conversationId, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  await chatApi.deleteConversation(conversationId);
  return conversationId;
});

export const deleteAllConversations = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('chat/deleteAllConversations', async (_, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  await chatApi.deleteAllConversations();
});

/* ================= SEND MESSAGE (FIXED) ================= */

export const sendMessage = createAsyncThunk<
  {
    conversationId: string;
    user: BackendMessage;
    assistant: BackendMessage;
  },
  { conversationId: string; message: string },
  { state: RootState }
>('chat/sendMessage', async (payload, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.sendMessage(
    payload.conversationId,
    payload.message
  );

  // delay(500); // artificial delay for better UX

  return {
    conversationId: payload.conversationId,
    user: data.user,
    assistant: data.assistant,
  };
});

/* ================= SLICE ================= */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat(state) {
      state.activeConversationId = null;
      state.draftMessageMode = true;
    },

    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      state.draftMessageMode = false;
    },

    addUserMessage(state, action) {
      if (!state.activeConversationId) return;

      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        id: crypto.randomUUID(),
        role: 'user',
        text: action.payload,
      });
    },

    addAssistantLoading(state) {
      if (!state.activeConversationId) return;

      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        loading: true,
      });
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== FETCH CONVERSATIONS ===== */
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.map(c => ({
          id: c.id,
          title: c.title,
          messages: [],
        }));

        if (state.conversations.length > 0) {
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
        } else {
          state.activeConversationId = null;
          state.draftMessageMode = true;
        }
      })

      .addCase(fetchConversations.rejected, () => initialState)

      /* ===== FETCH MESSAGES ===== */
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.conversationId
        );
        if (!convo) return;

        convo.messages = action.payload.messages.map(m => ({
          id: m.id,
          role: m.role,
          text: m.content,
        }));
      })

      /* ===== CREATE ===== */
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift({
          id: action.payload.id,
          title: action.payload.title,
          messages: [],
        });

        state.activeConversationId = action.payload.id;
        state.draftMessageMode = false;
      })

      /* ===== RENAME ===== */
      .addCase(renameConversation.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.id
        );
        if (convo) convo.title = action.payload.title;
      })

      /* ===== DELETE ===== */
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          c => c.id !== action.payload
        );

        if (state.conversations.length === 0) {
          state.activeConversationId = null;
          state.draftMessageMode = true;
        } else {
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
        }
      })

      /* ===== DELETE ALL ===== */
      .addCase(deleteAllConversations.fulfilled, () => initialState)

      /* ===== SEND MESSAGE (FIXED) ===== */
      .addCase(sendMessage.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.conversationId
        );
        if (!convo) return;

        // Remove loading bubble
        convo.messages = convo.messages.filter(
          m => !(m.role === 'assistant' && m.loading)
        );

        // Replace optimistic user message ID
        const lastUser = [...convo.messages]
          .reverse()
          .find(m => m.role === 'user');

        if (lastUser) {
          lastUser.id = action.payload.user.id;
        }

        // Add assistant reply
        convo.messages.push({
          id: action.payload.assistant.id,
          role: 'assistant',
          text: action.payload.assistant.content,
        });
      })

      /* ===== SEND MESSAGE FAIL SAFE ===== */
      .addCase(sendMessage.rejected, (state) => {
        const convo = state.conversations.find(
          c => c.id === state.activeConversationId
        );
        if (!convo) return;

        convo.messages = convo.messages.filter(
          m => !(m.role === 'assistant' && m.loading)
        );

        convo.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Something went wrong. Please try again.',
        });
      })

      /* ===== LOGOUT RESET ===== */
      .addCase(logout, () => initialState);
  },
});

/* ================= EXPORTS ================= */

export const {
  startNewChat,
  setActiveConversation,
  addUserMessage,
  addAssistantLoading,
} = chatSlice.actions;

export default chatSlice.reducer;
