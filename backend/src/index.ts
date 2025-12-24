import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health';
import authRoutes from './auth/auth.routes';
import conversationsRoutes from './chat/conversations.routes';
import messagesRoutes from './chat/messages.routes';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('SERVER OK');
});

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);

app.post('/stop', requireAuth, async (req, res) => {
  const { conversation_id } = req.body;
  if (!conversation_id) return res.status(400).json({ message: 'conversation_id required' });

  try {
    const { ChatService } = await import('./chat/chat.service');
    await ChatService.stopGeneration(conversation_id);
    res.json({ message: 'Stop signal sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to signal stop' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
