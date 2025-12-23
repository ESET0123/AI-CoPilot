def generate_sql(query: str, time_info: dict):
    metric = "forecasted_load"

    sql_base = f"SELECT SUM({metric}) FROM meter_loads"

    if time_info["range"]:
        start, end = time_info["range"]
        sql = f"""
        {sql_base}
        WHERE date_time::date BETWEEN %s AND %s
        """
        return sql.strip(), [start, end]

    sql = f"""
    {sql_base}
    WHERE date_time::date = %s
    """
    return sql.strip(), [time_info["date"]]
