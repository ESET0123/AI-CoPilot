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
  sendingConversationIds: string[];
  dataPanelOpen: boolean;
  selectedData: any | null;
};

/* ================= INITIAL STATE ================= */

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  draftMessageMode: true,
  sendingConversationIds: [],
  dataPanelOpen: false,
  selectedData: null,
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

export const stopGeneration = createAsyncThunk(
  'chat/stopGeneration',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      console.info(`[Redux] Stopping generation for conversation ${conversationId}...`);
      await chatApi.stopMessage(conversationId);
      console.info(`[Redux] Stop signal sent.`);
    } catch (error: any) {
      console.error(`[Redux] Failed to stop generation:`, error);
      return rejectWithValue(error.response?.data?.message || 'Failed to stop generation');
    }
  }
);
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
>('chat/sendMessage', async (payload, { getState, rejectWithValue, signal }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  try {
    const { data } = await chatApi.sendMessage(
      payload.conversationId,
      payload.message,
      signal
    );

    return {
      conversationId: payload.conversationId,
      user: data.user,
      assistant: data.assistant,
    };
  } catch (error: any) {
    if (
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return rejectWithValue('Request cancelled');
    }

    throw error;
  }
});

export const stopMessage = createAsyncThunk<
  void,
  string,
  { state: RootState }
>('chat/stopMessage', async (conversationId, { getState, rejectWithValue }) => {
  if (!getState().auth.token) {
    return rejectWithValue('Not authenticated');
  }

  try {
    await chatApi.stopMessage(conversationId);
  } catch (error) {
    console.error('Failed to notify backend about stop:', error);
  }
});

/* ================= SLICE ================= */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat(state) {
      state.activeConversationId = null;
      state.draftMessageMode = true;
      localStorage.removeItem('activeConversationId');
    },

    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      state.draftMessageMode = false;
      localStorage.setItem('activeConversationId', action.payload);
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

    setDataPanelOpen(state, action: { payload: boolean }) {
      state.dataPanelOpen = action.payload;
    },

    setSelectedData(state, action: { payload: any }) {
      state.selectedData = action.payload;
      state.dataPanelOpen = true; // Auto-open when data is selected
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== SEND MESSAGE ===== */
      .addCase(sendMessage.pending, (state, action) => {
        state.sendingConversationIds.push(action.meta.arg.conversationId);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingConversationIds = state.sendingConversationIds.filter(
          id => id !== action.payload.conversationId
        );
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
      // .addCase(sendMessage.rejected, (state, action) => {
      //   state.sendingConversationIds = state.sendingConversationIds.filter(
      //     id => id !== action.meta.arg.conversationId
      //   );
      //   const convo = state.conversations.find(
      //     c => c.id === action.meta.arg.conversationId
      //   );
      //   if (!convo) return;

      //   convo.messages = convo.messages.filter(
      //     m => !(m.role === 'assistant' && m.loading)
      //   );

      //   // If it was cancelled by the user, don't show an error message
      //   if (action.payload === 'Request cancelled') {
      //     return;
      //   }

      //   convo.messages.push({
      //     id: crypto.randomUUID(),
      //     role: 'assistant',
      //     text: 'Something went wrong. Please try again.',
      //   });
      // })
      // .addCase(sendMessage.rejected, (state, action) => {
      //   state.sendingConversationIds = state.sendingConversationIds.filter(
      //     id => id !== action.meta.arg.conversationId
      //   );

      //   const convo = state.conversations.find(
      //     c => c.id === action.meta.arg.conversationId
      //   );
      //   if (!convo) return;

      //   // Remove loading bubble
      //   convo.messages = convo.messages.filter(
      //     m => !(m.role === 'assistant' && m.loading)
      //   );

      //   // 🚫 DO NOTHING if user cancelled
      //   if (action.payload === 'Request cancelled') return;

      //   convo.messages.push({
      //     id: crypto.randomUUID(),
      //     role: 'assistant',
      //     text: 'Something went wrong. Please try again.',
      //   });
      // })
      .addCase(sendMessage.rejected, (state, action) => {
        const convoId = action.meta.arg.conversationId;

        state.sendingConversationIds = state.sendingConversationIds.filter(
          id => id !== convoId
        );

        const convo = state.conversations.find(c => c.id === convoId);
        if (!convo) return;

        // Remove loading bubble
        convo.messages = convo.messages.filter(
          m => !(m.role === 'assistant' && m.loading)
        );

        // 🔥 USER STOPPED GENERATION
        if (action.payload === 'Request cancelled' || action.error.name === 'AbortError' || action.meta.aborted) {
          convo.messages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            text: 'Response generation stopped.',
          });
          return;
        }

        // ❌ Real error
        convo.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Something went wrong. Please try again.',
        });
      })

      /* ===== FETCH CONVERSATIONS ===== */
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.map(c => ({
          id: c.id,
          title: c.title,
          messages: [],
        }));

        const savedId = localStorage.getItem('activeConversationId');
        const savedConvo = state.conversations.find((c) => c.id === savedId);

        if (savedConvo) {
          state.activeConversationId = savedConvo.id;
          state.draftMessageMode = false;
        } else {
          state.activeConversationId = null;
          state.draftMessageMode = true;
          localStorage.removeItem('activeConversationId');
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
        const wasActive = state.activeConversationId === action.payload;
        state.conversations = state.conversations.filter(
          c => c.id !== action.payload
        );

        if (state.conversations.length === 0) {
          state.activeConversationId = null;
          state.draftMessageMode = true;
          localStorage.removeItem('activeConversationId');
        } else if (wasActive) {
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
          localStorage.setItem('activeConversationId', state.activeConversationId);
        }
      })

      /* ===== DELETE ALL ===== */
      .addCase(deleteAllConversations.fulfilled, () => initialState)

      /* ===== LOGOUT RESET ===== */
      .addCase(logout, () => {
        localStorage.removeItem('activeConversationId');
        return initialState;
      });
  },
});

/* ================= EXPORTS ================= */

export const {
  startNewChat,
  setActiveConversation,
  addUserMessage,
  addAssistantLoading,
  setDataPanelOpen,
  setSelectedData,
} = chatSlice.actions;

export default chatSlice.reducer;
