import { Router } from 'express';
import { TheftController } from '../controllers/theft.controller';

const router = Router();

router.get('/', TheftController.getDashboardData);

export default router;
