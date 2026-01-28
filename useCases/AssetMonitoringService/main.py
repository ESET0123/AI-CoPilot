from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import re
import uvicorn
import os
import logging

from config import settings
from sql_agent import nl_to_sql
from database import run_sql
from humanizer import humanize_response

# ---- LOGGING SETUP ----
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("AssetMonitoringService")

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
        print(f"\n[SQL QUERY EXECUTED]: {clean_sql}\n")

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
