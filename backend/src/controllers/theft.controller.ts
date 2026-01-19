import { Request, Response } from 'express';
import { TheftService } from '../services/theft.service';
import { asyncHandler } from '../utils/asyncHandler';

export class TheftController {
    static getDashboardData = asyncHandler(async (req: Request, res: Response) => {
        const data = await TheftService.getDashboardData();
        res.json(data);
    });
}
