import { Router } from 'express';
import { ForecastingController } from './forecasting.controller';

const router = Router();

router.get('/', ForecastingController.getDashboardData);

export default router;
