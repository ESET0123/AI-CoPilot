import { callAIService } from './src/utils/aiClient';

async function test() {
    console.log("Testing callAIService integration...");
    try {
        const payload = {
            conversationId: "test-convo-123",
            message: "What is the load forecast for tomorrow?"
        };

        const response = await callAIService(payload);
        console.log("Response:", response);

        const parsed = JSON.parse(response);
        if (parsed.text.includes("Intent: LOAD_FORECASTING")) {
            console.log("SUCCESS: Correct intent received.");
        } else {
            console.log("FAILURE: Unexpected response text.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
