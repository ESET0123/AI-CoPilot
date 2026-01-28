# Asset Monitoring Service

This service analyzes Distribution Transformer (DT) data to identify overloaded and underloaded transformers using an LLM-powered SQL agent.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=8001
    HOST=0.0.0.0
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=llama3.2
    DB_PATH=utility.db
    ```

3.  **Start the Service**:
    ```bash
    python main.py
    ```

## API Endpoints

-   **Health Check**: `GET /health`
-   **Query**: `POST /api/v1/asset-monitoring/query`
    - Payload: `{"prompt": "your query", "model": "optional-model"}`
