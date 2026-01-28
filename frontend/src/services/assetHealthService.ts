export interface AssetHealthStats {
    overloadedCount: number;
    overloadedPercent: number;
    normalCount: number;
    normalPercent: number;
}

export interface RiskDistribution {
    name: string;
    value: number;
    color: string;
}

export interface AlertSummaryItem {
    severity: string;
    count: number;
    color: string;
}

export interface AssetAgingItem {
    id: string;
    serialNumber: string;
    agingLost: string;
}

export interface AssetHealthData {
    stats: AssetHealthStats;
    riskDistribution: RiskDistribution[];
    alerts: AlertSummaryItem[];
    activeAlerts: number;
    agingAssets: AssetAgingItem[];
}

export const assetHealthService = {
    getDashboardData: async (): Promise<AssetHealthData> => {
        // Mocking API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    stats: {
                        overloadedCount: 40,
                        overloadedPercent: 25,
                        normalCount: 120,
                        normalPercent: 75,
                    },
                    riskDistribution: [
                        { name: 'Low Risk', value: 32, color: '#4caf50' }, // success[5]
                        { name: 'Medium Risk', value: 45, color: '#ffc107' }, // warning[5]
                        { name: 'High Risk', value: 23, color: '#f44336' }, // error[5]
                    ],
                    alerts: [
                        { severity: 'Critical', count: 16255, color: '#ffebee' }, // error[0]
                        { severity: 'Major', count: 1255, color: '#fff8e1' }, // warning[0]
                        { severity: 'Minor', count: 155, color: '#e8f5e9' }, // success[0]
                        { severity: 'Warning', count: 1025, color: '#fff3e0' }, // orange[0]
                    ],
                    activeAlerts: 6504,
                    agingAssets: [
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                        { id: 'FAA-102832', serialNumber: '126121839', agingLost: '0 months, 21 days lost' },
                    ]
                });
            }, 500);
        });
    }
};
