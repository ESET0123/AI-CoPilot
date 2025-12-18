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
  loading: boolean;
};

/* ================= INITIAL STATE ================= */

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  loading: false,
};

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

    // backend returns { id, title }
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
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
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

        state.activeConversationId =
          state.conversations[0]?.id ?? null;
      })

      /* ===== FETCH MESSAGES ===== */
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

      /* ===== CREATE ===== */
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift({
          id: action.payload.id,
          title: action.payload.title,
          messages: [],
        });
        state.activeConversationId = action.payload.id;
      })

      /* ===== RENAME ===== */
      .addCase(renameConversation.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.id
        );

        if (convo) {
          convo.title = action.payload.title;
        }
      })


      /* ===== DELETE ===== */
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          c => c.id !== action.payload
        );

        if (state.activeConversationId === action.payload) {
          state.activeConversationId =
            state.conversations[0]?.id ?? null;
        }
      })

      /* ===== SEND MESSAGE ===== */
      .addCase(sendMessage.fulfilled, (state, action) => {
        const convo = state.conversations.find(
          c => c.id === action.payload.conversationId
        );
        if (!convo) return;

        convo.messages.push({
          role: 'assistant',
          text: action.payload.assistant.content,
        });
      })

      /* ===== LOGOUT RESET ===== */
      .addCase(logout, () => initialState);
  },
});

/* ================= EXPORTS ================= */

export const {
  setActiveConversation,
  addUserMessage,
} = chatSlice.actions;


export default chatSlice.reducer;


// import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// import {
//   fetchConversationsApi,
//   fetchMessagesApi,
//   sendMessageApi,
//   createConversationApi,
//   renameConversationApi,
// } from './chatService';
// import { logout } from '../auth/authSlice';

// /* ================= TYPES ================= */

// type Message = {
//   role: 'user' | 'assistant';
//   text: string;
// };

// type BackendMessage = {
//   role: 'user' | 'assistant';
//   content: string;
// };

// type BackendConversation = {
//   id: string;
//   title: string;
// };

// type Conversation = {
//   id: string;
//   title: string;
//   messages: Message[];
// };

// export type ChatState = {
//   conversations: Conversation[];
//   activeConversationId: string | null;
//   loading: boolean;
// };

// /* ================= INITIAL STATE ================= */

// const initialState: ChatState = {
//   conversations: [],
//   activeConversationId: null,
//   loading: false,
// };

// /* ================= THUNKS ================= */

// export const fetchConversations = createAsyncThunk(
//   'chat/fetchConversations',
//   async () => {
//     const { data } = await fetchConversationsApi();
//     return data as BackendConversation[];
//   }
// );

// export const fetchMessages = createAsyncThunk(
//   'chat/fetchMessages',
//   async (conversationId: string) => {
//     const { data } = await fetchMessagesApi(conversationId);
//     return { conversationId, messages: data as BackendMessage[] };
//   }
// );

// export const createConversation = createAsyncThunk(
//   'chat/createConversation',
//   async (title: string) => {
//     const { data } = await createConversationApi(title);
//     return data;
//   }
// );

// export const renameConversation = createAsyncThunk(
//   'chat/renameConversation',
//   async (payload: { conversationId: string; title: string }) => {
//     await renameConversationApi(payload.conversationId, payload.title);
//     return payload;
//   }
// );

// export const sendMessage = createAsyncThunk(
//   'chat/sendMessage',
//   async (payload: { conversationId: string; message: string }) => {
//     const { data } = await sendMessageApi(
//       payload.conversationId,
//       payload.message
//     );
//     return {
//       conversationId: payload.conversationId,
//       message: data as BackendMessage,
//     };
//   }
// );

// /* ================= SLICE ================= */

// const chatSlice = createSlice({
//   name: 'chat',
//   initialState,
//   reducers: {
//     setActiveConversation(state, action) {
//       state.activeConversationId = action.payload;
//     },

//     // optimistic user message
//     addUserMessage(state, action) {
//       const convo = state.conversations.find(
//         c => c.id === state.activeConversationId
//       );
//       if (!convo) return;

//       convo.messages.push({
//         role: 'user',
//         text: action.payload,
//       });
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       .addCase(fetchConversations.fulfilled, (state, action) => {
//         state.conversations = action.payload.map(c => ({
//           id: c.id,
//           title: c.title,
//           messages: [],
//         }));
//         state.activeConversationId =
//           state.conversations[0]?.id ?? null;
//       })

//       .addCase(fetchMessages.fulfilled, (state, action) => {
//         const convo = state.conversations.find(
//           c => c.id === action.payload.conversationId
//         );
//         if (!convo) return;

//         convo.messages = action.payload.messages.map(m => ({
//           role: m.role,
//           text: m.content,
//         }));
//       })

//       .addCase(createConversation.fulfilled, (state, action) => {
//         state.conversations.unshift({
//           id: action.payload.id,
//           title: action.payload.title,
//           messages: [],
//         });
//         state.activeConversationId = action.payload.id;
//       })

//       .addCase(renameConversation.fulfilled, (state, action) => {
//         const convo = state.conversations.find(
//           c => c.id === action.payload.conversationId
//         );
//         if (convo) convo.title = action.payload.title;
//       })

//       .addCase(sendMessage.fulfilled, (state, action) => {
//         const convo = state.conversations.find(
//           c => c.id === action.payload.conversationId
//         );
//         if (!convo) return;

//         convo.messages.push({
//           role: 'assistant',
//           text: action.payload.message.content,
//         });
//       })

//       .addCase(logout, () => initialState);
//   },
// });

// export const {
//   setActiveConversation,
//   addUserMessage,
// } = chatSlice.actions;

// export default chatSlice.reducer;
