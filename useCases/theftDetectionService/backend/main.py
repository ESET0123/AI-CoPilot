from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import sqlite3
import re
import uvicorn
import os
import logging

from config import settings
from sql_agent import nl_to_sql
from database import run_sql
from humanizer import humanize_response
from case_flow import bot_step

# ---- LOGGING SETUP ----
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TheftDetectionService")

app = FastAPI(title="Theft Detection Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api/v1/theft-detection")

class QueryReq(BaseModel):
    prompt: str

class BotReq(BaseModel):
    state: dict
    answer: str | None = None

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting Theft Detection Service on {settings.HOST}:{settings.PORT}")

@app.get("/health")
def health():
    return {"status": "ok", "service": "theft-detection"}

@router.post("/query")
def query_endpoint(req: QueryReq):
    logger.info(f"Received query request: {req.prompt[:50]}...")
    
    clean_sql = None
    try:
        model = settings.OLLAMA_MODEL
        
        # 1. Generate SQL
        raw_sql = nl_to_sql(model, req.prompt)
        
        # ---- CLEAN MODEL OUTPUT ----
        clean_sql = raw_sql.strip()
        clean_sql = re.sub(r"```.*?\n", "", clean_sql, flags=re.DOTALL)
        clean_sql = clean_sql.replace("```", "")
        clean_sql = re.sub(r"^\s*sql\s*", "", clean_sql, flags=re.IGNORECASE)
        clean_sql = clean_sql.replace("`", "")
        clean_sql = clean_sql.encode("utf-8", "ignore").decode("utf-8").strip()
        
        logger.info(f"Cleaned SQL: {clean_sql}")
        print(f"\n[SQL QUERY EXECUTED]: {clean_sql}\n")
        
        # ---- SAFETY CHECKS ----
        banned = ["delete", "drop", "update", "insert", "alter", "pragma"]
        sql_lower = clean_sql.lower()
        if any(b in sql_lower for b in banned):
            logger.warning(f"Unsafe SQL blocked: {clean_sql}")
            return {
                "success": False,
                "human_answer": "I cannot execute that query due to safety restrictions.",
                "sql": clean_sql
            }
        
        if ";" in clean_sql.strip()[:-1]:
            logger.warning(f"Complex SQL blocked: {clean_sql}")
            return {
                "success": False,
                "human_answer": "The query was too complex.",
                "sql": clean_sql
            }
        
        # 2. Execute the query
        data = run_sql(clean_sql)
        
        # 3. Humanize response
        human_answer = humanize_response(model, req.prompt, clean_sql, data)

        return {
            "success": True,
            "sql": clean_sql,
            "human_answer": human_answer,
            "result": data,
            "error": None
        }
        
    except Exception as e:
        logger.exception("Error processing query request")
        error_msg = str(e)
        return {
            "success": False,
            "human_answer": f"I encountered an error: {error_msg}",
            "sql": clean_sql
        }

@router.post("/chat")
def chat_endpoint(req: BotReq):
    logger.info("Received chat/case submission request")
    state = req.state.copy()
    answer = req.answer

    if answer == "Confirm & Submit":
        case_id = f"UT-{uuid.uuid4().hex[:8].upper()}"
        logger.info(f"Submitting new case: {case_id}")
        db_path = os.path.join(os.path.dirname(__file__), settings.DB_PATH)
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        fields = []
        values = []

        for k, v in state.items():
            if k != "_last":
                fields.append(k)
                values.append(v)

        sql = f"""
        INSERT INTO utility_cases
        (case_id, {",".join(fields)})
        VALUES (?, {",".join("?" for _ in fields)})
        """

        try:
            cur.execute(sql, [case_id] + values)
            conn.commit()
            logger.info("Case submitted successfully to database")
        except Exception as e:
            logger.exception("Failed to submit case to database")
            raise e
        finally:
            conn.close()

        return {"message": f"Case submitted. ID: {case_id}", "done": True}

    if answer:
        last = state.get("_last")
        if last:
            state[last] = answer
            del state["_last"]

    logger.info("Advancing bot conversation step")
    bot = bot_step(state)
    state["_last"] = bot["field"]

    return {
        "message": bot["message"],
        "options": bot["options"],
        "state": state,
        "done": False
    }

app.include_router(router)

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)