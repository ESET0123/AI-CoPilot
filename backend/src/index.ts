import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health';
import authRoutes from './auth/auth.routes';
import conversationsRoutes from './chat/conversations.routes';
import messagesRoutes from './chat/messages.routes';

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

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
