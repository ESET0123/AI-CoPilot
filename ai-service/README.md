# AI Chat Service

This is the core AI engine for the chatbot application. It provides chat processing, data analysis, and audio transcription services using FastAPI and Python.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- FFmpeg (required for audio transcription)

### Installation
1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example`.

### Running the Service
```bash
python main.py
```
The service will start on `http://127.0.0.1:8001` with auto-reload enabled.

---

## 🔌 API Endpoints

### Chat Service

#### 1. Chat (POST `/api/chat`)
The primary endpoint for processing user queries.

**Example Request**:
```json
{
  "message": "How many meters are there",
  "model_type": "local",
  "user_role": "admin"
}
```

**Example Response**:
```json
{
  "role": "assistant",
  "type": "data",
  "content": "The data indicates a count of 5.",
  "intent": "METER_COUNT",
  "data": { "rows": [{"count": 5}] },
  "sql": "SELECT COUNT(DISTINCT meter_id) FROM meter_users;",
  "insight": {
    "summary": "The data indicates a count of 5.",
    "visualization_type": "table",
    "x_column": null,
    "y_column": "count"
  },
  "plot_json": null
}
```

#### 3. Stop Generation (POST `/stop`)
Interrupts an active generation for a specific conversation.

**Example Request**:
```json
{
  "conversation_id": "8a3b2-..."
}
```

**Example Response**:
```json
{
  "message": "Stop signal received"
}
```

### Audio Service

#### 1. Transcription (POST `/api/transcribe`)
Converts audio recordings to text.

**Request**: `multipart/form-data` with a `file` field.

**Example Response**:
```json
{
  "text": "The transcribed text content"
}
```

---

## 🏗 Project Structure

- `app/`: Main application logic
  - `routers/`: API route definitions (chat, audio, system)
  - `services/`: Business logic (chat processing, transcription)
  - `models/`: Pydantic models for request/response validation
- `modules/`: Core modules for AI processing and formatting
- `models/`: Local machine learning models or weights
- `main.py`: Entry point and server configuration
- `COMPATIBILITY_GUIDE.md`: Details on the logic used to bridge structure responses to the legacy frontend

## ⚙ Technology Stack
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Pandas/Numpy**: Data manipulation
- **NLTK/Spacy**: Natural language processing
- **FFmpeg**: Audio processing
