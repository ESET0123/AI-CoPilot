import { TheftRepository } from './theft.repository';

export class TheftService {
    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private static randomizeArray(arr: number[], min: number, max: number): number[] {
        return arr.map(() => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    static async getDashboardData() {
        const stats = await TheftRepository.getStats();
        const baseCharts = await TheftRepository.getChartData();

        // Business logic: Randomize for demonstration purposes
        // In a real app, this might involve complex calculations, filtering, or combining multiple repository calls.
        return {
            stats: {
                ...stats,
                suspectedCases: this.randomInt(300000, 500000),
                casesWithoutTheft: this.randomInt(400, 800),
                casesWithTheft: this.randomInt(10000, 30000),
                theftRate: this.randomInt(400, 800),
                totalAmount: this.randomInt(300000, 500000),
                highestAmount: this.randomInt(10000, 30000),
                pendingCases: this.randomInt(0, 50),
                pendingPanchnama: this.randomInt(0, 50)
            },
            charts: {
                caseCheckedVsConfirmed: {
                    ...baseCharts.caseCheckedVsConfirmed,
                    consumption: this.randomizeArray(baseCharts.caseCheckedVsConfirmed.consumption, 10, 40),
                    consumerCount: this.randomizeArray(baseCharts.caseCheckedVsConfirmed.consumerCount, 0, 50)
                },
                casesByDivision: {
                    ...baseCharts.casesByDivision,
                    consumption: this.randomizeArray(baseCharts.casesByDivision.consumption, 10, 40),
                    consumerCount: this.randomizeArray(baseCharts.casesByDivision.consumerCount, 0, 50)
                },
                theftByCaseType: {
                    ...baseCharts.theftByCaseType,
                    data: [this.randomInt(80, 95), this.randomInt(5, 20)]
                },
                caseStatusDistribution: {
                    ...baseCharts.caseStatusDistribution,
                    data: [this.randomInt(80, 95), this.randomInt(5, 20)]
                },
                assessedLossByCycle: {
                    ...baseCharts.assessedLossByCycle,
                    consumption: this.randomizeArray(baseCharts.assessedLossByCycle.consumption, 0, 40)
                },
                panchnamaBilling: {
                    ...baseCharts.panchnamaBilling,
                    consumption: this.randomizeArray(baseCharts.panchnamaBilling.consumption, 300, 800)
                },
                theftIntensityByZone: {
                    ...baseCharts.theftIntensityByZone,
                    consumption: this.randomizeArray(baseCharts.theftIntensityByZone.consumption, 300, 800)
                }
            }
        };
    }
}
