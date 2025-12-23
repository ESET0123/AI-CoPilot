from app.utils.time_scope import resolve_time_scope
from app.modules.nl_sql import generate_sql
from app.modules.sql_executor import execute_sql
from app.modules.forecasting import predict_revenue_for_date
from app.modules.rag.schema_context import build_rag_context

def handle_chat(req):
    message = req.message.strip()

    print("\n=========== CHAT REQUEST ===========")
    print("[INPUT]", message)

    time_info = resolve_time_scope(message)
    print("[TIME_SCOPE]", time_info)

    try:
        # ---------- FUTURE ----------
        if time_info["scope"] == "FUTURE":
            print("[ROUTE] FUTURE → ML")
            response = predict_revenue_for_date(time_info["date"])

        # ---------- PAST ----------
        else:
            print("[ROUTE] PAST → SQL")
            sql, params = generate_sql(message, time_info)

            print("[SQL]", sql)
            print("[PARAMS]", params)

            result = execute_sql(sql, params)
            response = (
                f"Total forecasted load is {round(result, 2)}."
                if result is not None
                else "No data found."
            )

        print("[OUTPUT]", response)
        print("===================================\n")
        return {"content": response}

    except Exception as e:
        print("ERROR:", e)
        return {"content": "Internal error occurred."}
