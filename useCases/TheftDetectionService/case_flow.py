from datetime import date

FLOW = [
    "inspection_date",
    "visit_status",
    "found_status",
    "category",
    "is_smart_meter",
    "multimeter_available",
    "multimeter_status",
    "billed_status",
    "billed_units",
    "billed_amount",
    "panchanama_number",
    "officer_name",
    "observation_type",
    "description",
    "remark",
    "confirm"
]

OPTIONS = {
    "visit_status": [
        "Visit Completed",
        "Consumer Not Available",
        "Premises Closed",
        "Access Denied",
        "Rescheduled"
    ],
    "found_status": [
        "Found theft",
        "Nothing suspicious",
        "Suspicious case"
    ],
    "category": [
        "Direct Theft",
        "Meter Tampered",
        "Tariff Misuse"
    ],
    "is_smart_meter": ["Yes", "No", "Unknown"],
    "multimeter_available": ["Yes", "No"],
    "multimeter_status": [
        "Multimeter",
        "Multimeter with changeover circuit"
    ],
    "billed_status": [
        "Billed / Assessment Raised",
        "Not Billed",
        "To Be Billed"
    ],
    "observation_type": [
        "Meter bypass suspected",
        "Direct tapping",
        "Meter tamper",
        "Tariff misuse",
        "Load mismatch",
        "Documentation issue",
        "Verified OK"
    ]
}

QUESTIONS = {
    "inspection_date": "What is the inspection date?",
    "visit_status": "What is the visit status?",
    "found_status": "What did you find?",
    "category": "Select the category.",
    "is_smart_meter": "Is this a smart meter?",
    "multimeter_available": "Was multimeter available?",
    "multimeter_status": "Select multimeter status.",
    "billed_status": "Was billing done?",
    "billed_units": "Enter billed units (kWh).",
    "billed_amount": "Enter billed amount (₹).",
    "panchanama_number": "Enter panchanama number or NA.",
    "officer_name": "Officer name?",
    "observation_type": "Select observation type.",
    "description": "Add short description (2–3 lines).",
    "remark": "Any remarks or next action?"
}

def should_skip(field, state):
    if field == "category":
        return state.get("found_status") == "Nothing suspicious"

    if field == "multimeter_status":
        return state.get("multimeter_available") != "Yes"

    if field in ["billed_status", "billed_units", "billed_amount"]:
        return not (
            state.get("found_status") == "Found theft" or
            state.get("category") == "Tariff Misuse"
        )

    return False

def next_field(state):
    for f in FLOW:
        if f not in state:
            if not should_skip(f, state):
                return f
    return "confirm"

def bot_step(state):
    field = next_field(state)

    if field == "confirm":
        summary = "\n".join(f"{k}: {v}" for k, v in state.items() if k != "_last")
        return {
            "message": "Confirm case booking:\n\n" + summary,
            "options": ["Confirm & Submit", "Edit"],
            "field": "confirm"
        }

    msg = QUESTIONS[field]
    if field == "inspection_date":
        msg += f" (Default: {date.today()})"

    return {
        "message": msg,
        "options": OPTIONS.get(field),
        "field": field
    }
