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
        // For now mocking the response since backend might not have this endpoint yet
        // In real scenario: const response = await axiosClient.get('/api/forecasting');

        return {
            stats: {
                mape: 2.03,
                liveMape: 2.26,
                rmse: 26.92,
                liveRmse: 26.33,
                noOfBlocks: 126,
                date: '18 January, 2026'
            },
            dailyMape: [
                { day: '21st', value: 5.1 },
                { day: '20nd', value: 3.2 },
                { day: '20nd', value: 4.5 },
                { day: '20nd', value: 4.9 },
                { day: '20nd', value: 4.1 },
                { day: '20nd', value: 3.8 },
                { day: '20nd', value: 4.3 },
                { day: '20nd', value: 5.2 },
                { day: '20nd', value: 3.9 },
                { day: '20nd', value: 4.8 },
                { day: '20nd', value: 3.5 },
                { day: '20nd', value: 4.7 }
            ],
            comparison: [
                { timestamp: '2026-01-19, 00:00:00', esyaModel: 400, demand: 450 },
                { timestamp: '2026-01-19, 01:00:00', esyaModel: 300, demand: 280 },
                { timestamp: '2026-01-19, 02:00:00', esyaModel: 150, demand: 120 },
                { timestamp: '2026-01-19, 03:00:00', esyaModel: 80, demand: 60 },
                { timestamp: '2026-01-19, 04:00:00', esyaModel: 100, demand: 90 },
                { timestamp: '2026-01-19, 05:00:00', esyaModel: 350, demand: 420 },
                { timestamp: '2026-01-19, 06:00:00', esyaModel: 550, demand: 520 },
                { timestamp: '2026-01-19, 07:00:00', esyaModel: 650, demand: 680 },
                { timestamp: '2026-01-19, 08:00:00', esyaModel: 880, demand: 920 },
                { timestamp: '2026-01-19, 09:00:00', esyaModel: 800, demand: 780 },
                { timestamp: '2026-01-19, 10:00:00', esyaModel: 680, demand: 650 },
                { timestamp: '2026-01-19, 11:00:00', esyaModel: 780, demand: 750 },
                { timestamp: '2026-01-19, 12:00:00', esyaModel: 620, demand: 580 },
                { timestamp: '2026-01-19, 13:00:00', esyaModel: 850, demand: 820 },
                { timestamp: '2026-01-19, 14:00:00', esyaModel: 750, demand: 720 },
                { timestamp: '2026-01-19, 15:00:00', esyaModel: 650, demand: 620 },
                { timestamp: '2026-01-19, 16:00:00', esyaModel: 520, demand: 480 },
                { timestamp: '2026-01-19, 17:00:00', esyaModel: 450, demand: 420 }
            ]
        };
    }
};
