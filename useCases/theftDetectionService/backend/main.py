from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import sqlite3
import re

from sql_agent import nl_to_sql
from db import run_sql
from case_flow import bot_step

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryReq(BaseModel):
    prompt: str
    model: str

class BotReq(BaseModel):
    state: dict
    answer: str | None = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/theftDetection/query")
def query(req: QueryReq):
    raw_sql = None
    clean_sql = None
    
    try:
        # Generate SQL from natural language
        # Hardcoded model for theft detection
        raw_sql = nl_to_sql("gpt-oss:120b-cloud", req.prompt)
        
        # ---- CLEAN MODEL OUTPUT ----
        clean_sql = raw_sql.strip()
        
        # Remove fenced code blocks ```sql ... ```
        clean_sql = re.sub(r"```.*?\n", "", clean_sql, flags=re.DOTALL)
        clean_sql = clean_sql.replace("```", "")
        
        # Remove leading 'sql' keyword
        clean_sql = re.sub(r"^\s*sql\s*", "", clean_sql, flags=re.IGNORECASE)
        
        # Remove backticks
        clean_sql = clean_sql.replace("`", "")
        
        # Handle encoding issues
        clean_sql = clean_sql.encode("utf-8", "ignore").decode("utf-8")
        clean_sql = clean_sql.strip()
        
        print("🧠 RAW MODEL OUTPUT:\n", raw_sql)
        print("🧹 CLEAN SQL:\n", clean_sql)
        
        # ---- SAFETY CHECKS ----
        banned = ["delete", "drop", "update", "insert", "alter", "pragma"]
        
        sql_lower = clean_sql.lower()
        if any(b in sql_lower for b in banned):
            return {
                "success": False,
                "error": "Unsafe SQL blocked (read-only enforced)",
                "sql": clean_sql,
                "raw_sql": raw_sql,
                "result": None
            }
        
        # SQLite only allows one statement at a time
        if ";" in clean_sql.strip()[:-1]:
            return {
                "success": False,
                "error": "Multiple SQL statements detected. Only one SELECT is allowed.",
                "sql": clean_sql,
                "raw_sql": raw_sql,
                "result": None
            }
        
        # Execute the query
        data = run_sql(clean_sql)
        
        return {
            "success": True,
            "sql": clean_sql,
            "raw_sql": raw_sql,
            "result": data,
            "error": None
        }
        
    except Exception as e:
        error_msg = str(e)
        
        # Add helpful error messages
        if "no such column" in error_msg.lower():
            error_msg += "\n\nTip: The column doesn't exist. Try asking 'show columns' to see available fields."
        elif "no such table" in error_msg.lower():
            error_msg += "\n\nAvailable tables: historical_cases, utility_cases"
        
        return {
            "success": False,
            "error": error_msg,
            "sql": clean_sql,
            "raw_sql": raw_sql,
            "result": None
        }

@app.post("/chat")
def chat(req: BotReq):
    state = req.state.copy()
    answer = req.answer

    if answer == "Confirm & Submit":
        case_id = f"UT-{uuid.uuid4().hex[:8].upper()}"
        conn = sqlite3.connect("utility.db")
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

        cur.execute(sql, [case_id] + values)
        conn.commit()
        conn.close()

        return {"message": f"Case submitted. ID: {case_id}", "done": True}

    if answer:
        last = state.get("_last")
        if last:
            state[last] = answer
            del state["_last"]

    bot = bot_step(state)
    state["_last"] = bot["field"]

    return {
        "message": bot["message"],
        "options": bot["options"],
        "state": state,
        "done": False
    }