# backend/app/utils/logger.py
import os, datetime

LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../logs.txt")

def log_event(event_type: str, detail: str):
    os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
    ts = datetime.datetime.utcnow().isoformat()
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] {event_type.upper()}: {detail}\n")

# Wrapper untuk kompatibilitas routes
def log_info(message: str):
    log_event("info", message)

def log_error(message: str):
    log_event("error", message)
