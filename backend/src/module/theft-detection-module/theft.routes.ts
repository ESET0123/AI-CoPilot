import { Router } from 'express';
import { TheftController } from './theft.controller';

const router = Router();

router.get('/', TheftController.getDashboardData);

export default router;
