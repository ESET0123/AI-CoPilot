from datetime import date, timedelta
import re

def resolve_time_scope(query: str):
    """
    Returns:
        {
            "scope": "PAST" | "FUTURE",
            "date": "YYYY-MM-DD" | None,
            "range": (start, end) | None
        }
    """
    q = query.lower()
    today = date.today()

    # ---------- EXPLICIT DATE ----------
    match = re.search(r"\d{4}-\d{2}-\d{2}", q)
    if match:
        target = date.fromisoformat(match.group(0))
        return {
            "scope": "PAST" if target <= today else "FUTURE",
            "date": target.isoformat(),
            "range": None,
        }

    # ---------- RELATIVE ----------
    if "yesterday" in q:
        d = today - timedelta(days=1)
        return {"scope": "PAST", "date": d.isoformat(), "range": None}

    if "today" in q:
        return {"scope": "PAST", "date": today.isoformat(), "range": None}

    if "tomorrow" in q:
        d = today + timedelta(days=1)
        return {"scope": "FUTURE", "date": d.isoformat(), "range": None}

    # ---------- YEAR ----------
    if "last year" in q:
        y = today.year - 1
        return {
            "scope": "PAST",
            "date": None,
            "range": (f"{y}-01-01", f"{y}-12-31"),
        }

    if "this year" in q:
        return {
            "scope": "PAST",
            "date": None,
            "range": (f"{today.year}-01-01", today.isoformat()),
        }

    # ---------- DEFAULT ----------
    return {"scope": "PAST", "date": today.isoformat(), "range": None}
