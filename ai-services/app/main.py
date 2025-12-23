from fastapi import FastAPI
from app.schemas import ChatRequest, ChatResponse
from app.services import handle_chat
from app.db import get_conn

app = FastAPI(title="AI Service")

# ================= CHAT ENDPOINT =================

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    return handle_chat(req)

# ================= DB HEALTH CHECK =================

@app.get("/health/db")
def db_health():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1;")
        cur.fetchone()
        conn.close()
        return {"db": "connected"}
    except Exception as e:
        return {"db": "error", "detail": str(e)}
