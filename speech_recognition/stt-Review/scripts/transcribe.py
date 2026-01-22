import sys
import os
import json
import traceback

# Add current directory to path just in case
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def transcribe(file_path, language=None):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return {"error": "faster_whisper module not found. Please install it with 'pip install faster-whisper'"}

    try:
        # Determine model to use
        # Logic: 
        # 1. If language is 'en', use 'base.en'
        # 2. If specific model exists in backend/stt/models/whisper-{lang}, use it
        # 3. Else use 'base' (multilingual)
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(script_dir, '..', 'models')
        
        model_name = "large-v3"
        if language == 'en':
            model_name = "large-v3"
        elif language:
            potential_model_path = os.path.join(models_dir, f"whisper-{language}")
            if os.path.exists(potential_model_path):
                model_name = potential_model_path
        
        # Load model
        model = WhisperModel(model_name, device="cpu", compute_type="int8")

        # Prepare transcription parameters
        # Strict enforcement for native script
        transcribe_params = {
            "beam_size": 10,
            "patience": 2.0,
            "task": "transcribe",
            "condition_on_previous_text": False,
            "compression_ratio_threshold": 2.4,
            "no_speech_threshold": 0.6
        }
        
        if language and language != 'auto':
            transcribe_params["language"] = language
            
            # Script priming prompts
            prompts = {
                "hi": "नमस्ते, आप कैसे हैं? आज मौसम बहुत अच्छा है। मुझे हिंदी में बात करना पसंद है।",
                "bn": "নমস্কার, আপনি কেমন আছেন? আজ আবহাওয়া খুব ভালো। আমি বাংলা বলতে ভালোবাসি।",
                "ta": "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்? தமிழ் மிகவும் அழகான மொழி.",
                "te": "నమస్కారం, మీరు ఎలా ఉన్నారు? తెలుగు భాష చాలా బాగుంటుంది.",
                "mr": "नमस्कार, तुम्ही कसे आहात? मराठी माझी मातृभाषा आहे.",
                "gu": "નમસ્તે, તમે કેમ છો? ગુજરાતી મીઠી భాష છે.",
                "kn": "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ? ಕನ್ನಡ ನಾಡು ಸುಂದరವಾಗಿದೆ.",
                "ml": "നമസ്കാരം, സുഖമാണോ? മലയാളം മനോഹരമായ భాషയാണ്.",
                "pa": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ? ਪੰਜਾਬੀ ਬਹੁਤ ਵਧੀਆ ਭਾਸ਼ਾ ਹੈ।",
            }
            if language in prompts:
                transcribe_params["initial_prompt"] = prompts[language]

        segments, info = model.transcribe(file_path, **transcribe_params)
        
        text = " ".join([segment.text for segment in segments]).strip()
        
        return {
            "text": text,
            "detected_language": info.language,
            "language_probability": info.language_probability,
            "requested_language": language,
            "model_used": str(model_name)
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

    result = transcribe(file_path, language=language)
    print(json.dumps(result))
