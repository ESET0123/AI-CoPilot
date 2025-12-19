import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health';
import authRoutes from './auth/auth.routes';
import conversationsRoutes from './chat/conversations.routes';
import messagesRoutes from './chat/messages.routes';

const app = express();

app.get('/', (_req, res) => {
  res.send('SERVER OK');
});


app.use(cors());
app.use(express.json());

// /* 🔍 GLOBAL ROUTE DEBUG */
// app.use((req, _res, next) => {
//   console.log('[REQ]', req.method, req.originalUrl);
//   next();
// });

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/conversations', conversationsRoutes);
app.use('/messages', messagesRoutes);

export default app;
