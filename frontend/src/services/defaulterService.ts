import { axiosClient } from './axiosClient';

export interface DefaulterStats {
    predictedDefaulters: number;
    predictedDefaultersTrend: number;
    arrearsAtRisk: number;
    arrearsAtRiskTrend: number;
    actionsDueToday: number;
    actionsDueTodayTrend: number;
}

export interface DefaulterPredictionTrendData {
    labels: string[];
    actual: number[];
    predicted: number[];
}

export interface RiskBandDistributionData {
    labels: string[];
    data: number[];
    colors: string[];
}

export interface DefaulterDashboardData {
    stats: DefaulterStats;
    charts: {
        defaulterPredictionTrend: DefaulterPredictionTrendData;
        riskBandDistribution: RiskBandDistributionData;
    };
}

export const defaulterService = {
    getDashboardData: async (): Promise<DefaulterDashboardData> => {
        const response = await axiosClient.get('/api/defaulter');
        return response.data;
    }
};
