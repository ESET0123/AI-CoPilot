from pprint import pprint
from app.config import DEBUG

def debug_log(title: str, payload=None):
    if not DEBUG:
        return

    print("\n" + "=" * 60)
    print(f"[DEBUG] {title}")
    if payload is not None:
        pprint(payload)
    print("=" * 60)
