import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { MessagesController } from '../controllers/messages.controller';

const router = Router();

router.use(requireAuth);

router.get('/:conversationId', MessagesController.list);
router.post('/', MessagesController.send);
router.patch('/:messageId', MessagesController.edit);

export default router;
