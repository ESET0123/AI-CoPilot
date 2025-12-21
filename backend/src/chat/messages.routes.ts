import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { pool } from '../db/pool';
import { ChatService } from './chat.service';

const router = Router();
router.use(requireAuth);

/* ================= GET MESSAGES ================= */

router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId!;

  const result = await pool.query(
    `
    SELECT m.id, m.role, m.content, m.created_at
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

/* ================= SEND MESSAGE ================= */

router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;
  const userId = req.userId!;

  if (!conversationId || !message?.trim()) {
    return res
      .status(400)
      .json({ message: 'Conversation and message required' });
  }

  try {
    await ChatService.assertConversationOwnership(
      conversationId,
      userId
    );

    const userMsg = await ChatService.storeMessage(
      conversationId,
      'user',
      message.trim()
    );

    const assistantMsg =
      await ChatService.generateAndStoreAssistantReply(
        conversationId
      );

    res.json({
      user: userMsg,
      assistant: assistantMsg,
    });
  } catch (err: any) {
    if (err.message === 'ACCESS_DENIED') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.error(err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

/* ================= EDIT MESSAGE ================= */

router.patch('/:messageId', async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.userId!;

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Content required' });
  }

  try {
    const updated =
      await ChatService.editLastUserMessage(
        messageId,
        userId,
        content.trim()
      );

    res.json(updated);
  } catch (err: any) {
    switch (err.message) {
      case 'NOT_FOUND':
        return res.status(404).json({ message: 'Message not found' });
      case 'FORBIDDEN':
        return res
          .status(403)
          .json({ message: 'Only user messages can be edited' });
      case 'NOT_LAST':
        return res.status(403).json({
          message: 'Only the latest message can be edited',
        });
      default:
        console.error(err);
        return res
          .status(500)
          .json({ message: 'Failed to edit message' });
    }
  }
});

export default router;
