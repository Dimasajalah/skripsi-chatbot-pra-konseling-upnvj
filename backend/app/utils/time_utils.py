#backend/app/utils/time_utils.py
from datetime import datetime
from zoneinfo import ZoneInfo

JAKARTA_TZ = ZoneInfo("Asia/Jakarta")

def now():
    return datetime.now(JAKARTA_TZ)