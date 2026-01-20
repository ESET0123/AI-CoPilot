import { DUMMY_THEFT_DATA } from '../utils/dummy_theft_data';

export class TheftRepository {
    static async getStats() {
        // In a real scenario, this would be a DB query
        return {
            suspectedCases: 400000,
            casesWithoutTheft: 600,
            casesWithTheft: 20000,
            theftRate: 600,
            totalAmount: 400000,
            highestAmount: 20000,
            pendingCases: 25,
            pendingPanchnama: 25
        };
    }

    static async getChartData() {
        return DUMMY_THEFT_DATA.charts;
    }
}
