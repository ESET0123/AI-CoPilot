# LLM Service

A Python-based service for Intent Classification and other LLM tasks.

## Prerequisites

- **Python** (3.8+)
- **Ollama** (Running locally or accessible via network)

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Model Setup:**
    Ensure required models are pulled in Ollama (e.g., `llama3` or `gpt-oss:120b-cloud` depending on configuration).

## Running the Service

Start the service using the main script:
```bash
python main.py
```
The service will start on **port 8002**.

## API Endpoints

The service primarily handles intent classification requests from the backend.
