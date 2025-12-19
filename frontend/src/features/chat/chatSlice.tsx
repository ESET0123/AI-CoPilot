import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchConversationsApi,
  fetchMessagesApi,
  sendMessageApi,
  createConversationApi,
  renameConversationApi,
  deleteConversationApi,
} from './chatService';
import { logout } from '../auth/authSlice';

/* ================= TYPES ================= */

type Message = {
  role: 'user' | 'assistant';
  text: string;
  loading?: boolean;
};

type BackendMessage = {
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
  draftMessageMode: boolean; // 👈 IMPORTANT
};

/* ================= INITIAL STATE ================= */

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  draftMessageMode: false,
};

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));


/* ================= THUNKS ================= */

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const { data } = await fetchConversationsApi();
    return data as BackendConversation[];
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string) => {
    const { data } = await fetchMessagesApi(conversationId);
    return {
      conversationId,
      messages: data as BackendMessage[],
    };
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (title: string) => {
    const { data } = await createConversationApi(title);
    return data as BackendConversation;
  }
);

export const renameConversation = createAsyncThunk(
  'chat/renameConversation',
  async (payload: { conversationId: string; title: string }) => {
    const { data } = await renameConversationApi(
      payload.conversationId,
      payload.title
    );
    return data;
  }
);

export const deleteConversation = createAsyncThunk(
  'chat/deleteConversation',
  async (conversationId: string) => {
    await deleteConversationApi(conversationId);
    return conversationId;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: { conversationId: string; message: string }) => {

    await delay(1500);

    const { data } = await sendMessageApi(
      payload.conversationId,
      payload.message
    );

    return {
      conversationId: payload.conversationId,
      assistant: data as BackendMessage,
    };
  }
);

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
      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        role: 'user',
        text: action.payload,
      });
    },
    // addAssistantLoading(
    //   state,
    //   action: { payload: { conversationId: string } }
    // ) {
    //   const convo = state.conversations.find(
    //     c => c.id === action.payload.conversationId
    //   );
    //   if (!convo) return;

    //   convo.messages.push({
    //     role: 'assistant',
    //     text: '',
    //     loading: true,
    //   });
    // }
    addAssistantLoading(state) {
      const convo = state.conversations.find(
        c => c.id === state.activeConversationId
      );
      if (!convo) return;

      convo.messages.push({
        role: 'assistant',
        text: '',
        loading: true,
      });
    }



  },

  extraReducers: (builder) => {
    builder

      // .addCase(fetchConversations.fulfilled, (state, action) => {
      //   state.conversations = action.payload.map(c => ({
      //     id: c.id,
      //     title: c.title,
      //     messages: [],
      //   }));

      //   state.activeConversationId =
      //     state.conversations[0]?.id ?? null;

      //   state.draftMessageMode = false;
      // })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.map(c => ({
          id: c.id,
          title: c.title,
          messages: [],
        }));

        if (state.conversations.length > 0) {
          // Existing user
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
        } else {
          // 🆕 First-time user
          state.activeConversationId = null;
          state.draftMessageMode = true;
        }
      })


      .addCase(fetchMessages.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.conversationId
        );
        if (!convo) return;

        convo.messages = action.payload.messages.map(m => ({
          role: m.role,
          text: m.content,
        }));
      })

      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift({
          id: action.payload.id,
          title: action.payload.title,
          messages: [],
        });

        state.activeConversationId = action.payload.id;
        state.draftMessageMode = false;
      })

      .addCase(renameConversation.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.id
        );
        if (convo) convo.title = action.payload.title;
      })

      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          c => c.id !== action.payload
        );

        if (state.conversations.length === 0) {
          // 🆕 All chats deleted → enter draft mode
          state.activeConversationId = null;
          state.draftMessageMode = true;
          return;
        }

        if (state.activeConversationId === action.payload) {
          state.activeConversationId = state.conversations[0].id;
          state.draftMessageMode = false;
        }
      })


      // .addCase(sendMessage.fulfilled, (state, action) => {
      //   const convo = state.conversations.find(
      //     c => c.id === action.payload.conversationId
      //   );
      //   if (!convo) return;

      //   convo.messages.push({
      //     role: 'assistant',
      //     text: action.payload.assistant.content,
      //   });
      // })
      .addCase(sendMessage.fulfilled, (state, action) => {
          const convo = state.conversations.find(
            c => c.id === action.payload.conversationId
          );
          if (!convo) return;

          // Remove loading message
          convo.messages = convo.messages.filter(
            m => !(m.role === 'assistant' && m.loading)
          );

          // Add real assistant message
          convo.messages.push({
            role: 'assistant',
            text: action.payload.assistant.content,
          });
        })


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
