import { Router } from 'express';
import { DefaulterController } from './defaulter.controller';

const router = Router();

router.get('/', DefaulterController.getDashboardData);

export default router;
