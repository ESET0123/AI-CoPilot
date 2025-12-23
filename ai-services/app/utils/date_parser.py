from datetime import date, timedelta
import re


def extract_date_range(query: str):
    q = query.lower()
    today = date.today()

    if "last year" in q:
        year = today.year - 1
        return date(year, 1, 1), date(year, 12, 31)

    if "this year" in q:
        year = today.year
        return date(year, 1, 1), today

    return None


def extract_single_date(query: str):
    q = query.lower()
    today = date.today()

    match = re.search(r"\d{4}-\d{2}-\d{2}", q)
    if match:
        return match.group(0)

    if "today" in q:
        return today.isoformat()

    if "yesterday" in q:
        return (today - timedelta(days=1)).isoformat()

    return None
