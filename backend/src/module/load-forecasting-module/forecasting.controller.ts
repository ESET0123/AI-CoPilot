import { Request, Response } from 'express';
import { ForecastingService } from './forecasting.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class ForecastingController {
    static getDashboardData = asyncHandler(async (req: Request, res: Response) => {
        const data = await ForecastingService.getDashboardData();
        res.json(data);
    });
}
