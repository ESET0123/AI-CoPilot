def classify_intent(query: str) -> str:
    print("[INTENT] classifying intent")

    q = query.lower()

    if "revenue" in q:
        print("[INTENT] detected REVENUE")
        return "REVENUE"

    if "load" in q:
        print("[INTENT] detected LOAD")
        return "LOAD"

    print("[INTENT] default GENERAL")
    return "GENERAL"
