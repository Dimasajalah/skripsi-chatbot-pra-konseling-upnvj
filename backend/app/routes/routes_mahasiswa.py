# backend/app/routes/routes_mahasiswa.py
from fastapi import APIRouter, Depends, HTTPException
from app.services.notification_service import NotificationService
from app.services.schedule_service import generate_schedules_from_psychologists
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson import ObjectId
import pytz
from app.dependencies import verify_jwt_user, verify_jwt_role
from app.db import get_db
from typing import Literal
from pymongo import DESCENDING
from uuid import uuid4
from pytz import timezone
from datetime import datetime, timedelta
import locale

try:
    locale.setlocale(locale.LC_TIME, "id_ID.UTF-8")
except:
    pass  # biar ga crash kalau locale tidak tersedia

router = APIRouter(tags=["Mahasiswa"])

class BookingPayload(BaseModel):
    schedule_id: str


class RespondPayload(BaseModel):
    action: Literal["accept", "reject"]


def serialize_mongo(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def format_created_at_wib(dt):
    if not dt:
        return None

    jakarta_tz = timezone("Asia/Jakarta")

    # jika datetime belum ada timezone (naive), anggap UTC
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)

    # convert ke WIB
    dt_wib = dt.astimezone(jakarta_tz)

    return dt_wib.strftime("%d-%m-%Y %H.%M.%S WIB")

@router.get("/counseling/available")
def get_available_schedules(user: dict = Depends(verify_jwt_user)):

    db = get_db()
    schedules = db["counseling_schedules"]
    sessions = db["counseling_sessions"]

    jakarta_tz = timezone("Asia/Jakarta")
    today = datetime.now(jakarta_tz).date()
    end_date = today + timedelta(days=3)

    # status session yang dianggap slot sudah dipakai
    blocked_status = ["scheduled", "confirmed"]

    # ambil semua schedule_id yang sedang dipakai
    used_schedule_ids = sessions.distinct(
        "schedule_id",
        {
            "status": {"$in": blocked_status},
            "is_active": True
        }
    )

    used_object_ids = []
    for sid in used_schedule_ids:
        try:
            used_object_ids.append(ObjectId(sid))
        except:
            continue

    raw_schedules = schedules.find(
        {
            "_id": {"$nin": used_object_ids},

            # filter tanggal
            "date": {
                "$gte": today.isoformat(),
                "$lte": end_date.isoformat()
            },

            # jangan tampilkan psikolog null
            "psychologist_name": {"$nin": [None, ""]},

            # hanya schedule available
            "status": "available"
        }
    ).sort([
        ("date", 1),
        ("time", 1)
    ])

    return {
        "schedules": [
            {
                "schedule_id": str(s["_id"]),
                "date": s["date"],
                "time": s["time"],
                "psychologist_name": s.get("psychologist_name"),
                "psychologist_id": s.get("psychologist_id"),
                "created_at": format_created_at_wib(s.get("created_at")),
                "status": "available",
            }
            for s in raw_schedules
        ]
    }

@router.post("/counseling/book")
def book_counseling(payload: BookingPayload, user: dict = Depends(verify_jwt_user)):
    db = get_db()
    schedules = db["counseling_schedules"]
    sessions = db["counseling_sessions"]

    try:
        schedule_id = ObjectId(payload.schedule_id)
    except:
        raise HTTPException(status_code=400, detail="Schedule ID tidak valid")

    mahasiswa_id = user.get("user_id")
    user_doc = db["users"].find_one(
        {"_id": ObjectId(mahasiswa_id)},
        {"full_name": 1, "username": 1}
    )

    mahasiswa_name = user_doc.get("full_name") or user_doc.get("username")

    # 🔒 1️⃣ Atomic lock schedule (hindari race condition)
    schedule = schedules.find_one_and_update(
        {
            "_id": schedule_id,
            "status": "available",  # hanya bisa dibooking jika masih available
        },
        {"$set": {"status": "booked", "booked_by": mahasiswa_id}},
        return_document=True,
    )

    if not schedule:
        raise HTTPException(
            status_code=400, detail="Jadwal sudah dibooking atau tidak tersedia"
        )

    # 🚫 2️⃣ Cegah duplikat session (extra safety)
    existing = sessions.find_one(
        {
            "mahasiswa_id": mahasiswa_id,
            "schedule_id": payload.schedule_id,
            "status": {"$in": ["confirmed", "scheduled"]},
        }
    )

    if existing:
        # rollback schedule jika session sudah ada
        schedules.update_one(
            {"_id": schedule_id},
            {"$set": {"status": "available"}, "$unset": {"booked_by": ""}},
        )
        raise HTTPException(status_code=400, detail="Anda sudah meminta jadwal ini")

    # 🧠 3️⃣ Buat session (sudah pasti konsisten)
    session = {
        "_id": ObjectId(),
        "schedule_id": payload.schedule_id,
        "mahasiswa_id": mahasiswa_id,
        "mahasiswa_name": mahasiswa_name,
        "psychologist_id": schedule.get("psychologist_id"),
        "psychologist_name": schedule.get("psychologist_name"),
        "date": schedule.get("date"),
        "time": schedule.get("time"),
        "status": "requested",
        "requested_at": datetime.utcnow(),
        "is_active": True,
    }

    result = sessions.insert_one(session)

    notif_service = NotificationService(db)
    notif_service._create_notification(
        notif_type="booking_request",
        session_id=str(result.inserted_id),
        message=f"Permintaan konseling dari {mahasiswa_name}",
        to_roles=["psikolog"],
        details={"mahasiswa_id": mahasiswa_id, "mahasiswa_name": mahasiswa_name},
    )

    return {
        "message": "Permintaan booking berhasil dikirim",
        "session_id": str(result.inserted_id),
    }

@router.get("/assessments/latest")
def get_latest_assessment(
    user: dict = Depends(verify_jwt_role(["mahasiswa"])),
    db=Depends(get_db)
):
    pipeline = [
        {
            "$match": {
                "user_id": user["user_id"],
                "is_active": False
            }
        },
        {
            "$sort": {"ended_at": -1}
        },
        {
            "$limit": 1
        },
        {
            "$lookup": {
                "from": "emotion_results",
                "localField": "session_id",
                "foreignField": "session_id",
                "as": "emotion"
            }
        },
        {
            "$unwind": {
                "path": "$emotion",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
        "$lookup": {
            "from": "users",
            "let": {"uid": {"$toObjectId": "$user_id"}},
            "pipeline": [
                {
                    "$match": {
                        "$expr": {
                            "$eq": ["$_id", "$$uid"]
                        }
                    }
                }
            ],
            "as": "user"
        }
    },
    {
        "$unwind": {
            "path": "$user",
            "preserveNullAndEmptyArrays": True
        }
    },
        {
            "$project": {
                "emotion_id": {"$ifNull": ["$emotion._id", None]},
                "session_id": 1,
                "user_id": 1,
                "full_name": "$user.full_name",
                "created_by_role": 1,
                "critical_detected": {"$ifNull": ["$critical_detected", False]},

                "label_emosi": {"$ifNull": ["$emotion.last_emotion", "Tidak diketahui"]},
                "last_emotion": {"$ifNull": ["$emotion.last_emotion", "Tidak diketahui"]},
                "risk_level": {"$ifNull": ["$emotion.risk_level", "Tidak diketahui"]},

                "percentage_negative": {"$ifNull": ["$emotion.percentage_negative", 0]},
                "percentage_positive": {"$ifNull": ["$emotion.percentage_positive", 0]},
                "percentage_neutral": {"$ifNull": ["$emotion.percentage_neutral", 0]},

                "total_messages": {"$ifNull": ["$emotion.total_messages", 0]},
                "max_consecutive_negative": {"$ifNull": ["$emotion.max_consecutive_negative", 0]},
                "average_negative_streak": {"$ifNull": ["$emotion.average_negative_streak", 0]},
                "streak_ge2_count": {"$ifNull": ["$emotion.streak_ge2_count", 0]},

                "high_risk_keyword_count": {"$ifNull": ["$emotion.high_risk_keyword_count", 0]},
                "medium_risk_keyword_count": {"$ifNull": ["$emotion.medium_risk_keyword_count", 0]},

                "emotion_distribution": {"$ifNull": ["$emotion.emotion_distribution", {}]},
                "emotion_percentages": {"$ifNull": ["$emotion.emotion_percentages", {}]},

                "emotion_created_at": "$emotion.created_at",
                "source": {"$ifNull": ["$emotion.source", "chatbot_session_end"]},

                "session_created_at": "$created_at",
                "session_ended_at": "$ended_at",
                "session_is_active": "$is_active"
            }
        }
    ]

    result = list(db["chat_sessions"].aggregate(pipeline))

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Tidak ada sesi assessment ditemukan"
        )

    r = result[0]

    # convert ObjectId ke string
    for k, v in r.items():
        if isinstance(v, ObjectId):
            r[k] = str(v)

    critical = r.get("critical_detected", False)

    assessment = {
        **r,
        "emotion_id": str(r["emotion_id"]) if r.get("emotion_id") else None,
        "follow_up_message": (
            "Disarankan untuk melakukan konseling lanjutan."
            if critical
            else "Sesi pra-konseling selesai. Terima kasih telah berbagi cerita."
        ),
        "follow_up_reason": (
            "Hasil analisis emosi menunjukkan kondisi emosional yang perlu ditangani lebih lanjut."
            if critical
            else "Sesi berakhir tanpa indikasi risiko tinggi."
        )
    }

    return {"assessment": assessment}

@router.post("/sessions/{session_id}/respond")
def respond_session(
    session_id: str, payload: RespondPayload, user: dict = Depends(verify_jwt_user)
):
    db = get_db()
    sessions = db["counseling_sessions"]
    schedules = db["counseling_schedules"]

    # Resolve ObjectId
    try:
        query = {"_id": ObjectId(session_id)}
    except Exception:
        raise HTTPException(status_code=400, detail="Session ID tidak valid")

    session = sessions.find_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    # Pastikan session milik mahasiswa ini
    if session.get("mahasiswa_id") != user.get("user_id"):
        raise HTTPException(status_code=403, detail="Tidak memiliki akses ke session ini")

    current_status = session.get("status")
    action = payload.action

    # =========================
    # ✅ ACCEPT
    # =========================
    if action == "accept":

        # Hanya bisa accept jika sudah di-approve psikolog
        if current_status not in ["accepted", "scheduled"]:
            raise HTTPException(
                status_code=400,
                detail=f"Tidak bisa menyetujui session dengan status '{current_status}'",
            )

        sessions.update_one(
            query,
            {
                "$set": {
                    "status": "confirmed",
                    "confirmed_at": datetime.utcnow(),
                }
            },
        )

        notif_service = NotificationService(db)
        notif_service._create_notification(
            notif_type="session_confirmed_by_mahasiswa",
            session_id=session_id,
            message=f"Mahasiswa {user.get('username')} menyetujui jadwal.",
            to_roles=["psikolog"],
            details={"mahasiswa_id": user.get("user_id")},
        )

        return {"message": "Jadwal berhasil dikonfirmasi"}

    # =========================
    # ❌ REJECT
    # =========================
    if action == "reject":

        if current_status not in ["accepted", "scheduled"]:
            raise HTTPException(
                status_code=400,
                detail=f"Tidak bisa menolak session dengan status '{current_status}'",
            )

        sessions.update_one(
            query,
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": datetime.utcnow(),
                }
            },
        )

        # kembalikan schedule jadi available
        try:
            schedules.update_one(
                {"_id": ObjectId(session.get("schedule_id"))},
                {
                    "$set": {
                        "status": "available",
                        "booked_by": None,
                    }
                },
            )
        except Exception:
            pass

        notif_service = NotificationService(db)
        notif_service._create_notification(
            notif_type="session_rejected_by_mahasiswa",
            session_id=session_id,
            message=f"Mahasiswa {user.get('username')} menolak jadwal.",
            to_roles=["psikolog"],
            details={"mahasiswa_id": user.get("user_id")},
        )

        return {"message": "Jadwal berhasil ditolak"}

    raise HTTPException(status_code=400, detail="Action tidak valid")

@router.get("/notifications")
def get_notifications(user: dict = Depends(verify_jwt_user)):
    db = get_db()
    notifications_col = db["notifications"]
    sessions_col = db["counseling_sessions"]
    users_col = db["users"]

    mahasiswa_id = user.get("user_id")

    notifications = list(
        notifications_col.find(
            {"to_roles": {"$in": ["mahasiswa"]}, "user_id": mahasiswa_id}
        ).sort("created_at", -1)
    )

    result = []

    for n in notifications:
        session = None
        psychologist_full_name = None
        session_id = n.get("session_id")

        if session_id and ObjectId.is_valid(session_id):

            session = sessions_col.find_one(
                {"_id": ObjectId(session_id)},
                {
                    "psychologist_id": 1,
                    "date": 1,
                    "time": 1,
                    "status": 1,
                },
            )

            if session:
                psy = users_col.find_one(
                    {"_id": ObjectId(session["psychologist_id"])},
                    {"full_name": 1}
                )

                if psy:
                    psychologist_full_name = psy.get("full_name")

        result.append(
            {
                "id": str(n["_id"]),
                "type": n.get("type"),
                "session_id": session_id,
                "message": n.get("message"),
                "created_at": format_created_at_wib(n.get("created_at")),
                "is_read": n.get("is_read", False),

                # tambahan field baru
                "psychologist_full_name": psychologist_full_name,
                "session_date": session.get("date") if session else None,
                "session_time": session.get("time") if session else None,
                "session_status": session.get("status") if session else None,
            }
        )

    return {"notifications": result}

@router.get("/counseling/my-sessions")
def get_my_sessions(user: dict = Depends(verify_jwt_user)):

    db = get_db()
    sessions_col = db["counseling_sessions"]
    users_col = db["users"]

    mahasiswa_id = user.get("user_id")
    jakarta_tz = pytz.timezone("Asia/Jakarta")
    now_jakarta = datetime.now(jakarta_tz)

    docs = list(
        sessions_col.find(
            {
                "mahasiswa_id": mahasiswa_id,
                "status": {
                    "$in": [
                        "requested",
                        "rejected",
                        "accepted",
                        "scheduled",
                        "confirmed",
                    ]
                },
            }
        )
    )

    result = []

    for d in docs:
        date_str = d.get("date")
        time_str = d.get("time", "09:00-17:00")

        if not date_str:
            continue

        # Filter session yang sudah lewat
        try:
            if "-" in time_str:
                _, end_time = time_str.split("-")
            else:
                end_time = time_str

            session_end = jakarta_tz.localize(
                datetime.strptime(f"{date_str} {end_time}", "%Y-%m-%d %H:%M")
            )

            if session_end < now_jakarta:
                continue
        except Exception:
            continue

        # Ambil nama psikolog
        psychologist_name = "-"
        psy_id = d.get("psychologist_id")

        if psy_id:
            try:
                psy_doc = users_col.find_one({"_id": ObjectId(psy_id)})
                if psy_doc:
                    psychologist_name = (
                        psy_doc.get("full_name") or psy_doc.get("username") or "-"
                    )
            except:
                pass

        # Ambil nama mahasiswa dari users
        mahasiswa_name = "-"
        mhs_id = d.get("mahasiswa_id")

        if mhs_id:
            try:
                mhs_doc = users_col.find_one({"_id": ObjectId(mhs_id)})
                if mhs_doc:
                    mahasiswa_name = (
                        mhs_doc.get("full_name") or mhs_doc.get("username") or "-"
                    )
            except:
                pass

        # Notes history
        notes = []
        for n in d.get("notes_history", []):
            notes.append(
                {
                    "notes": n.get("notes", "-"),
                    "psychologist_name": (
                        users_col.find_one({"_id": ObjectId(d.get("psychologist_id"))}).get("full_name")
                        if d.get("psychologist_id")
                        else psychologist_name
                    ),
                    "status": n.get("status", "-"),
                    "created_at": format_created_at_wib(n.get("created_at")),
                }
            )

        # Messages
        messages = []
        for m in d.get("messages", []):
            messages.append(
                {
                    "sender": m.get("sender", "-"),
                    "text": m.get("text", "-"),
                    "timestamp": format_created_at_wib(m.get("timestamp")),
                }
            )

        result.append(
            {
                "session_id": str(d.get("_id")),
                "created_at": format_created_at_wib(d.get("created_at")),
                "date": d.get("date"),
                "time": d.get("time", "-"),
                "scheduled_at": format_created_at_wib(d.get("scheduled_at")),
                "psychologist_id": psy_id or "-",
                "psychologist_name": psychologist_name,
                "mahasiswa_id": d.get("mahasiswa_id", "-"),
                "mahasiswa_name": mahasiswa_name,
                "status": d.get("status", "-"),
                "notes_history": notes,
                "messages": messages,
                "is_active": d.get("is_active", True),
                "emotion_history": d.get("emotion_history", []),
            }
        )

    result.sort(key=lambda x: (x["date"], x["time"]))

    return {"sessions": result}

@router.post("/notifications/{notif_id}/mark-read")
def mark_notification_read(notif_id: str, user: dict = Depends(verify_jwt_user)):
    db = get_db()
    notifications = db["notifications"]

    # coba ObjectId
    query = {
        "_id": notif_id,
        "user_id": user.get("user_id"),
        "to_roles": {"$in": ["mahasiswa"]},
    }

    try:
        notif_id = ObjectId(notif_id)
    except Exception:
        pass
    query["_id"] = notif_id  # BARU

    notif = notifications.find_one(query)
    if not notif:
        raise HTTPException(status_code=404, detail="Notifikasi tidak ditemukan")

    notifications.update_one(
        {"_id": notif["_id"]},
        {
            "$set": {"is_read": True, "read_at": datetime.utcnow()},
            "$addToSet": {"read_by": user.get("user_id")},
        },
    )

    return {"message": "Notifikasi ditandai sudah dibaca"}

@router.get("/sessions/{session_id}/notes")
def get_session_notes(session_id: str, user: dict = Depends(verify_jwt_user)):
    db = get_db()
    sessions = db["counseling_sessions"]
    users_col = db["users"]

    query = {"_id": session_id, "mahasiswa_id": user.get("user_id")}

    try:
        query["_id"] = ObjectId(session_id)
    except Exception:
        pass

    session = sessions.find_one(query)
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    # ambil nama psikolog dari users
    psychologist_name = "-"
    psy_id = session.get("psychologist_id")

    if psy_id:
        try:
            psy_doc = users_col.find_one({"_id": ObjectId(psy_id)})
            if psy_doc:
                psychologist_name = (
                    psy_doc.get("full_name") or psy_doc.get("username") or "-"
                )
        except:
            pass

    notes_history = session.get("notes_history", [])

    return {
        "session_id": session_id,
        "notes": [
            {
                "notes": n.get("notes", "-"),
                "psychologist_name": psychologist_name,
                "created_at": format_created_at_wib(n.get("created_at")),
                "status": session.get("status", "-"),
            }
            for n in notes_history
        ],
    }

@router.get("/assessments/history")
def get_assessments_history(user: dict = Depends(verify_jwt_user)):
    """Return full chat session history for the logged-in mahasiswa."""
    db = get_db()
    sessions_col = db["chat_sessions"]
    emotion_results_col = db["emotion_results"]
    recommendations_col = db["recommendations"]

    user_id = user.get("user_id")

    # Ambil semua session mahasiswa, urut dari terbaru
    session_docs = list(sessions_col.find({"user_id": user_id}).sort("created_at", -1))

    if not session_docs:
        return {"history": [], "message": "Belum ada sesi chat."}

    history = []

    for s in session_docs:
        session_id = str(s.get("session_id") or s.get("_id"))

        # Ambil emotion result
        emotion_doc = None
        scores = {}
        emotion_id_str = s.get("last_emotion_result_id")
        if emotion_id_str:
            try:
                emotion_obj_id = ObjectId(emotion_id_str)
                emotion_result_doc = emotion_results_col.find_one(
                    {"_id": emotion_obj_id}
                )
            except Exception:
                emotion_result_doc = None

            if emotion_result_doc:
                emotion_label = (
                    emotion_result_doc.get("label_emosi")
                    or emotion_result_doc.get("label")
                    or "Tidak diketahui"
                )
                confidence = emotion_result_doc.get(
                    "tingkat_kepercayaan"
                ) or emotion_result_doc.get("confidence", 1)
                emotion_doc = {
                    "label_emosi": emotion_label,
                    "tingkat_kepercayaan": confidence,
                }
                scores[emotion_label] = confidence

        # Ambil recommendation
        recommendation = None
        rec_id_str = s.get("last_recommendation_id")
        if rec_id_str:
            try:
                rec_obj_id = ObjectId(rec_id_str)
                recommendation_doc = recommendations_col.find_one({"_id": rec_obj_id})
            except Exception:
                recommendation_doc = None

            if recommendation_doc:
                recommendation = recommendation_doc.get(
                    "teks_rekomendasi"
                ) or recommendation_doc.get("text")

        # Tentukan follow-up
        needs_follow_up = bool(recommendation)

        history.append(
            {
                "session_id": session_id,
                "created_at": s.get("created_at"),
                "ended_at": s.get("ended_at"),
                "emotion_scores": scores,
                "emotion_result": emotion_doc,
                "recommendation": recommendation,
                "needs_follow_up": needs_follow_up,
                "follow_up_message": (
                    "Disarankan untuk melakukan konseling lanjutan."
                    if needs_follow_up
                    else None
                ),
                "follow_up_reason": (
                    "Hasil analisis emosi menunjukkan kondisi emosional yang perlu ditangani lebih lanjut."
                    if needs_follow_up
                    else None
                ),
            }
        )

    return {"history": history}
