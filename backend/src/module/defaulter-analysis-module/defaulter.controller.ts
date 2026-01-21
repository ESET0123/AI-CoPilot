import { Request, Response } from 'express';
import { DefaulterService } from './defaulter.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class DefaulterController {
    static getDashboardData = asyncHandler(async (req: Request, res: Response) => {
        const data = await DefaulterService.getDashboardData();
        res.json(data);
    });
}
