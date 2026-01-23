import { Router } from 'express';
import { TTSController } from '../controllers/tts.controller';
import { validateBody } from '../middleware/validation';
import { ttsSchema } from '../utils/validation';

const router = Router();
const ttsController = new TTSController();

router.post('/', validateBody(ttsSchema), (req, res) => ttsController.handleSynthesis(req, res));

export default router;
