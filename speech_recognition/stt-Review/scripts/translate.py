import sys
import os
import json
import traceback

# IndicTrans2 ISO code mapping
INDIC_TRANS_MAP = {
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "pa": "pan_Guru",
    "ur": "urd_Arab",
    # Add others as needed
}

def translate(text, from_lang, to_lang="en"):
    try:
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ImportError:
        return {"error": "Required modules (transformers, torch) not found. Please install them."}

    try:
        if from_lang == "en" or from_lang == "auto":
            return {"original_text": text, "translated_text": text, "from_lang": from_lang, "to_lang": to_lang}

        model_name = "AI4Bharat/indic-trans-v2-indic-en"
        
        # Load tokenizer and model
        # Note: In production, you might want to load these once and keep them in memory
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)

        if torch.cuda.is_available():
            model = model.to("cuda")

        src_lang = INDIC_TRANS_MAP.get(from_lang)
        if not src_lang:
            return {"error": f"Language {from_lang} is not supported by IndicTrans2 mapping."}

        # IndicTrans2 expects a specific format/prefix for some versions, 
        # but for v2-indic-en it's usually straightforward with trust_remote_code
        inputs = tokenizer(text, return_tensors="pt", padding=True).to(model.device)
        
        with torch.no_grad():
            generated_tokens = model.generate(
                **inputs,
                max_length=256,
                num_beams=5,
                early_stopping=True
            )

        translated_text = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
        
        return {
            "original_text": text,
            "translated_text": translated_text,
            "from_lang": from_lang,
            "to_lang": to_lang,
            "model_used": model_name
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python translate.py <text> <from_lang> [to_lang]"}))
        sys.exit(1)
        
    text = sys.argv[1]
    from_lang = sys.argv[2]
    to_lang = sys.argv[3] if len(sys.argv) > 3 else "en"

    result = translate(text, from_lang, to_lang)
    print(json.dumps(result))
