import logging
from llm_client import call_ollama

logger = logging.getLogger("AssetMonitoringService.Humanizer")

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

def humanize_response(model: str, question: str, sql: str, result: list):
    logger.info("Humanizing response...")
    user_prompt = f"""
    User Question: {question}
    SQL Query Run: {sql}
    Result Data: {result}
    
    Please provide a natural language answer.
    """
    return call_ollama(model, HUMAN_SYSTEM_PROMPT, user_prompt)
