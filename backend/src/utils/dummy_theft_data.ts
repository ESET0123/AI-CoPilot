export const DUMMY_THEFT_DATA = {
    stats: {
        suspectedCases: 401008,
        casesWithoutTheft: 598,
        casesWithTheft: 21562,
        theftRate: 598,
        totalAmount: 401008,
        highestAmount: 21562,
        pendingCases: 0,
        pendingPanchnama: 0
    },
    charts: {
        caseCheckedVsConfirmed: {
            labels: ['29th', '28th', '27th', '26th', '25th', '24th', '23rd', '22nd', '21st', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd'],
            consumption: [28, 15, 38, 10, 12, 20, 22, 19, 19, 22, 20, 25, 25, 25, 25, 25, 25, 25, 25],
            consumerCount: [0, 0, 0, 42, 26, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 37, 0, 0]
        },
        casesByDivision: {
            labels: ['29th', '28th', '27th', '26th', '25th', '24th', '23rd', '22nd', '21st', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd'],
            consumption: [28, 15, 38, 10, 12, 20, 22, 19, 19, 22, 20, 25, 25, 25, 25, 25, 25, 25, 25],
            consumerCount: [0, 0, 0, 42, 26, 0, 0, 0, 0, 0, 40, 0, 0, 0, 0, 0, 37, 0, 0]
        },
        theftByCaseType: {
            labels: ['Abnormal Consumption', 'Other'],
            data: [91, 9]
        },
        caseStatusDistribution: {
            labels: ['Resolved', 'Pending'],
            data: [91, 9]
        },
        assessedLossByCycle: {
            labels: ['29th', '28th', '27th', '26th', '25th', '24th', '23rd', '22nd', '21st', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd', '20nd'],
            consumption: [0, 0, 0, 25, 22, 22, 0, 0, 0, 28, 28, 0, 0, 0, 0, 0, 28, 28, 0]
        },
        panchnamaBilling: {
            labels: ['29th', '27th', '25th', '23rd', '22nd', '21st', '19th', '17th', '15th', '13th', '11th', '9th', '7th', '5th', '3rd'],
            consumption: [150, 780, 450, 600, 720, 600, 500, 600, 550, 700, 600, 450, 700, 600, 720] // Using consumption field for general data
        },
        theftIntensityByZone: {
            labels: ['29th', '27th', '25th', '23rd', '22nd', '21st', '19th', '17th', '15th', '13th', '11th', '9th', '7th', '5th', '3rd'],
            consumption: [150, 780, 450, 600, 720, 600, 500, 600, 550, 700, 600, 450, 700, 600, 720]
        }
    }
};
