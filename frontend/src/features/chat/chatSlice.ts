import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { chatApi } from '../../services/api';
import { logout } from '../auth/authSlice';
import type { RootState } from '../../app/store';
// import { MAX_CONVERSATION_TITLE_LENGTH } from '../../constants';




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

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};

export type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  draftMessageMode: boolean;
  sendingConversationIds: string[];
  isLoadingConversations: boolean;
  isDeletingConversationId: string | null;
};


const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  draftMessageMode: true,
  sendingConversationIds: [],
  isLoadingConversations: false,
  isDeletingConversationId: null,
};


export const fetchConversations = createAsyncThunk<
  BackendConversation[],
  void,
  { state: RootState }
>('chat/fetchConversations', async (_, { getState, rejectWithValue }) => {
  if (!getState().auth.isAuthenticated) {
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
  if (!getState().auth.isAuthenticated) {
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
  if (!getState().auth.isAuthenticated) {
    return rejectWithValue('Not authenticated');
  }

  const { data } = await chatApi.createConversation(title);
  return data;
});



export const deleteConversation = createAsyncThunk<
  string,
  string,
  { state: RootState }
>('chat/deleteConversation', async (conversationId, { getState, rejectWithValue }) => {
  if (!getState().auth.isAuthenticated) {
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
  if (!getState().auth.isAuthenticated) {
    return rejectWithValue('Not authenticated');
  }

  await chatApi.deleteAllConversations();
});


export const sendMessage = createAsyncThunk<
  {
    conversationId: string;
    user: BackendMessage;
    assistant: BackendMessage;
  },
  { conversationId: string; message: string },
  { state: RootState }
>('chat/sendMessage', async (payload, { getState, rejectWithValue, signal }) => {
  if (!getState().auth.isAuthenticated) {
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
  } catch (error: unknown) {
    const err = error as any;
    if (
      err?.name === 'CanceledError' ||
      err?.name === 'AbortError' ||
      err?.code === 'ERR_CANCELED'
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
  if (!getState().auth.isAuthenticated) {
    return rejectWithValue('Not authenticated');
  }

  try {
    await chatApi.stopMessage(conversationId);
  } catch (error) {
    console.error('Failed to notify backend about stop:', error);
  }
});


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat(state) {
      state.activeConversationId = null;
      state.draftMessageMode = true;
      try {
        localStorage.removeItem('activeConversationId');
      } catch (error) {
        console.error('Failed to remove activeConversationId from localStorage:', error);
      }
    },

    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
      state.draftMessageMode = false;
      try {
        localStorage.setItem('activeConversationId', action.payload);
      } catch (error) {
        console.error('Failed to save activeConversationId to localStorage:', error);
      }
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
        const assistantText = action.payload.assistant.content;
        convo.messages.push({
          id: action.payload.assistant.id,
          role: 'assistant',
          text: assistantText,
        });
      })
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

        //  USER STOPPED GENERATION
        if (action.payload === 'Request cancelled' || action.error.name === 'AbortError' || action.meta.aborted) {
          convo.messages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            text: 'Response generation stopped.',
          });
          return;
        }

        // Real error
        convo.messages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'Something went wrong. Please try again.',
        });
      })

      /* ===== FETCH CONVERSATIONS ===== */
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
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
          try {
            localStorage.removeItem('activeConversationId');
          } catch (error) {
            console.error('Failed to remove activeConversationId from localStorage:', error);
          }
        }
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.isLoadingConversations = false;
        return initialState;
      })

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



      /* ===== DELETE ===== */
      .addCase(deleteConversation.pending, (state, action) => {
        state.isDeletingConversationId = action.meta.arg;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.isDeletingConversationId = null;
        const wasActive = state.activeConversationId === action.payload;
        state.conversations = state.conversations.filter(
          c => c.id !== action.payload
        );

        if (state.conversations.length === 0) {
          state.activeConversationId = null;
          state.draftMessageMode = true;
          try {
            localStorage.removeItem('activeConversationId');
          } catch (error) {
            console.error('Failed to remove activeConversationId from localStorage:', error);
          }
        } else if (wasActive) {
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
          try {
            localStorage.setItem('activeConversationId', state.activeConversationId);
          } catch (error) {
            console.error('Failed to save activeConversationId to localStorage:', error);
          }
        }
      })
      .addCase(deleteConversation.rejected, (state) => {
        state.isDeletingConversationId = null;
      })

      /* ===== DELETE ALL ===== */
      .addCase(deleteAllConversations.fulfilled, () => initialState)

      /* ===== LOGOUT RESET ===== */
      .addCase(logout, () => {
        try {
          localStorage.removeItem('activeConversationId');
        } catch (error) {
          console.error('Failed to remove activeConversationId from localStorage:', error);
        }
        return initialState;
      });
  },
});


export const {
  startNewChat,
  setActiveConversation,
  addUserMessage,
  addAssistantLoading,
} = chatSlice.actions;

export default chatSlice.reducer;
