from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn

import rag_search

app = FastAPI(title="AI Service")


class ChatRequest(BaseModel):
    conversationId: str
    message: str


class ChatResponse(BaseModel):
    content: str
    sources: List[str] = []


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    try:
        # Retrieve top relevant RAG chunks
        chunks = rag_search.retrieve_relevant_chunks(payload.message, top_k=5)

        # Very simple response synthesis: combine retrieved chunks and echo an answer.
        # Replace this block with an actual LLM call (OpenAI, local LLM, Frook, etc.)
        combined_context = "\n\n---\n\n".join(chunks)

        answer = (
            "I found the following relevant context from the knowledge base:\n\n"
            f"{combined_context}\n\n"
            "Based on the above, here is a concise answer to your question:\n"
            f"{payload.message}\n\n"
            "(This service currently returns a synthesized response using retrieved documents. "
            "To generate LLM-based answers, replace the synthesis block with a call to your LLM.)"
        )

        return ChatResponse(content=answer, sources=chunks)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    uvicorn.run("ai_service:app", host="0.0.0.0", port=8001, reload=False)
