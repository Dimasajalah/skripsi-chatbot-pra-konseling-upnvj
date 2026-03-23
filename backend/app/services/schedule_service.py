# backend/app/services/schedule_service.py
from datetime import datetime, timedelta
from pymongo.errors import DuplicateKeyError

def generate_schedules_from_psychologists(db, days_ahead=2):
    schedules = db["counseling_schedules"]
    users = db["users"]

    psychologists = users.find({"role": "psikolog"})

    for psy in psychologists:
        psychologist_id = str(psy["_id"])
        psychologist_name = psy.get("full_name") or psy.get("username")

        for i in range(days_ahead):
            day = (datetime.utcnow().date() + timedelta(days=i + 1)).isoformat()

            try:
                schedules.insert_one({
                    "psychologist_id": psychologist_id,
                    "psychologist_name": psychologist_name,
                    "date": day,
                    "time": "09:00-17:00",  # 1 jadwal per hari
                    "status": "available",
                    "created_at": datetime.utcnow()
                })
            except DuplicateKeyError:
                # jadwal sudah ada → aman
                continue







