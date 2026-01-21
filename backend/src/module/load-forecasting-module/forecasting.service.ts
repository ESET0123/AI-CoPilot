import { ForecastingRepository } from './forecasting.repository';

export class ForecastingService {
    private static randomFactor(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    private static applyRandomization(val: number, factorRange: [number, number] = [0.95, 1.05]): number {
        const factor = this.randomFactor(factorRange[0], factorRange[1]);
        return parseFloat((val * factor).toFixed(2));
    }

    static async getDashboardData() {
        const baseData = await ForecastingRepository.getDashboardData();

        return {
            stats: {
                ...baseData.stats,
                mape: this.applyRandomization(baseData.stats.mape),
                liveMape: this.applyRandomization(baseData.stats.liveMape),
                rmse: this.applyRandomization(baseData.stats.rmse),
                liveRmse: this.applyRandomization(baseData.stats.liveRmse),
                // noOfBlocks stays constant
            },
            dailyMape: baseData.dailyMape.map(item => ({
                ...item,
                value: this.applyRandomization(item.value, [0.8, 1.2])
            })),
            comparison: baseData.comparison.map(item => ({
                ...item,
                esyaModel: this.applyRandomization(item.esyaModel, [0.98, 1.02]),
                demand: this.applyRandomization(item.demand, [0.98, 1.02])
            }))
        };
    }
}
