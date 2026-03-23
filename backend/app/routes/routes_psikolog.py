# backend/app/routes/routes_psikolog.py
from requests import session
from app.services.emotion_service import EmotionService
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, time, timezone
from zoneinfo import ZoneInfo
import pytz
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional, List
from app.dependencies import verify_jwt_psikolog
from app.services.notification_service import NotificationService
from app.db import get_db

router = APIRouter(tags=["Psikolog"])

WIB = ZoneInfo("Asia/Jakarta")

class SendNotificationPayload(BaseModel):
    mahasiswa_id: str
    session_id: Optional[str] = None
    message: str
    type: Optional[str] = "follow_up"


class NotePayload(BaseModel):
    notes: str
    status: Optional[str] = None


class SchedulePayload(BaseModel):
    schedule_id: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None


def oid_or_str(id):
    try:
        return ObjectId(id)
    except Exception:
        return id


class FollowUpPayload(BaseModel):
    message: str

def to_wib_str(dt):
    if not dt:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt)
        except:
            return dt
    # jika naive datetime, anggap UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    wib = dt.astimezone(timezone(timedelta(hours=7)))
    return wib.strftime("%Y-%m-%d %H.%M.%S wib")

class SessionActionPayload(BaseModel):
    reason: Optional[str] = None


def convert_objectid_recursive(data):
    """
    Rekursif convert semua ObjectId ke string di dict/list.
    """
    if isinstance(data, dict):
        return {k: convert_objectid_recursive(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_objectid_recursive(i) for i in data]
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

@router.get("/sessions")
def list_sessions(psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()
    sessions_col = db["counseling_sessions"]
    users_col = db["users"]

    psikolog_id = psikolog.get("user_id")
    jakarta = ZoneInfo("Asia/Jakarta")

    today_str = datetime.now(jakarta).strftime("%Y-%m-%d")

    raw_sessions = list(
        sessions_col.find(
            {
                "psychologist_id": psikolog_id,
                "status": "requested",
                "date": {"$gte": today_str},
            }
        ).sort("date", 1)
    )

    sessions = []

    for s in raw_sessions:

        mahasiswa_id = s.get("mahasiswa_id")

        mahasiswa = users_col.find_one(
            {"_id": oid_or_str(mahasiswa_id)}
        )

        mahasiswa_name = mahasiswa.get("full_name") if mahasiswa else None

        sessions.append(
            {
                "session_id": str(s["_id"]),
                "schedule_id": s.get("schedule_id"),
                "mahasiswa_name": mahasiswa_name,
                "date": s.get("date"),
                "time": s.get("time"),
                "status": s.get("status"),
            }
        )

    return {"sessions": sessions}

@router.get("/sessions/available-times")
def get_available_times(psikolog: dict = Depends(verify_jwt_psikolog)):

    db = get_db()
    schedules = db["counseling_schedules"]

    psychologist_id = psikolog.get("user_id")
    psychologist_name = psikolog.get("name")

    # ===============================
    # TIMEZONE JAKARTA
    # ===============================
    tz = pytz.timezone("Asia/Jakarta")
    now = datetime.now(tz)

    # Jika sudah lewat 17:00 → mulai dari besok
    if now.time() >= time(17, 0):
        start_date = (now + timedelta(days=1)).date()
    else:
        start_date = now.date()

    # 3 hari rolling
    valid_dates = [
        (start_date + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(3)
    ]

    # ===============================
    # HAPUS JADWAL LAMA
    # ===============================
    schedules.delete_many(
        {"psychologist_name": psychologist_name, "date": {"$lt": valid_dates[0]}}
    )

    # ===============================
    # PASTIKAN 3 HARI ADA
    # ===============================
    for date_str in valid_dates:
        existing = schedules.find_one(
            {"psychologist_name": psychologist_name, "date": date_str}
        )

        if not existing:
            schedules.insert_one(
                {
                    "psychologist_id": psychologist_id,
                    "psychologist_name": psychologist_name,
                    "date": date_str,
                    "time": "09:00-17:00",
                    "status": "available",
                    "created_at": datetime.utcnow(),
                }
            )

    # ===============================
    # RETURN DATA
    # ===============================
    data = list(
        schedules.find(
            {
                "psychologist_name": psychologist_name,
                "date": {"$in": valid_dates},
                "status": {"$ne": "booked"},
            },
            {"_id": 0, "date": 1, "time": 1},
        ).sort("date", 1)
    )

    return {"times": data}


@router.post("/sessions/{session_id}/notes")
def add_session_notes(
    session_id: str, payload: NotePayload, psikolog: dict = Depends(verify_jwt_psikolog)
):
    db = get_db()
    sessions = db["counseling_sessions"]

    query = {"_id": oid_or_str(session_id), "psychologist_id": psikolog.get("user_id")}

    session = sessions.find_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    note_doc = {
        "notes": payload.notes,
        "psychologist_id": psikolog.get("user_id"),
        "psychologist_name": psikolog.get("username"),
        "created_at": datetime.utcnow(),
        "status": payload.status,
    }

    update_fields = {"$push": {"notes_history": note_doc}}
    if payload.status:
        update_fields["$set"] = {"status": payload.status}

    sessions.update_one(query, update_fields)

    return {
        "message": "Catatan ditambahkan",
        "note": {
            "session_id": session_id,
            "notes": note_doc["notes"],
            "psychologist_name": note_doc["psychologist_name"],
            "created_at": note_doc["created_at"],
            "status": note_doc["status"],
        },
    }


@router.post("/sessions/{session_id}/schedule")
def prepare_schedule(
    session_id: str,
    payload: SchedulePayload,
    psikolog: dict = Depends(verify_jwt_psikolog),
):
    """
    Psikolog prepares a schedule for a requested session.
    Now only allows scheduling from schedules already booked by the student.
    """
    db = get_db()
    sessions = db["counseling_sessions"]
    schedules = db["counseling_schedules"]

    # ambil sesi
    session = sessions.find_one({"_id": oid_or_str(session_id)})
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    schedule_id = session.get("schedule_id")

    if not schedule_id:
        raise HTTPException(status_code=400, detail="Session belum memiliki schedule")

    try:
        schedule = schedules.find_one({"_id": ObjectId(payload.schedule_id)})
    except Exception:
        schedule = schedules.find_one({"_id": payload.schedule_id})

    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    # pastikan jadwal sudah dibooking oleh mahasiswa ini
    if schedule.get("status") != "booked" or schedule.get("booked_by") != session.get(
        "mahasiswa_id"
    ):
        raise HTTPException(
            status_code=400,
            detail="Psikolog hanya bisa menjadwalkan dari jadwal yang dibooking mahasiswa",
        )

    # update sesi dengan schedule yang valid
    update_fields = {
        "$set": {
            "status": payload.status if payload.status else "scheduled",
            "psychologist_id": psikolog.get("user_id"),
            "scheduled_by": psikolog.get("user_id"),
            "scheduled_at": datetime.utcnow(),
            "schedule_id": str(schedule["_id"]),
            "date": schedule["date"],
            "time": schedule["time"],
        }
    }

    sessions.update_one({"_id": oid_or_str(session_id)}, update_fields)

    # notify mahasiswa
    notif_service = NotificationService(db)
    notif_service.notify_schedule_proposed(
        session_id=session_id,
        psychologist_name=psikolog.get("username"),
        mahasiswa_id=session.get("mahasiswa_id"),
    )

    return {"message": "Jadwal disiapkan dan mahasiswa diberitahu"}

@router.get("/notifications")
def get_notifications(psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()
    notif_service = NotificationService(db)

    psychologist_id = psikolog.get("user_id")
    data = notif_service.get_notifications_for_role("psikolog")

    notifications = []
    for n in data:
        details = n.get("details") or {}
        mahasiswa_name = details.get("mahasiswa_name")
        fallback_message = n.get("message")

        # prioritas: details.mahasiswa_name > message > "-"
        display_name = mahasiswa_name or fallback_message or "-"

        notifications.append({
            "id": str(n["_id"]),
            "type": n.get("type"),
            "session_id": n.get("session_id"),
            "message": display_name,
            "created_at": to_wib_str(n.get("created_at")),
            "is_read": psychologist_id in n.get("read_by", []),
            "full_name": display_name
        })

    return {"notifications": notifications}

@router.post("/notifications/{notif_id}/mark-read")
def mark_notification_read_psikolog(
    notif_id: str, psikolog: dict = Depends(verify_jwt_psikolog)
):
    db = get_db()
    try:
        query = {"_id": ObjectId(notif_id)}
    except Exception:
        query = {"_id": notif_id}

    notif_service = NotificationService(db)

    updated = notif_service.mark_as_read(notif_id, read_by=psikolog.get("user_id"))

    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"message": "Notification marked as read"}


@router.get("/sessions/{session_id}/emotion")
def get_emotion_result(session_id: str, psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()

    try:
        session_obj_id = ObjectId(session_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Format session_id tidak valid")

    # 🔥 WAJIB is_active: false
    session = db["counseling_sessions"].find_one(
        {"_id": session_obj_id, "is_active": True}
    )

    if not session:
        raise HTTPException(
            status_code=404, detail="Session tidak ditemukan atau masih aktif"
        )

    # Cek kepemilikan
    if session.get("psychologist_id") != psikolog.get("user_id"):
        raise HTTPException(
            status_code=403, detail="Anda tidak memiliki akses ke session ini"
        )

    # Ambil emotion result berdasarkan mahasiswa_id
    results = list(
        db["emotion_results"]
        .find({"user_id": session.get("mahasiswa_id")})
        .sort("created_at", -1)
    )

    if not results:
        return []

    return [
        {
            "emotion_id": str(r["_id"]),
            "session_id": session_id,
            "mahasiswa_id": r.get("user_id"),
            "mahasiswa_name": session.get("mahasiswa_name"),
            "risk_level": r.get("risk_level"),
            "percentage_negative": r.get("percentage_negative"),
            "percentage_positive": r.get("percentage_positive"),
            "percentage_neutral": r.get("percentage_neutral"),
            "total_messages": r.get("total_messages"),
            "max_consecutive_negative": r.get("max_consecutive_negative"),
            "average_negative_streak": r.get("average_negative_streak"),
            "last_emotion": r.get("last_emotion"),
            "emotion_distribution": r.get("emotion_distribution"),
            "created_at": r.get("created_at"),
        }
        for r in results
    ]


@router.get("/sessions/{session_id}/notes")
def get_session_notes(session_id: str, psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()
    sessions = db["counseling_sessions"]

    session = sessions.find_one(
        {"_id": oid_or_str(session_id), "psychologist_id": psikolog.get("user_id")}
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    notes = session.get("notes_history", [])

    return {
        "notes": [
            {
                "notes": n.get("notes"),
                "psychologist_name": n.get("psychologist_name"),
                "created_at": n.get("created_at"),
                "status": n.get("status"),
            }
            for n in notes
        ]
    }


@router.post("/notifications/send")
def send_notification_to_mahasiswa(
    payload: SendNotificationPayload, psikolog: dict = Depends(verify_jwt_psikolog)
):
    db = get_db()
    notif_service = NotificationService(db)

    notif_id = notif_service.notify_follow_up(
        mahasiswa_id=payload.mahasiswa_id,
        message=payload.message,
        session_id=payload.session_id,
        notif_type=payload.type,
    )

    return {
        "message": "Notifikasi berhasil dikirim ke mahasiswa",
        "notification_id": str(notif_id),
    }

@router.get("/critical-mahasiswa")
def list_critical_mahasiswa(psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()

    pipeline = [
        {
            "$match": {
                # 🔥 support kondisi real data kamu
                "type": {"$in": ["critical_alert", "booking_request"]},
                "to_roles": {"$in": ["psikolog"]},
                "details.mahasiswa_id": {"$exists": True},
            }
        },
        {
            "$addFields": {
                "mahasiswa_oid": {
                    "$cond": [
                        {"$eq": [{"$type": "$details.mahasiswa_id"}, "string"]},
                        {"$toObjectId": "$details.mahasiswa_id"},
                        "$details.mahasiswa_id",
                    ]
                }
            }
        },

        # 🔹 JOIN USERS
        {
            "$lookup": {
                "from": "users",
                "localField": "mahasiswa_oid",
                "foreignField": "_id",
                "as": "mahasiswa",
            }
        },
        {"$unwind": "$mahasiswa"},

        # 🔹 JOIN CHAT SESSIONS (ONLY yang sudah selesai)
        {
            "$lookup": {
                "from": "chat_sessions",
                "let": {"uid": {"$toString": "$mahasiswa._id"}},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$user_id", "$$uid"]},
                                    {"$eq": ["$is_active", False]}  # ✅ wajib
                                ]
                            }
                        }
                    },
                    {"$sort": {"created_at": -1}},
                    {"$limit": 1}
                ],
                "as": "last_session"
            }
        },

        # ❗ INI YANG TADI KURANG KOMA (FIXED)
        {
            "$unwind": {
                "path": "$last_session",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$sort": {
                "created_at": -1  # 🔥 terbaru di atas
            }
        },

        # 🔹 FINAL SHAPE
        {
            "$project": {
                "_id": 1,
                "created_at": 1,
                "mahasiswa_id": "$mahasiswa._id",
                "full_name": "$mahasiswa.full_name",

                "session_id": "$last_session.session_id",
                "last_emotion": "$last_session.last_emotion",
                "emotion_history": "$last_session.emotion_history",
            }
        },
    ]

    data = list(db["notifications"].aggregate(pipeline))

    return {
        "data": [
            {
                "notification_id": str(n["_id"]),
                "mahasiswa_id": str(n.get("mahasiswa_id")),
                "full_name": n.get("full_name"),

                # 🕒 WIB
                "detected_at": to_wib_str(n.get("created_at")),

                # 🧠 EMOTION
                "last_emotion": n.get("last_emotion"),

                # 🔥 ambil max 3 terakhir (kalau ada)
                "emotion_history": (
                    n.get("emotion_history", [])[-3:]
                    if n.get("emotion_history")
                    else []
                ),

                "session_id": n.get("session_id"),
            }
            for n in data
        ]
    }

@router.post("/chatbot-sessions/{session_id}/notify")
def notify_mahasiswa_from_chatbot_session(
    session_id: str,
    payload: FollowUpPayload,
    psikolog: dict = Depends(verify_jwt_psikolog),
):
    db = get_db()

    chatbot_sessions = db["chatbot_sessions"]
    notifications = NotificationService(db)

    # cari chatbot session
    session = chatbot_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Chatbot session tidak ditemukan")

    mahasiswa_id = session.get("mahasiswa_id")
    mahasiswa_name = session.get("mahasiswa_name")

    if not mahasiswa_id:
        raise HTTPException(
            status_code=400, detail="Mahasiswa tidak terasosiasi dengan session ini"
        )

    # kirim notifikasi ke mahasiswa
    notif_service = NotificationService(db)
    notif_service.notify_follow_up(
        mahasiswa_id=mahasiswa_id,
        message=payload.message,
        session_id=session_id,
    )

    return {
        "message": "Notifikasi tindak lanjut berhasil dikirim",
        "mahasiswa_id": mahasiswa_id,
        "session_id": session_id,
    }


@router.post("/sessions/{session_id}/accept")
def accept_counseling_request(
    session_id: str, psikolog: dict = Depends(verify_jwt_psikolog)
):
    db = get_db()
    sessions = db["counseling_sessions"]

    query = {"_id": oid_or_str(session_id), "psychologist_id": psikolog.get("user_id")}
    session = sessions.find_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    # Update status menjadi accepted
    sessions.update_one(query, {"$set": {"status": "accepted"}})

    # Kirim notifikasi ke mahasiswa
    notif_service = NotificationService(db)
    notif_service.notify_follow_up(
        mahasiswa_id=session.get("mahasiswa_id"),
        message=f"Permintaan konseling Anda telah diterima oleh {psikolog.get('username')}.",
        session_id=session_id,
    )

    return {"message": "Permintaan konseling diterima dan mahasiswa diberitahu."}


@router.post("/sessions/{session_id}/reject")
def reject_counseling_request(
    session_id: str,
    payload: SessionActionPayload,
    psikolog: dict = Depends(verify_jwt_psikolog),
):
    db = get_db()
    sessions = db["counseling_sessions"]

    query = {"_id": oid_or_str(session_id), "psychologist_id": psikolog.get("user_id")}
    session = sessions.find_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    # Update status menjadi rejected
    update_fields = {"$set": {"status": "rejected"}}
    if payload.reason:
        update_fields["$set"]["rejection_reason"] = payload.reason

    sessions.update_one(query, update_fields)

    # Kirim notifikasi ke mahasiswa
    notif_service = NotificationService(db)
    reason_text = f" Alasan: {payload.reason}" if payload.reason else ""
    notif_service.notify_follow_up(
        mahasiswa_id=session.get("mahasiswa_id"),
        message=f"Permintaan konseling Anda ditolak oleh {psikolog.get('username')}.{reason_text}",
        session_id=session_id,
    )

    return {"message": "Permintaan konseling ditolak dan mahasiswa diberitahu."}

from zoneinfo import ZoneInfo

WIB = ZoneInfo("Asia/Jakarta")


@router.get("/sessions/confirmed/all")
def get_all_confirmed_sessions(psikolog: dict = Depends(verify_jwt_psikolog)):
    """
    Mengambil semua jadwal sesi yang sudah dikonfirmasi Mahasiswa.
    Mengembalikan semua field data untuk setiap session.
    """
    db = get_db()
    sessions_col = db["counseling_sessions"]
    users_col = db["users"]

    confirmed_sessions = list(
        sessions_col.find(
            {
                "psychologist_id": psikolog.get("user_id"),
                "status": {"$in": ["scheduled", "confirmed", "rejected"]},
            }
        ).sort("created_at", -1)  
    )

    def to_wib(dt):
        """Convert UTC datetime ke WIB string"""
        if isinstance(dt, datetime):
            return (
                dt.replace(tzinfo=ZoneInfo("UTC"))
                .astimezone(WIB)
                .strftime("%Y-%m-%d %H:%M:%S WIB")
            )
        return dt

    def serialize_session(s: dict):
        s["_id"] = str(s["_id"])

        # ambil nama mahasiswa dari users
        mahasiswa_id = s.get("mahasiswa_id")
        mahasiswa = users_col.find_one({"_id": oid_or_str(mahasiswa_id)})
        s["mahasiswa_name"] = mahasiswa.get("full_name") if mahasiswa else None
        
        # ✅ ambil nama psikolog
        psikolog_id = s.get("psychologist_id")
        psikolog_user = users_col.find_one({"_id": oid_or_str(psikolog_id)})
        s["psychologist_name"] = psikolog_user.get("full_name") if psikolog_user else None
        
        # convert waktu utama
        for key in ["requested_at", "scheduled_at", "confirmed_at", "created_at"]:
            if key in s:
                s[key] = to_wib(s[key])

        if "notes_history" in s and isinstance(s["notes_history"], list):
            for note in s["notes_history"]:
                # ambil dari psychologist_id (bukan created_by)
                user_id = note.get("psychologist_id")

                user = users_col.find_one({"_id": oid_or_str(user_id)})

                if user:
                    note["psychologist_name"] = user.get("full_name") or user.get("username")
                else:
                    note["psychologist_name"] = None

                if "created_at" in note:
                    note["created_at"] = to_wib(note.get("created_at"))

        # convert messages waktu
        if "messages" in s and isinstance(s["messages"], list):
            for msg in s["messages"]:
                if "timestamp" in msg:
                    msg["timestamp"] = to_wib(msg["timestamp"])

        return s

    return {"sessions": [serialize_session(s) for s in confirmed_sessions]}

@router.get("/archived-emotions")
def get_all_archived_emotions_psikolog(psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()
    sessions_col = db["chat_sessions"]
    users_col = db["users"]
    emotion_logs_col = db["emotion_logs"]
    emotion_results_col = db["emotion_results"]
    messages_col = db["messages"]

    raw_sessions = list(
        sessions_col
        .find({"is_active": False, "created_by_role": "mahasiswa"})
        .sort("created_at", -1)
    )

    results = []

    for s in raw_sessions:
        session_id = s.get("session_id")
        user_id = s.get("user_id")

        # ======================
        # USER
        # ======================
        user_data = None
        if user_id:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                user_data = {
                    "id": str(user.get("_id")),
                    "full_name": user.get("full_name") or "tidak tersedia",
                    "username": user.get("username") or "tidak tersedia",
                    "email": user.get("email") or "tidak tersedia",
                    "angkatan": user.get("angkatan") or 0,
                }

        # ======================
        # CHAT HISTORY
        # ======================
        msgs = list(
            messages_col.find({"session_id": session_id}).sort("waktu_kirim", 1)
        )

        chat_history = []
        for m in msgs:
            chat_history.append({
                "sender": m.get("pengirim") or "tidak tersedia",
                "message": m.get("isi_pesan") or "",
                "created_at": to_wib_str(m.get("waktu_kirim")),
                "emotion": m.get("emotion") or "tidak tersedia",
                "emotion_confidence": m.get("emotion_confidence") or 0,
                "intent": m.get("intent") or "tidak tersedia",
                "intent_confidence": m.get("intent_confidence") or 0,
                "risk_level": m.get("risk", {}).get("level") or "tidak tersedia",
                "is_critical": m.get("risk", {}).get("is_critical") or False,
            })

        # ======================
        # EMOTION LOGS (FIX 🔥)
        # ======================
        logs = list(
            emotion_logs_col.find({"session_id": session_id}).sort("created_at", 1)
        )

        emotion_logs = []

        # ✅ PRIORITAS 1: ambil dari emotion_logs kalau ada
        if logs:
            for l in logs:
                emotion_logs.append({
                    "text": l.get("text") or "",
                    "emotion": l.get("emotion") or "tidak tersedia",
                    "confidence": l.get("emotion_confidence") or 0,
                    "intent": l.get("intent") or "tidak tersedia",
                    "intent_confidence": l.get("intent_confidence") or 0,
                    "created_at": to_wib_str(l.get("created_at"))
                })

        # ✅ PRIORITAS 2: fallback ke messages (INI FIX UTAMA)
        else:
            for m in msgs:
                if m.get("pengirim") == "user" and m.get("emotion"):
                    emotion_logs.append({
                        "text": m.get("isi_pesan") or "",
                        "emotion": m.get("emotion") or "tidak tersedia",
                        "confidence": m.get("emotion_confidence") or 0,
                        "intent": m.get("intent") or "tidak tersedia",
                        "intent_confidence": m.get("intent_confidence") or 0,
                        "created_at": to_wib_str(m.get("waktu_kirim"))
                    })

        # ======================
        # FINAL ANALYSIS
        # ======================
        result = emotion_results_col.find_one(
            {"session_id": session_id},
            sort=[("created_at", -1)]
        )

        emotion_result = None
        if result:
            emotion_result = {
                "risk_level": result.get("risk_level") or "tidak tersedia",
                "percentage_negative": result.get("percentage_negative") or 0,
                "percentage_positive": result.get("percentage_positive") or 0,
                "percentage_neutral": result.get("percentage_neutral") or 0,
                "max_consecutive_negative": result.get("max_consecutive_negative") or 0,
                "average_negative_streak": result.get("average_negative_streak") or 0,
                "last_emotion": result.get("last_emotion") or "tidak tersedia",
                "created_at": to_wib_str(result.get("created_at")),
            }

        # ======================
        # SESSION CORE
        # ======================
        session_data = {
            "session_id": session_id,
            "username": s.get("username") or "tidak tersedia",
            "created_at": to_wib_str(s.get("created_at")),
            "ended_at": to_wib_str(s.get("ended_at")),
            "duration_seconds": (
                (s.get("ended_at") - s.get("created_at")).total_seconds()
                if s.get("ended_at") and s.get("created_at") else 0
            ),
            "is_active": s.get("is_active"),
            "critical_detected": s.get("critical_detected") or False,
            "last_emotion": s.get("last_emotion") or "tidak tersedia",
            "emotion_distribution": s.get("emotion_distribution") or {},
            "emotion_percentages": s.get("emotion_percentages") or {},
        }

        # ======================
        # FINAL OUTPUT
        # ======================
        results.append({
            "user": user_data,
            "session": session_data,
            "emotion_logs": emotion_logs,
            "final_analysis": emotion_result,
            "meta": {
                "total_logs": len(emotion_logs)
            }
        })

    return {
        "total_sessions": len(results),
        "sessions": results
    }

@router.patch("/sessions/{session_id}/complete")
def complete_session(session_id: str, psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()

    try:
        session_obj_id = ObjectId(session_id)
    except:
        raise HTTPException(status_code=400, detail="Session ID tidak valid")

    result = db["counseling_sessions"].update_one(
        {
            "_id": session_obj_id,
            "psychologist_id": psikolog.get("user_id"),
            "is_active": True,
        },
        {
            "$set": {
                "is_active": False,
                "status": "completed",
                "completed_at": datetime.utcnow(),
            }
        },
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return {"message": "Session berhasil diselesaikan"}

@router.get("/sessions/completed")
def list_completed_sessions(psikolog: dict = Depends(verify_jwt_psikolog)):
    db = get_db()
    sessions_col = db["counseling_sessions"]
    users_col = db["users"]

    psikolog_id = psikolog.get("user_id")

    raw_sessions = list(
        sessions_col.find(
            {
                "psychologist_id": psikolog_id,
                "status": {"$in": ["requested", "scheduled", "confirmed"]},
            }
        ).sort("requested_at", -1)
    )

    sessions = []

    for s in raw_sessions:

        mahasiswa_id = s.get("mahasiswa_id")

        mahasiswa = users_col.find_one(
            {"_id": oid_or_str(mahasiswa_id)}
        )

        # FIX 1: field users adalah full_name
        mahasiswa_name = mahasiswa.get("full_name") if mahasiswa else None

        # ambil waktu terakhir
        completed_at = (
            s.get("confirmed_at")
            or s.get("scheduled_at")
            or s.get("requested_at")
        )

        # FIX 2: convert UTC → WIB
        if completed_at:
            completed_at = (
                completed_at.replace(tzinfo=ZoneInfo("UTC"))
                .astimezone(WIB)
                .strftime("%Y-%m-%d %H:%M:%S WIB")
            )

        sessions.append(
            {
                "session_id": str(s["_id"]),
                "schedule_id": s.get("schedule_id"),
                "mahasiswa_id": mahasiswa_id,
                "mahasiswa_name": mahasiswa_name,
                "date": s.get("date"),
                "time": s.get("time"),
                "status": s.get("status"),
                "completed_at": completed_at,
            }
        )

    return {
        "total": len(sessions),
        "sessions": sessions,
    }

@router.get("/psikolog/chatbot-sessions/{session_id}/emotion")
def get_emotion_for_psikolog(
    session_id: str, psikolog: dict = Depends(verify_jwt_psikolog), db=Depends(get_db)
):
    # cek chat session ada
    chat_session = db["chat_sessions"].find_one({"session_id": session_id})

    if not chat_session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    result = db["emotion_results"].find_one({"session_id": session_id})

    if not result:
        raise HTTPException(status_code=404, detail="Emotion result tidak ditemukan")

    return {
        "session_id": session_id,
        "user_id": result.get("user_id"),
        "risk_level": result.get("risk_level"),
        "percentage_negative": result.get("percentage_negative"),
        "percentage_positive": result.get("percentage_positive"),
        "percentage_neutral": result.get("percentage_neutral"),
        "emotion_distribution": result.get("emotion_distribution"),
        "emotion_percentages": result.get("emotion_percentages"),
        "max_consecutive_negative": result.get("max_consecutive_negative"),
        "average_negative_streak": result.get("average_negative_streak"),
        "streak_ge2_count": result.get("streak_ge2_count"),
        "high_risk_keyword_count": result.get("high_risk_keyword_count"),
        "medium_risk_keyword_count": result.get("medium_risk_keyword_count"),
        "last_emotion": result.get("last_emotion"),
        "total_messages": result.get("total_messages"),
        "created_at": result.get("created_at"),
        "source": result.get("source"),
    }
