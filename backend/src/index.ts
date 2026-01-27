import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import conversationsRoutes from './routes/conversations.routes';
import messagesRoutes from './routes/messages.routes';
import transcribeRoutes from './routes/transcribe.routes';
import ocrRoutes from './routes/ocr.routes';
import theftRoutes from './module/theft-detection-module/theft.routes';
import forecastingRoutes from './module/load-forecasting-module/forecasting.routes';
import defaulterRoutes from './module/defaulter-analysis-module/defaulter.routes';
import ttsRoutes from './routes/tts.routes';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = env.PORT;

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('SERVER OK');
});

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/transcribe', requireAuth, transcribeRoutes);
app.use('/api/ocr', requireAuth, ocrRoutes);
app.use('/api/theft', requireAuth, theftRoutes);
app.use('/api/forecasting', requireAuth, forecastingRoutes);
app.use('/api/defaulter', requireAuth, defaulterRoutes);
app.use('/api/tts', requireAuth, ttsRoutes);

// Global error handling middleware
// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Handler]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (env.NODE_ENV === 'production' && statusCode === 500) {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(statusCode).json({
      message,
      stack: env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
