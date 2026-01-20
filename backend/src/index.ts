import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import conversationsRoutes from './routes/conversations.routes';
import messagesRoutes from './routes/messages.routes';
import transcribeRoutes from './routes/transcribe.routes';
import ocrRoutes from './routes/ocr.routes';
import theftRoutes from './routes/theft';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('SERVER OK');
});

import { MessagesController } from './controllers/messages.controller';

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/transcribe', requireAuth, transcribeRoutes);
app.use('/api/ocr', requireAuth, ocrRoutes);
app.use('/api/theft', requireAuth, theftRoutes);

app.post('/api/messages/stop', requireAuth, MessagesController.stop);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
