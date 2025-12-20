import { Router } from 'express';
import { pool } from '../db/pool';
import { requireAuth } from '../middleware/auth';
import { generateAIReply, ChatMessage } from '../utils/ai';

const router = Router();
router.use(requireAuth);

/* ================= GET MESSAGES ================= */

router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const userId = (req as any).userId;

  const result = await pool.query(
    `
    SELECT m.role, m.content, m.created_at
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.conversation_id = $1
      AND c.user_id = $2
    ORDER BY m.created_at
    `,
    [conversationId, userId]
  );

  res.json(result.rows);
});

/* ================= SEND MESSAGE (AI) ================= */

router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = (req as any).userId;

  if (!message?.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  /* ===== OWNERSHIP CHECK ===== */
  const ownsConversation = await pool.query(
    `
    SELECT 1
    FROM conversations
    WHERE id = $1 AND user_id = $2
    `,
    [conversationId, userId]
  );

  if (ownsConversation.rowCount === 0) {
    return res.status(403).json({ message: 'Access denied' });
  }

  /* ===== STORE USER MESSAGE ===== */
  await pool.query(
    `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, 'user', $2)
    `,
    [conversationId, message.trim()]
  );

  /* ===== FETCH CONTEXT ===== */
  const historyResult = await pool.query(
    `
    SELECT role, content
    FROM messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    LIMIT 10
    `,
    [conversationId]
  );

  /* ===== BUILD GROQ-COMPLIANT MESSAGE LIST ===== */
  const messagesForLLM: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are Esyasoft AI Copilot. Answer clearly, concisely, and helpfully.',
    },
  ];

  let lastRole: 'system' | 'user' | 'assistant' = 'system';

  for (const msg of historyResult.rows) {
    if (
      msg.content === 'Sorry, I could not generate a response right now.'
    ) {
      continue;
    }

    // Merge consecutive same-role messages
    if (msg.role === lastRole) {
      messagesForLLM[messagesForLLM.length - 1].content +=
        '\n' + msg.content;
    } else {
      messagesForLLM.push({
        role: msg.role,
        content: msg.content,
      });
      lastRole = msg.role;
    }
  }

  /* ===== GENERATE AI RESPONSE ===== */
  let reply = 'Sorry, I could not generate a response right now.';

  try {
    reply = await generateAIReply(messagesForLLM);
  } catch (err) {
    console.error('AI GENERATION ERROR:', err);
  }

  /* ===== STORE ASSISTANT MESSAGE ===== */
  await pool.query(
    `
    INSERT INTO messages (conversation_id, role, content)
    VALUES ($1, 'assistant', $2)
    `,
    [conversationId, reply]
  );

  res.json({
    role: 'assistant',
    content: reply,
  });
});

export default router;
