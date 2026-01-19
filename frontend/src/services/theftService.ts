import { axiosClient } from './axiosClient';

export interface TheftStats {
    suspectedCases: number;
    casesWithoutTheft: number;
    casesWithTheft: number;
    theftRate: number;
    totalAmount: number;
    highestAmount: number;
    pendingCases: number;
    pendingPanchnama: number;
}

export interface ChartData {
    labels: string[];
    consumption?: number[];
    consumerCount?: number[];
    data?: number[]; // For pie chart
}

export interface TheftDashboardData {
    stats: TheftStats;
    charts: {
        caseCheckedVsConfirmed: ChartData;
        casesByDivision: ChartData;
        theftByCaseType: ChartData;
        caseStatusDistribution: ChartData;
        assessedLossByCycle: ChartData;
        panchnamaBilling: ChartData;
        theftIntensityByZone: ChartData;
    };
}

export const theftService = {
    getDashboardData: async (): Promise<TheftDashboardData> => {
        const response = await axiosClient.get('/api/theft');
        return response.data;
    }
};
