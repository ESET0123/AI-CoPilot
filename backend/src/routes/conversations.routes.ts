import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { ConversationsController } from '../controllers/conversations.controller';

const router = Router();

router.use(requireAuth);

router.get('/', ConversationsController.list);
router.post('/', ConversationsController.create);
router.delete('/:id', ConversationsController.delete);
router.delete('/', ConversationsController.deleteAll);

export default router;
