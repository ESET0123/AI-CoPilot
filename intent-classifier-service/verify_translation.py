import os
import asyncio
from app.modules.speech.engines.translation.indic_trans_engine import IndicTransEngine

# Mock logger to avoid import issues or complex setup
import app.core.logger
def mock_log(prefix, message, level="info"):
    print(f"[{level.upper()}] {prefix}: {message}")
app.core.logger.log_with_prefix = mock_log

async def test_translation():
    print("--- Starting IndicTrans2 Verification ---")
    
    # Check for HF_TOKEN
    token = os.getenv("HF_TOKEN")
    if not token:
        print("❌ HF_TOKEN is missing! Test will likely fail for gated models.")
    else:
        print("✅ HF_TOKEN found.")

    engine = IndicTransEngine()
    
    text = "Hello, how are you?"
    src = "eng_Latn"
    tgt = "hin_Deva" 
    
    print(f"\ninput: {text}")
    print(f"src: {src}, tgt: {tgt}")
    
    try:
        result = engine.translate(text, src, tgt)
        print(f"\n✅ Result: {result}")
        
        if result == text:
             print("⚠️ Warning: Output equals input. Translation might have failed silently or model not loaded.")
        else:
             print("🎉 Translation seems to have worked!")
             
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")

if __name__ == "__main__":
    # Ensure env vars are loaded if needed, but assuming they are in the shell context or .env
    # For this script, we'll assume the user runs it in an env where .env is loaded or we load it.
    from dotenv import load_dotenv
    load_dotenv()
    
    asyncio.run(test_translation())
