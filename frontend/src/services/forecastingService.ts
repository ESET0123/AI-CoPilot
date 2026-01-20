import { axiosClient } from './axiosClient';

export interface ForecastStats {
    mape: number;
    liveMape: number;
    rmse: number;
    liveRmse: number;
    noOfBlocks: number;
    date: string;
}

export interface MapeData {
    day: string;
    value: number;
}

export interface ComparisonData {
    timestamp: string;
    esyaModel: number;
    demand: number;
}

export interface ForecastDashboardData {
    stats: ForecastStats;
    dailyMape: MapeData[];
    comparison: ComparisonData[];
}

export const forecastingService = {
    getDashboardData: async (): Promise<ForecastDashboardData> => {
        const response = await axiosClient.get('/api/forecasting');
        return response.data;
    }
};
