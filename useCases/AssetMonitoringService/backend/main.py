from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import re
import uvicorn
import sqlite3
import os
import requests
import logging
from config import settings

# ---- LOGGING SETUP ----
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AssetMonitoringService")

# ---- LLM CLIENT ----
def call_ollama(model, system, user):
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    logger.info(f"Calling Ollama at {url} with model {model}")
    payload = {
        "model": model,
        "prompt": f"{system}\n\nUser request:\n{user}\n\nResponse:",
        "stream": False
    }
    try:
        r = requests.post(url, json=payload, timeout=300)
        if r.status_code != 200:
            logger.error(f"Ollama error {r.status_code}: {r.text}")
            raise Exception(f"Ollama error {r.status_code}: {r.text}")
        logger.info("Ollama call successful")
        return r.json()["response"].strip()
    except Exception as e:
        logger.exception("LLM Call Failed")
        raise Exception(f"LLM Call Failed: {e}")

# ---- SQL AGENT PROMPTS ----
SQL_SYSTEM_PROMPT = """
You are a SQLite SQL generator for a Distribution Transformer (DT) analysis bot.
 
RULES:
- Output ONLY raw SQLite SQL (no markdown, no backticks, no explanations)
- Read-only queries only (SELECT)
- Never use DELETE, DROP, UPDATE, INSERT, ALTER, PRAGMA
- Always use LIMIT for sample outputs (default LIMIT 20)
- Use column names EXACTLY as shown below
 
DATABASE SCHEMA:
 
Table: dt_status (Contains transformer overload/underload status)
Columns (4):
  • msn_id (TEXT) - Meter Serial Number of the Transformer (DTR)
  • total_days (INTEGER) - Total days observed
  • days_condition_1 (INTEGER) - Number of days the condition (overload) was met
  • classification (TEXT) - 'Overloaded' or 'Underloaded'
 
IMPORTANT:
- If asked about "overloaded" transformers, filter by `classification = 'Overloaded'`
- If asked about "underloaded" transformers, filter by `classification = 'Underloaded'`
- If asked for a count/number, use `COUNT(*)` or `COUNT(msn_id)`
- If asked for a list, select `msn_id` and maybe `days_condition_1`
 
REMEMBER:
- Only use columns that exist in the schema above
- Use EXACT column names
"""

def nl_to_sql(model, user_prompt):
    logger.info(f"Generating SQL for prompt: {user_prompt[:50]}...")
    return call_ollama(model, SQL_SYSTEM_PROMPT, user_prompt)

# ---- DB UTILS ----
def run_sql(query):
    logger.info(f"Executing SQL: {query}")
    db_path = os.path.join(os.path.dirname(__file__), settings.DB_PATH)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    try:
        cur.execute(query)
        rows = cur.fetchall()
        logger.info(f"SQL execution successful, returned {len(rows)} rows")
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        logger.exception("SQL execution failed")
        conn.close()
        raise e

# ---- HUMANIZER ----
HUMAN_SYSTEM_PROMPT = """
You are a helpful assistant for a Distribution Transformer analysis bot.
Your job is to take a User Question, a SQL Query that was run, and the Result Data, and generate a natural language response.

RULES:
- Be concise and friendly.
- Directly answer the question based on the data.
- If the result is a list, summarize it (e.g., "There are 5 transformers..." rather than listing all if too many).
- If the result is empty, say "I couldn't find any data matching that request."
- Do not mention "SQL" or "Database" or technical terms to the user. Just the facts.
"""

def humanize_response(model, question, sql, result):
    logger.info("Humanizing response...")
    user_prompt = f"""
    User Question: {question}
    SQL Query Run: {sql}
    Result Data: {result}
    
    Please provide a natural language answer.
    """
    return call_ollama(model, HUMAN_SYSTEM_PROMPT, user_prompt)

# ---- APP ----
app = FastAPI(title="Asset Monitoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api/v1/asset-monitoring")

class QueryReq(BaseModel):
    prompt: str

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting Asset Monitoring Service on {settings.HOST}:{settings.PORT}")

@app.get("/health")
def health():
    return {"status": "ok", "service": "asset-monitoring"}

@router.post("/query")
def query_endpoint(req: QueryReq):
    logger.info(f"Received query request: {req.prompt[:50]}...")
    try:
        model = settings.OLLAMA_MODEL
        
        # 1. Generate SQL
        raw_sql = nl_to_sql(model, req.prompt)
        
        # Clean SQL
        clean_sql = raw_sql.strip()
        clean_sql = re.sub(r"```.*?\n", "", clean_sql, flags=re.DOTALL)
        clean_sql = clean_sql.replace("```", "").replace("`", "")
        clean_sql = re.sub(r"^\s*sql\s*", "", clean_sql, flags=re.IGNORECASE).strip()
        
        logger.info(f"Cleaned SQL: {clean_sql}")

        # Safety
        banned = ["delete", "drop", "update", "insert", "alter", "pragma"]
        if any(b in clean_sql.lower() for b in banned):
             logger.warning(f"Unsafe SQL blocked: {clean_sql}")
             return {"success": False, "human_answer": "I cannot execute that query due to safety restrictions."}
        
        if ";" in clean_sql[:-1]:
             logger.warning(f"Complex SQL blocked: {clean_sql}")
             return {"success": False, "human_answer": "The query was too complex."}

        # 2. Run SQL
        data = run_sql(clean_sql)
        
        # 3. Humanize
        human_answer = humanize_response(model, req.prompt, clean_sql, data)
        
        logger.info("Query processing complete")
        return {
            "success": True,
            "human_answer": human_answer
        }

    except Exception as e:
        logger.exception("Error processing query request")
        return {
            "success": False,
            "human_answer": f"I encountered an error: {str(e)}"
        }

app.include_router(router)

# Serve frontend
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
if os.path.exists(frontend_path):
    logger.info(f"Mounting frontend from {frontend_path}")
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
