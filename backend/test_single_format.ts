
import { callAIService } from './src/utils/aiClient';

async function runTest() {
    console.log('--- STARTING SINGLE FORMAT TEST ---');

    const queries = [
        "What is the load forecast?",
        "Check for theft suspicion",
        "Hello there"
    ];

    for (const q of queries) {
        console.log(`\nTesting Query: "${q}"`);
        try {
            // Mock conversation ID
            const response = await callAIService({ conversationId: "test-convo", message: q });
            const parsed = JSON.parse(response);
            console.log("Response Text:", parsed.text);
            console.log("Extras:", parsed.extras);
        } catch (e: any) {
            console.error("ERROR:", e.message);
        }
    }
}

runTest();
