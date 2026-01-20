export class DefaulterRepository {
    static async getStats() {
        // In a real scenario, this would be a DB query
        return {
            predictedDefaulters: 18243,
            predictedDefaultersTrend: -5.2,
            arrearsAtRisk: 12.4,
            arrearsAtRiskTrend: 8.1,
            actionsDueToday: 342,
            actionsDueTodayTrend: -3.1
        };
    }

    static async getChartData() {
        return {
            defaulterPredictionTrend: {
                labels: ['Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan'],
                actual: [14000, 18000, 19500, 17000, 15000, 13500],
                predicted: [14500, 17500, 19000, 17500, 15500, 14000]
            },
            riskBandDistribution: {
                labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                data: [32, 43, 25],
                colors: ['#f87171', '#fbbf24', '#a3e635']
            }
        };
    }
}
