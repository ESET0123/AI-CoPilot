from fastapi import APIRouter, UploadFile, File, Form
from app.core.logger import log_with_prefix
import os
import subprocess
import json
import tempfile

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    method: str = Form("google-webkit"),
    language: str = Form(None)
):
    """Transcribe audio using specified method"""
    
    log_with_prefix("Transcribe", f"Starting transcription request")
    log_with_prefix("Transcribe", f"Method: {method}, Language: {language}")
    log_with_prefix("Transcribe", f"File: {file.filename}, Size: {file.size} bytes")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name
    
    log_with_prefix("Transcribe", f"Saved temp file: {temp_path}")
    
    try:
        if method == "review":
            log_with_prefix("Transcribe", "Using REVIEW method (Whisper + Translation)")
            script_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "speech_recognition", "stt-Review", "scripts", "transcribe.py")
            result = run_python_script(script_path, temp_path, language)
            
            # If translation needed, run translate script
            if result.get("detected_language") and result["detected_language"] != "en":
                log_with_prefix("Transcribe", f"Detected language: {result['detected_language']}, translating to English")
                translate_script = os.path.join(os.path.dirname(__file__), "..", "..", "..", "speech_recognition", "stt-Review", "scripts", "translate.py")
                translate_result = run_translate_script(translate_script, result["text"], result["detected_language"])
                if "translated_text" in translate_result:
                    result["translated_text"] = translate_result["translated_text"]
                    log_with_prefix("Transcribe", f"Translation completed: {len(translate_result['translated_text'])} chars")
            
        elif method == "translate-direct":
            log_with_prefix("Transcribe", "Using TRANSLATE-DIRECT method (Whisper Direct Translation)")
            script_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "speech_recognition", "SttTranslate-Direct", "transcribe_direct.py")
            result = run_python_script(script_path, temp_path, language)
            
        else:
            log_with_prefix("Transcribe", f"Invalid method: {method}")
            result = {"error": f"Invalid method: {method}"}
            
        if "error" in result:
            log_with_prefix("Transcribe", f"Error: {result['error']}")
            return {"error": result["error"]}
        
        text = result.get("text", result.get("translated_text", ""))
        log_with_prefix("Transcribe", f"Success: {len(text)} characters transcribed")
        log_with_prefix("Transcribe", f"Result: {text[:100]}{'...' if len(text) > 100 else ''}")
        
        return {"text": text}
        
    finally:
        # Clean up temp file
        os.unlink(temp_path)
        log_with_prefix("Transcribe", "Cleaned up temp file")

def run_python_script(script_path: str, file_path: str, language: str = None):
    """Run a Python script and return JSON result"""
    log_with_prefix("ScriptRunner", f"🔧 Running script: {os.path.basename(script_path)}")
    log_with_prefix("ScriptRunner", f"📁 File: {file_path}, Language: {language}")
    
    cmd = ["python", script_path, file_path]
    if language:
        cmd.append(language)
    
    log_with_prefix("ScriptRunner", f"⚡ Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(script_path))
        log_with_prefix("ScriptRunner", f"📊 Exit code: {result.returncode}")
        
        if result.returncode == 0:
            log_with_prefix("ScriptRunner", "✅ Script executed successfully")
            return json.loads(result.stdout.strip())
        else:
            log_with_prefix("ScriptRunner", f"❌ Script failed: {result.stderr.strip()}")
            return {"error": result.stderr.strip()}
    except Exception as e:
        log_with_prefix("ScriptRunner", f"💥 Exception: {str(e)}")
        return {"error": str(e)}

def run_translate_script(script_path: str, text: str, from_lang: str):
    """Run translate script"""
    log_with_prefix("Translator", f"🌐 Translating from {from_lang} to English")
    log_with_prefix("Translator", f"📝 Text length: {len(text)} chars")
    
    cmd = ["python", script_path, text, from_lang, "en"]
    
    log_with_prefix("Translator", f"⚡ Command: python {os.path.basename(script_path)} [text] {from_lang} en")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=os.path.dirname(script_path))
        log_with_prefix("Translator", f"📊 Exit code: {result.returncode}")
        
        if result.returncode == 0:
            log_with_prefix("Translator", "✅ Translation completed")
            return json.loads(result.stdout.strip())
        else:
            log_with_prefix("Translator", f"❌ Translation failed: {result.stderr.strip()}")
            return {"error": result.stderr.strip()}
    except Exception as e:
        log_with_prefix("Translator", f"💥 Exception: {str(e)}")
        return {"error": str(e)}