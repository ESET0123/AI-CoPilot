import { DefaulterRepository } from './defaulter.repository';

export class DefaulterService {
    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static randomFloat(min: number, max: number, decimals: number = 1): number {
        const value = Math.random() * (max - min) + min;
        return parseFloat(value.toFixed(decimals));
    }

    private static randomizeArray(arr: number[], min: number, max: number): number[] {
        return arr.map(() => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    static async getDashboardData() {
        const stats = await DefaulterRepository.getStats();
        const baseCharts = await DefaulterRepository.getChartData();

        // Business logic: Randomize for demonstration purposes
        // In a real app, this might involve complex calculations, filtering, or combining multiple repository calls.
        return {
            stats: {
                ...stats,
                predictedDefaulters: this.randomInt(15000, 22000),
                predictedDefaultersTrend: this.randomFloat(-8, 5, 1),
                arrearsAtRisk: this.randomFloat(10, 15, 1),
                arrearsAtRiskTrend: this.randomFloat(-5, 10, 1),
                actionsDueToday: this.randomInt(250, 450),
                actionsDueTodayTrend: this.randomFloat(-5, 5, 1)
            },
            charts: {
                defaulterPredictionTrend: {
                    ...baseCharts.defaulterPredictionTrend,
                    actual: this.randomizeArray(baseCharts.defaulterPredictionTrend.actual, 12000, 20000),
                    predicted: this.randomizeArray(baseCharts.defaulterPredictionTrend.predicted, 12000, 20000)
                },
                riskBandDistribution: {
                    ...baseCharts.riskBandDistribution,
                    data: [
                        this.randomInt(20, 35),
                        this.randomInt(35, 50),
                        this.randomInt(20, 35)
                    ]
                }
            }
        };
    }
}
