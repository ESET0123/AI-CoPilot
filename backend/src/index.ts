import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import conversationsRoutes from './routes/conversations.routes';
import messagesRoutes from './routes/messages.routes';
import transcribeRoutes from './routes/transcribe.routes';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = 5000;

app.use(cors({
  origin: true, // In production, replace with your frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('SERVER OK');
});

import { MessagesController } from './controllers/messages.controller';

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);
app.use('/api/transcribe', transcribeRoutes);

app.post('/stop', requireAuth, MessagesController.stop);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
