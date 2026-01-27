# Theft Detection Service

This service detects power theft and manages theft-related cases using an LLM-powered SQL agent and a conversational bot.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=8010
    HOST=0.0.0.0
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=gemma3:12b
    DB_PATH=utility.db
    ```

3.  **Start the Service**:
    ```bash
    python main.py
    ```

## API Endpoints

-   **Health Check**: `GET /health`
-   **Query**: `POST /api/v1/theft-detection/query`
    - Payload: `{"prompt": "your query", "model": "optional-model"}`
-   **Chat**: `POST /api/v1/theft-detection/chat`
    - Payload: `{"state": {}, "answer": "optional answer"}`
