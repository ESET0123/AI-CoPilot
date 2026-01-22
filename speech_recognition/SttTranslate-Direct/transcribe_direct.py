import sys
import os
import json
import traceback

# Add current directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def transcribe_direct(file_path, language=None):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return {"error": "faster_whisper module not found. Please install it with 'pip install faster-whisper'"}

    try:
        model_name = "large-v3"
        
        # Load model (CPU)
        model = WhisperModel(model_name, device="cpu", compute_type="int8")

        # Prepare transcription parameters for direct translation
        transcribe_params = {
            "beam_size": 5,
            "task": "translate" # Key difference: Directly translate to English
        }
        
        if language and language != 'auto':
            transcribe_params["language"] = language

        segments, info = model.transcribe(file_path, **transcribe_params)
        
        text = " ".join([segment.text for segment in segments]).strip()
        
        return {
            "text": text,
            "detected_language": info.language,
            "language_probability": info.language_probability,
            "requested_language": language,
            "model_used": str(model_name),
            "mode": "direct_translate"
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)

    result = transcribe_direct(file_path, language=language)
    print(json.dumps(result))
