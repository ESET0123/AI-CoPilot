# Theft Detection Service

A FastAPI-based Python microservice responsible for handling theft detection queries using natural language processing (Text-to-SQL).

## Prerequisites

- **Python** (3.8+)
- **Ollama** running locally (Port 11434 by default)
- **Ollama Model**: `gpt-oss:120b-cloud` (or configure a different model in `main.py`/`sql_agent.py`)

## Setup

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Database:**
    The service uses a local SQLite database (`utility.db`). Ensure it is initialized. Use `init_db.py` if needed.
    ```bash
    python init_db.py
    ```

3.  **Environment Variables:**
    Optionally set `OLLAMA_BASE_URL` if your Ollama instance is not on `localhost:11434`.

## Running the Service

Run the service using `uvicorn`:
```bash
uvicorn main:app --reload --port 8010
```
-   **Port:** 8010
-   **Swagger UI:** [http://localhost:8010/docs](http://localhost:8010/docs)

## Key Files

-   `main.py`: FastAPI entry point and logic.
-   `sql_agent.py`: Handles Natural Language to SQL conversion via Ollama.
-   `utility.db`: SQLite database file.
