import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import { sendMessageApi } from './chatService';
import { login } from '../auth/authSlice';

/* ================= TYPES ================= */

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
  hydrated: boolean;
  ownerUserId: string | null;
};

/* ================= HELPERS ================= */

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
    hydrated: false,
    ownerUserId: null,
  };
};

const initialState: ChatState = createEmptyState();

/* ================= ASYNC ================= */

export const sendMessage = createAsyncThunk(
  'chat/send',
  async (
    payload: { conversationId: string; message: string }
  ) => {
    const { data } = await sendMessageApi(payload.message);
    return {
      conversationId: payload.conversationId,
      reply: data.reply,
    };
  }
);

/* ================= SLICE ================= */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /* 🔒 RESET CHAT WHEN USER CHANGES */
    resetForUser(state, action) {
      const userId = action.payload as string;

      // Already correct owner → do nothing
      if (state.ownerUserId === userId) return;

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
        hydrated: false,
        ownerUserId: userId,
      };
    },

    /* 🔁 HYDRATE FROM STORAGE */
    hydrateChats(_, action) {
      const {
        userId,
        chatState,
      }: { userId: string; chatState: ChatState | null } = action.payload;

      if (!chatState) {
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
          hydrated: true,
          ownerUserId: userId,
        };
      }

      const conversations = chatState.conversations.length
        ? chatState.conversations
        : [
            {
              id: nanoid(),
              title: 'New Chat',
              messages: [],
            },
          ];

      const activeConversationId =
        chatState.activeConversationId &&
        conversations.some(
          (c) => c.id === chatState.activeConversationId
        )
          ? chatState.activeConversationId
          : conversations[0].id;

      return {
        conversations,
        activeConversationId,
        hydrated: true,
        ownerUserId: userId,
      };
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
        (c) => c.id === action.payload.id
      );
      if (convo) {
        convo.title = action.payload.title.trim() || convo.title;
      }
    },

    removeConversation(state, action) {
      const removedId = action.payload;

      state.conversations = state.conversations.filter(
        (c) => c.id !== removedId
      );

      if (state.activeConversationId === removedId) {
        state.activeConversationId =
          state.conversations[0]?.id ?? '';
      }

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

    addUserMessage(state, action) {
      const convo = state.conversations.find(
        (c) => c.id === state.activeConversationId
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
  builder
    .addCase(sendMessage.fulfilled, (state, action) => {
      const convo = state.conversations.find(
        c => c.id === action.payload.conversationId
      );
      if (!convo) return;

      convo.messages.push({
        role: 'assistant',
        text: action.payload.reply,
      });
    })

    // 🔴 HARD RESET ON USER CHANGE
    .addCase(login.fulfilled, (_state, action) => {
      const userId = String(action.payload.user.id);
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
        hydrated: false,
        ownerUserId: userId,
      };
    })

    // .addCase(logout.fulfilled, () => {
    //   return createEmptyState();
    // });
  },
});

/* ================= EXPORTS ================= */

export const {
  resetForUser,     // ✅ THIS WAS MISSING
  hydrateChats,
  newConversation,
  setActiveConversation,
  renameConversation,
  removeConversation,
  addUserMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
