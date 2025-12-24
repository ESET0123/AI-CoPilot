from modules import llm_router, db_manager
import pandas as pd

def check_query(query):
    sql, _ = llm_router.generate_sql(query)
    try:
        df = db_manager.run_select_query(sql)
        if df.empty:
            return False, sql, "Empty result"
        return True, sql, f"{len(df)} rows"
    except Exception as e:
        return False, sql, str(e)

if __name__ == "__main__":
    queries = [
        "How many meter users are there?",
        "What is the total forecasted load?",
        "Show me historical load for meter 1001",
        "Which user has meter ID 1001?",
        "Total load for user_1"
    ]
    
    print("VERIFIED TEST QUERIES:")
    print("-" * 30)
    for q in queries:
        ok, sql, res = check_query(q)
        status = "✅ WORKS" if ok else "❌ FAILS"
        print(f"Query: '{q}'")
        print(f"Status: {status} ({res})")
        print(f"SQL: {sql}")
        print("-" * 30)
