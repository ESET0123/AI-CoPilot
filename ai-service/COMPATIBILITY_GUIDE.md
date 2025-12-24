# ai-services-3 Compatibility Guide

## Overview

`ai-services-3` has been successfully adapted to work as a **drop-in replacement** for `ai-services-2` with **zero changes** required to the frontend or backend code.

## Architecture

### Compatibility Layer

The implementation follows SOLID principles by introducing a separate compatibility layer rather than modifying core logic:

```
ai-services-3/
├── main.py                          # Added legacy endpoints
├── modules/
│   ├── compatibility_layer.py       # NEW: Format conversion
│   ├── llm_router.py               # Modified: Cancellation support
│   ├── db_manager.py               # Unchanged
│   └── forecasting_engine.py       # Unchanged
```

### Key Components

#### 1. **compatibility_layer.py** (NEW)
- `LegacyResponseFormatter`: Converts ai-services-3 responses to ai-service-2 format
- `NumpyEncoder`: Handles JSON serialization of NumPy/Pandas types
- `sanitize_dataframe_for_json()`: Prepares DataFrames for JSON output

#### 2. **main.py** (MODIFIED)
- Added `/chat` endpoint (legacy compatibility)
- Added `/stop` endpoint (cancellation support)
- Added conversation cancellation tracking
- Changed port to **8001** (same as ai-service-2)
- **Preserved** all existing `/api/*` endpoints

#### 3. **llm_router.py** (MODIFIED)
- Added `cancel_event` parameter to LLM calls
- Supports graceful cancellation during API requests

## Endpoints

### Legacy Endpoints (ai-service-2 compatible)

#### POST `/chat`
**Request:**
```json
{
  "conversation_id": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "content": "{\"text\": \"...\", \"type\": \"...\", \"data\": [...], \"extras\": {...}}"
}
```

#### POST `/stop`
**Request:**
```json
{
  "conversation_id": "string"
}
```

**Response:**
```json
{
  "message": "Stop signal registered"
}
```

### Modern Endpoints (preserved for future use)

- `POST /api/chat` - Modern chat interface
- `POST /api/transcribe` - Speech-to-text (ready for future integration)
- `POST /api/login` - Authentication
- `GET /api/health` - Health check

## Response Format Mapping

### ai-services-3 Internal Format
```python
ChatResponse(
    content="Summary text",
    intent="SQL_QUERY",
    data=[...],
    sql="SELECT ...",
    insight={...}
)
```

### ai-service-2 Compatible Format
```json
{
  "content": "{
    \"text\": \"Summary text\",
    \"type\": \"sql\",
    \"data\": [...],
    \"extras\": {\"sql\": \"SELECT ...\"}
  }"
}
```

## Response Types

The compatibility layer supports all ai-service-2 response types:

| Type | Description | When Used |
|------|-------------|-----------|
| `text` | Plain text response | General queries, greetings |
| `sql` | SQL query results | Database queries |
| `table` | Tabular data | Data without visualization |
| `chart` | Chart visualization | Time series, trends |
| `error` | Error message | Failures, exceptions |

## Migration Guide

### Starting ai-services-3

1. **Stop ai-service-2** (if running on port 8001)
   ```bash
   # Find and stop the process on port 8001
   ```

2. **Start ai-services-3**
   ```bash
   cd ai-services-3
   python main.py
   ```

3. **Verify startup**
   - Should see: "Loading Local Whisper Model..."
   - Should see: "Whisper Model Loaded."
   - Server running on: `http://127.0.0.1:8001`

### Testing

#### Quick Health Check
```bash
curl http://localhost:8001/api/health
```

#### Test Legacy Chat Endpoint
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "message": "What is the total load?"
  }'
```

#### Test Stop Endpoint
```bash
curl -X POST http://localhost:8001/stop \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": "test-123"}'
```

### Rollback Plan

If issues occur, simply:
1. Stop ai-services-3
2. Restart ai-service-2 on port 8001
3. No frontend/backend changes needed

## Features Preserved

✅ **All ai-services-3 features maintained:**
- Intent classification (SQL_QUERY vs REVENUE_FORECAST)
- SQL generation with LLM
- Revenue forecasting
- Data analysis and insights
- Visualization recommendations
- Speech-to-text (for future use)

✅ **All ai-service-2 features supported:**
- Conversation tracking
- Request cancellation
- Chart/table rendering
- Error handling
- Response format compatibility

## Code Quality

### SOLID Principles Applied

- **Single Responsibility**: `compatibility_layer.py` handles only format conversion
- **Open/Closed**: Extended functionality without modifying core modules
- **Liskov Substitution**: ai-services-3 can replace ai-service-2 seamlessly
- **Interface Segregation**: Legacy and modern endpoints separated
- **Dependency Inversion**: Compatibility layer depends on abstractions

### Modularity

- Core logic unchanged in `llm_router.py`, `db_manager.py`, `forecasting_engine.py`
- Compatibility layer is isolated and can be removed if needed
- All changes are additive, not destructive

## Future Enhancements

The architecture supports easy integration of:
- Speech-to-text via `/api/transcribe`
- Role-based access control via `/api/login`
- Modern frontend using `/api/chat`
- Gradual migration from legacy to modern endpoints

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8001
kill -9 <PID>
```

### Import Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Database Not Found
Check that `ai-services-3/data/data.db` exists. If not, run your data generation script.

## Summary

ai-services-3 now provides:
- ✅ Full backward compatibility with ai-service-2
- ✅ Zero changes to frontend/backend
- ✅ Preserved all existing functionality
- ✅ Clean, modular architecture
- ✅ Ready for future enhancements (STT, auth, etc.)
