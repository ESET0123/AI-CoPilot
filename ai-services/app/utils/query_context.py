def infer_time_scope(query: str) -> str:
    q = query.lower()

    if "last year" in q:
        return "last year"
    if "this year" in q:
        return "this year"
    if "yesterday" in q:
        return "yesterday"
    if "today" in q:
        return "today"

    return "the selected period"
