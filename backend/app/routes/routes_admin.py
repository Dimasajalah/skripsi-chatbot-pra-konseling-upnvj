# backend/app/routes/routes_admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from bson import ObjectId
from app.dependencies import verify_jwt_admin
from app.services.notification_service import NotificationService
from app.db import get_db
from pymongo.errors import PyMongoError
from pydantic import BaseModel
from app.utils.time_utils import now
from zoneinfo import ZoneInfo

router = APIRouter(tags=["Admin"])

WIB = ZoneInfo("Asia/Jakarta")


class ScheduleRequest(BaseModel):
    date: str
    time: str


class AdminNoteRequest(BaseModel):
    content: str

def format_wib(dt: datetime) -> str:
    if not dt:
        return None
    
    # pastikan datetime punya timezone (anggap UTC kalau belum)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    
    # convert ke WIB
    dt_wib = dt.astimezone(WIB)
    
    # format: hari/bulan/tahun jam:menit:detik
    return dt_wib.strftime("%d/%m/%Y %H:%M:%S")

@router.get("/critical-cases")
def get_critical_cases(admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    sessions = db["chat_sessions"]

    pipeline = [
        {"$match": {"critical_detected": True}},
        {
            "$addFields": {
                "user_object_id": {
                    "$cond": [
                        {
                            "$and": [
                                {"$ne": ["$user_id", None]},
                                {"$ne": ["$user_id", ""]},
                            ]
                        },
                        {"$toObjectId": "$user_id"},
                        None,
                    ]
                }
            }
        },
        # Join users
        {
            "$addFields": {
                "user_object_id": {
                    "$cond": [
                        {"$ne": ["$user_id", None]},
                        {"$toObjectId": "$user_id"},
                        None,
                    ]
                }
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "user_object_id",
                "foreignField": "_id",
                "as": "user",
            }
        },
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        # Join emotion_results (pakai last_emotion_result_id)
        {
            "$addFields": {
                "emotion_object_id": {
                    "$cond": [
                        {
                            "$and": [
                                {"$ne": ["$last_emotion_result_id", None]},
                                {"$ne": ["$last_emotion_result_id", ""]},
                            ]
                        },
                        {"$toObjectId": "$last_emotion_result_id"},
                        None,
                    ]
                }
            }
        },
        {
            "$lookup": {
                "from": "emotion_results",
                "localField": "emotion_object_id",
                "foreignField": "_id",
                "as": "emotion_data",
            }
        },
        {"$unwind": {"path": "$emotion_data", "preserveNullAndEmptyArrays": True}},
        # Join recommendations
        {
            "$addFields": {
                "recommendation_object_id": {
                    "$cond": [
                        {
                            "$and": [
                                {"$ne": ["$last_recommendation_id", None]},
                                {"$ne": ["$last_recommendation_id", ""]},
                            ]
                        },
                        {"$toObjectId": "$last_recommendation_id"},
                        None,
                    ]
                }
            }
        },
        {
            "$lookup": {
                "from": "recommendations",
                "localField": "recommendation_object_id",
                "foreignField": "_id",
                "as": "recommendation_data",
            }
        },
        {
            "$unwind": {
                "path": "$recommendation_data",
                "preserveNullAndEmptyArrays": True,
            }
        },
        {
            "$addFields": {
                "last_emotion_data": {"$arrayElemAt": ["$emotion_history", -1]}
            }
        },
        # Final projection
        {
            "$project": {
                "_id": 0,
                "username": {"$ifNull": ["$user.username", "$username"]},
                "full_name": {"$ifNull": ["$user.full_name", None]},
                "session_id": 1,
                "user_id": 1,
                "created_at": 1,
                "ended_at": 1,
                "is_active": 1,
                "emotion_history": 1,
                "critical_detected": 1,
                "last_emotion": "$last_emotion_data.label",
                "emotion_confidence": "$last_emotion_data.confidence",
                "last_recommendation": "$recommendation_data.teks_rekomendasi",
            }
        },
        {"$sort": {"created_at": -1}},
    ]

    data = list(sessions.aggregate(pipeline))

    # Paksa urutan key secara manual
    ordered_data = []
    for item in data:
        if item.get("created_at"):
            item["created_at"] = (
                item["created_at"]
                .replace(tzinfo=ZoneInfo("UTC"))
                .astimezone(WIB)
                .strftime("%Y-%m-%d %H:%M:%S WIB")
            )

            if item.get("ended_at"):
                item["ended_at"] = (
                    item["ended_at"]
                    .replace(tzinfo=ZoneInfo("UTC"))
                    .astimezone(WIB)
                    .strftime("%Y-%m-%d %H:%M:%S WIB")
                )
        ordered_data.append(
            {
                "username": item.get("username"),
                "full_name": item.get("full_name"),
                "session_id": item.get("session_id"),
                "user_id": item.get("user_id"),
                "created_at": item.get("created_at"),
                "ended_at": item.get("ended_at"),
                "is_active": item.get("is_active"),
                "emotion_history": item.get("emotion_history"),
                "critical_detected": item.get("critical_detected"),
                "last_emotion": item.get("last_emotion"),
                "emotion_confidence": item.get("emotion_confidence"),
                "last_recommendation": item.get("last_recommendation"),
            }
        )

    return {"critical_cases": ordered_data}


@router.get("/notifications")
def get_notifications(admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    notifications = db["notifications"]

    pipeline = [
        # 1️⃣ Hanya notifikasi untuk admin
        {"$match": {"to_roles": "admin"}},
        # 2️⃣ Convert user_id atau details.mahasiswa_id ke ObjectId
        {
            "$addFields": {
                "mahasiswa_object_id": {
                    "$cond": [
                        {"$ifNull": ["$user_id", False]},
                        {"$toObjectId": "$user_id"},
                        {
                            "$cond": [
                                {"$ifNull": ["$details.mahasiswa_id", False]},
                                {"$toObjectId": "$details.mahasiswa_id"},
                                None,
                            ]
                        },
                    ]
                }
            }
        },
        # 3️⃣ Join ke users
        {
            "$lookup": {
                "from": "users",
                "localField": "mahasiswa_object_id",
                "foreignField": "_id",
                "as": "mahasiswa",
            }
        },
        {"$unwind": {"path": "$mahasiswa", "preserveNullAndEmptyArrays": False}},
        # 4️⃣ Filter hanya role mahasiswa
        {"$match": {"mahasiswa.role": "mahasiswa"}},
        # 5️⃣ Format output
        {
            "$project": {
                "_id": 1,
                "type": 1,
                "session_id": 1,
                "message": 1,
                "created_at": 1,
                "is_read": 1,
                "mahasiswa_id": "$mahasiswa._id",
                "mahasiswa_name": "$mahasiswa.full_name",
                "mahasiswa_username": "$mahasiswa.username",
            }
        },
        {"$sort": {"created_at": -1}},
    ]

    data = list(notifications.aggregate(pipeline))

    return {
        "notifications": [
            {
                "mahasiswa_name": n.get("mahasiswa_name"),
                "mahasiswa_username": n.get("mahasiswa_username"),
                "mahasiswa_id": str(n.get("mahasiswa_id")),
                "type": n.get("type"),
                "message": n.get("message"),
                "created_at": format_wib(n.get("created_at")),
                "is_read": n.get("is_read", False),
            }
            for n in data
        ]
    }


@router.post("/notifications/{notif_id}/mark-read")
def mark_notification_read(notif_id: str, admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    notif_service = NotificationService(db)

    updated = notif_service.mark_as_read(notif_id, read_by=admin["user_id"])

    if updated.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"message": "Notification marked as read"}


@router.get("/users")
def get_all_users(admin: dict = Depends(verify_jwt_admin)):
    """
    Menampilkan semua user di sistem.
    Hanya bisa diakses oleh Admin ULBK.
    Password tidak dikembalikan.
    """
    try:
        db = get_db()
        users_col = db["users"]  # pastikan nama koleksi sesuai
        users_cursor = users_col.find({}, {"password": 0})  # jangan kirim password
        users = []
        for user in users_cursor:
            user["_id"] = str(user.get("_id"))
            users.append(user)

        if not users:
            return {"message": "Tidak ada user di sistem", "users": []}

        return {"users": users}

    except PyMongoError as e:
        raise HTTPException(
            status_code=500, detail=f"Terjadi kesalahan database: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")


from bson import ObjectId


@router.get("/counseling/requests")
def get_counseling_requests(
    status: str | None = None, admin: dict = Depends(verify_jwt_admin)
):
    db = get_db()
    col = db["counseling_sessions"]

    match_stage = {
        "status": {"$exists": True, "$ne": None},
        "date": {"$exists": True, "$ne": None},
        "time": {"$exists": True, "$ne": None},
        "mahasiswa_id": {"$exists": True, "$ne": None},
    }

    if status:
        match_stage["status"] = status

    pipeline = [
        {"$match": match_stage},
        # convert mahasiswa_id -> ObjectId
        {"$addFields": {"mahasiswa_obj_id": {"$toObjectId": "$mahasiswa_id"}}},
        {
            "$lookup": {
                "from": "users",
                "localField": "mahasiswa_obj_id",
                "foreignField": "_id",
                "as": "mahasiswa",
            }
        },
        {"$unwind": {"path": "$mahasiswa", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 1,
                "mahasiswa_id": 1,
                "mahasiswa_name": "$mahasiswa.full_name",
                "psychologist_name": 1,
                "date": 1,
                "time": 1,
                "status": 1,
                "requested_at": 1,
                "rejection_reason": 1,
            }
        },
        {"$sort": {"requested_at": -1}},
    ]

    data_cursor = col.aggregate(pipeline)

    data = []

    for d in data_cursor:
        d["id"] = str(d.pop("_id"))

        if d.get("requested_at"):
            utc_time = d["requested_at"].replace(tzinfo=ZoneInfo("UTC"))
            wib_time = utc_time.astimezone(WIB)
            d["requested_at"] = wib_time.strftime("%Y-%m-%d %H:%M:%S WIB")

        cleaned = {k: v for k, v in d.items() if v not in [None, "", []]}

        if cleaned:
            data.append(cleaned)

    if not data:
        return {"total": 0, "message": "Tidak ada data"}

    return {"total": len(data), "requests": data, "message": "Success"}


@router.post("/counseling/{session_id}/schedule")
def schedule_counseling(
    session_id: str, payload: ScheduleRequest, admin: dict = Depends(verify_jwt_admin)
):
    db = get_db()
    col = db["counseling_sessions"]

    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID tidak valid")

    result = col.update_one(
        {"_id": oid},
        {
            "$set": {
                "date": payload.date,
                "time": payload.time,
                "status": "confirmed",
                "scheduled_by": admin["user_id"],
                "scheduled_at": now(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Permohonan tidak ditemukan")

    session = col.find_one({"_id": oid})

    notif_service = NotificationService(db)
    notif_service.notify_schedule_confirmed(session_id=session_id, approved=True)

    return {"message": "Konseling berhasil dijadwalkan"}


@router.post("/counseling/{session_id}/reject")
def reject_counseling(session_id: str, admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    col = db["counseling_sessions"]

    try:
        oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID tidak valid")

    result = col.update_one(
        {"_id": oid},
        {
            "$set": {
                "status": "rejected",
                "rejected_by": admin["user_id"],
                "rejected_at": now(),
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Permohonan tidak ditemukan")

    session = col.find_one({"_id": oid})

    if session and session.get("schedule_id"):
        schedules = db["counseling_schedules"]
        schedules.update_one(
            {"_id": ObjectId(session["schedule_id"])},
            {"$set": {"status": "available", "booked_by": None}},
        )

    notif_service = NotificationService(db)
    notif_service.notify_schedule_confirmed(session_id=session_id, approved=False)

    return {"message": "Permohonan konseling ditolak"}

@router.get("/admin/all")
def list_all_chat_sessions(
    session_id: str | None = Query(default=None),
    admin: dict = Depends(verify_jwt_admin),
    db=Depends(get_db),
):
    chat_sessions_col = db["chat_sessions"]
    counseling_col = db["counseling_sessions"]
    users_col = db["users"]
    emotion_col = db["emotion_results"]

    try:
        # =========================
        # 🔥 ONLY NON ACTIVE SESSION
        # =========================
        sessions = list(
            chat_sessions_col.find(
                {"is_active": False},
                {
                    "_id": 0,
                    "session_id": 1,
                    "user_id": 1,
                    "username": 1,
                    "created_by_role": 1,
                    "created_at": 1,
                    "ended_at": 1,
                    "is_active": 1,
                    "critical_detected": 1,
                    "last_emotion": 1,
                    "emotion_percentages": 1,
                    "percentage_negative": 1,
                    "percentage_positive": 1,
                    "percentage_neutral": 1,
                },
            )
        )

        # =========================
        # 🔹 USER MAP
        # =========================
        user_ids = list({s.get("user_id") for s in sessions if s.get("user_id")})

        valid_user_ids = []
        for uid in user_ids:
            try:
                valid_user_ids.append(ObjectId(uid))
            except:
                continue

        users_map = {}
        if valid_user_ids:
            users_cursor = users_col.find(
                {"_id": {"$in": valid_user_ids}},
                {"full_name": 1},
            )
            users_map = {str(u["_id"]): u.get("full_name", "") for u in users_cursor}

        # =========================
        # 🔹 COUNSELING MAP
        # =========================
        counseling_map = {}
        if user_ids:
            counseling_cursor = counseling_col.find(
                {"mahasiswa_id": {"$in": user_ids}},
                {"mahasiswa_id": 1, "status": 1},
            )
            for c in counseling_cursor:
                counseling_map[c["mahasiswa_id"]] = c.get("status", "unknown")

        # =========================
        # 🔹 FORMAT WIB
        # =========================
        def format_wib_safe(dt):
            if not isinstance(dt, datetime):
                return "-"
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=ZoneInfo("UTC"))
            return dt.astimezone(WIB).strftime("%d/%m/%Y %H:%M:%S")

        # =========================
        # 🔹 BUILD RESPONSE
        # =========================
        for s in sessions:
            uid = s.get("user_id")

            # 🔹 USER NAME
            s["user_name"] = users_map.get(uid) or s.get("username") or "Unknown"

            # 🔹 COUNSELING
            s["counseling_status"] = counseling_map.get(uid, "none")

            # 🔹 EMOTION %
            emo_pct = s.get("emotion_percentages") or {}

            s["percentage_positive"] = (
                s.get("percentage_positive")
                or emo_pct.get("senang_pct")
                or 0
            )

            s["percentage_negative"] = (
                s.get("percentage_negative")
                or (
                    emo_pct.get("sedih_pct", 0)
                    + emo_pct.get("marah_pct", 0)
                    + emo_pct.get("cemas_pct", 0)
                )
                or 0
            )

            s["percentage_neutral"] = (
                s.get("percentage_neutral")
                or emo_pct.get("netral_pct")
                or 0
            )

            # 🔥 RISK LEVEL (NEW)
            # priority:
            # 1. dari emotion_results
            # 2. fallback hitung sendiri
            emotion = emotion_col.find_one(
                {"session_id": s["session_id"]},
                {"_id": 0, "risk_level": 1}
            )

            if emotion and emotion.get("risk_level"):
                s["risk_level"] = emotion["risk_level"]
            else:
                # fallback logic sederhana
                if s["percentage_negative"] >= 60:
                    s["risk_level"] = "High"
                elif s["percentage_negative"] >= 30:
                    s["risk_level"] = "Medium"
                else:
                    s["risk_level"] = "Low"

            # 🔹 ADMIN FLAG
            s["need_admin_attention"] = (
                s.get("created_by_role") == "mahasiswa"
                and (s.get("critical_detected"))
            )

            # 🔹 PRIORITY
            if s.get("critical_detected"):
                s["priority"] = "high"
            else:
                s["priority"] = "low"

            # 🔹 SIMPAN RAW DATETIME UNTUK SORT
            raw_created = s.get("created_at")

            # 🔹 FORMAT TIME
            s["created_at"] = format_wib_safe(s.get("created_at"))
            s["ended_at"] = format_wib_safe(s.get("ended_at"))

            # =========================
            # 🔥 DETAIL MODE
            # =========================
            if session_id and s.get("session_id") == session_id:

                full_session = chat_sessions_col.find_one(
                    {"session_id": session_id},
                    {
                        "_id": 0,
                        "emotion_history": 1,
                    }
                )

                history = full_session.get("emotion_history", []) if full_session else []

                formatted_history = []
                for h in history:
                    ts = h.get("timestamp")

                    if isinstance(ts, datetime):
                        if ts.tzinfo is None:
                            ts = ts.replace(tzinfo=ZoneInfo("UTC"))
                        ts = ts.astimezone(WIB).strftime("%d/%m/%Y %H:%M:%S")
                    else:
                        ts = "-"

                    formatted_history.append({
                        "label": h.get("label", "-"),
                        "confidence": h.get("confidence", 0),
                        "text": h.get("text", ""),
                        "timestamp": ts,
                    })

                s["emotion_history"] = formatted_history

                # 🔹 FULL SUMMARY
                emotion_full = emotion_col.find_one(
                    {"session_id": session_id},
                    {"_id": 0}
                )

                if emotion_full:
                    emotion_full["created_at"] = format_wib_safe(
                        emotion_full.get("created_at")
                    )

                s["emotion_summary"] = emotion_full or {}

            # simpan raw untuk sorting
            s["_sort_time"] = raw_created if isinstance(raw_created, datetime) else datetime.min

        # =========================
        # 🔥 SORT REAL DATETIME
        # =========================
        sessions.sort(
            key=lambda x: x["_sort_time"],
            reverse=True
        )

        # hapus field bantu
        for s in sessions:
            s.pop("_sort_time", None)

        return {"sessions": sessions}

    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/archives/sessions")
def get_archived_chat_sessions(admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    sessions_col = db["chat_sessions"]
    users_col = db["users"]

    pipeline = [
        {
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "user",
            }
        },
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        # Filter hanya mahasiswa
        {"$match": {"user.role": "mahasiswa"}},
        {
            "$project": {
                "_id": 0,
                "session_id": 1,
                "created_at": 1,
                "ended_at": 1,
                "is_active": 1,
                "critical_detected": 1,
                "user_id": 1,
                "full_name": "$user.full_name",
                "email": "$user.email",
                "angkatan": "$user.angkatan",
            }
        },
        {"$sort": {"created_at": -1}},
    ]

    data = list(sessions_col.aggregate(pipeline))

    return {"total_sessions": len(data), "data": data}


@router.get("/admin/archives/emotions")
def get_archived_emotion_results(admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    emotions_col = db["emotion_results"]

    pipeline = [
        # Join ke chat_sessions
        {
            "$lookup": {
                "from": "chat_sessions",
                "localField": "session_id",
                "foreignField": "session_id",
                "as": "session",
            }
        },
        {"$unwind": "$session"},
        # Convert user_id string -> ObjectId
        {"$addFields": {"user_object_id": {"$toObjectId": "$session.user_id"}}},
        # Join ke users via _id
        {
            "$lookup": {
                "from": "users",
                "localField": "user_object_id",
                "foreignField": "_id",
                "as": "user",
            }
        },
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        # Filter hanya mahasiswa
        {"$match": {"user.role": "mahasiswa"}},
        # Project final fields
        {
            "$project": {
                "_id": 1,
                "session_id": 1,
                "risk_level": 1,
                "percentage_negative": 1,
                "percentage_positive": 1,
                "percentage_neutral": 1,
                "last_emotion": 1,
                "created_at": 1,
                "full_name": "$user.full_name",
                "angkatan": "$user.angkatan",
            }
        },
        {"$sort": {"created_at": -1}},
    ]

    data = list(emotions_col.aggregate(pipeline))

    for d in data:
        d["emotion_id"] = str(d.pop("_id"))

    return {
        "total_emotion_results": len(data),
        "data": data,
    }

@router.get("/admin/reports/summary")
def get_system_report_summary(admin: dict = Depends(verify_jwt_admin)):
    db = get_db()

    # ---------------------------
    # SESSION SUMMARY
    # ---------------------------
    total_sessions = db["chat_sessions"].count_documents({})
    total_active_sessions = db["chat_sessions"].count_documents({"is_active": True})
    total_critical_sessions = db["chat_sessions"].count_documents({"critical_detected": True})

    # ---------------------------
    # EMOTION SUMMARY dari chat_sessions
    # ---------------------------
    pipeline = [
        {"$unwind": "$emotion_history"},  # expand tiap message
        {
            "$group": {
                "_id": "$emotion_history.label",  # label emosi asli
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$emotion_history.confidence"},
            }
        },
        {"$sort": {"count": -1}}
    ]

    emotion_distribution_raw = list(db["chat_sessions"].aggregate(pipeline))
    total_emotions = sum(e["count"] for e in emotion_distribution_raw)

    # pastikan semua 5 label utama ada
    main_labels = ["senang", "sedih", "marah", "cemas", "netral"]
    final_distribution = []

    for lbl in main_labels:
        found = next((x for x in emotion_distribution_raw if x["_id"] == lbl), None)
        if found:
            final_distribution.append({
                "label": lbl,
                "count": found["count"],
                "avg_confidence": round(found.get("avg_confidence") or 0, 2)
            })
        else:
            final_distribution.append({
                "label": lbl,
                "count": 0,
                "avg_confidence": 0
            })

    return {
        "total_sessions": total_sessions,
        "total_active_sessions": total_active_sessions,
        "total_critical_sessions": total_critical_sessions,
        "total_emotion_results": total_emotions,
        "emotion_distribution": final_distribution
    }

@router.get("/sessions/{session_id}/emotion")
def get_emotion_result_by_session(
    session_id: str, admin: dict = Depends(verify_jwt_admin)
):
    db = get_db()
    emotions_col = db["emotion_results"]

    data = list(
        emotions_col.find(
            {"session_id": session_id},
            {"_id": 0, "label": 1, "label_emosi": 1, "created_at": 1},
        )
    )

    # return kosong kalau tidak ada
    distribution = {}
    for d in data:
        label = d.get("label") or d.get("label_emosi") or "unknown"
        distribution[label] = distribution.get(label, 0) + 1

    return {
        "session_id": session_id,
        "total_data": len(data),
        "emotion_distribution": distribution,
    }


@router.post("/admin/sessions/{session_id}/notes")
def add_admin_note(
    session_id: str, payload: AdminNoteRequest, admin: dict = Depends(verify_jwt_admin)
):
    db = get_db()
    sessions = db["chat_sessions"]

    note = {
        "note_id": str(ObjectId()),
        "admin_id": admin["user_id"],
        "admin_name": admin.get("full_name", "Admin"),
        "content": payload.content,
        "created_at": now(),
    }

    result = sessions.update_one(
        {"session_id": session_id}, {"$push": {"admin_notes": note}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return {"message": "Catatan admin berhasil ditambahkan", "note": note}


@router.get("/admin/sessions/{session_id}/notes")
def get_admin_notes(session_id: str, admin: dict = Depends(verify_jwt_admin)):
    db = get_db()
    sessions = db["chat_sessions"]

    session = sessions.find_one(
        {"session_id": session_id}, {"_id": 0, "admin_notes": 1}
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return {"session_id": session_id, "notes": session.get("admin_notes", [])}


@router.get("/admin/archived-emotions")
def get_archived_emotions(admin: dict = Depends(verify_jwt_admin), db=Depends(get_db)):
    chat_col = db["chat_sessions"]

    pipeline = [
        # 🔹 JOIN USER
        {
            "$lookup": {
                "from": "users",
                "localField": "username",
                "foreignField": "username",
                "as": "user",
            }
        },
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        # 🔥 JOIN emotion_results (AMBIL TERBARU SAJA)
        {
            "$lookup": {
                "from": "emotion_results",
                "let": {"sid": "$session_id"},
                "pipeline": [
                    {"$match": {"$expr": {"$eq": ["$session_id", "$$sid"]}}},
                    {"$sort": {"created_at": -1}},
                    {"$limit": 1},
                ],
                "as": "emotion_result",
            }
        },
        {"$unwind": {"path": "$emotion_result", "preserveNullAndEmptyArrays": True}},
        # 🔹 FILTER WAJIB
        {
            "$match": {
                "created_by_role": "mahasiswa",
                "is_active": False,
            }
        },
        # 🔥 SMART MERGE (ANTI DUPLIKAT FIELD)
        # 🔥 SMART MERGE (ANTI DUPLIKAT FIELD)
        {
            "$addFields": {
                "full_name": {"$ifNull": ["$user.full_name", "$username"]},
                "email": "$user.email",
                "risk_level": "$emotion_result.risk_level",
                "percentage_negative": {
                    "$ifNull": [
                        "$emotion_result.percentage_negative",
                        "$percentage_negative",
                    ]
                },
                "percentage_positive": {
                    "$ifNull": [
                        "$emotion_result.percentage_positive",
                        "$percentage_positive",
                    ]
                },
                "percentage_neutral": {
                    "$ifNull": [
                        "$emotion_result.percentage_neutral",
                        "$percentage_neutral",
                    ]
                },
                "last_emotion": {
                    "$ifNull": ["$emotion_result.last_emotion", "$last_emotion"]
                },
                "max_consecutive_negative": {
                    "$ifNull": [
                        "$emotion_result.max_consecutive_negative",
                        "$max_consecutive_negative",
                    ]
                },
                "average_negative_streak": {
                    "$ifNull": [
                        "$emotion_result.average_negative_streak",
                        "$average_negative_streak",
                    ]
                },
                "streak_ge2_count": {
                    "$ifNull": ["$emotion_result.streak_ge2_count", "$streak_ge2_count"]
                },
                "total_messages": "$emotion_result.total_messages",
            }
        },
        # ✅ PINDAHKAN FIELD KE DEPAN (INI STAGE BARU)
        {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [
                        {"full_name": "$full_name", "email": "$email"},
                        "$$ROOT",
                    ]
                }
            }
        },
        # 🔥 BUANG FIELD YANG TIDAK DIPAKAI
        {"$project": {"user": 0, "emotion_result": 0, "username": 0}},
        {"$sort": {"created_at": -1}},
    ]

    raw_sessions = list(chat_col.aggregate(pipeline))

    # 🔥 CLEANER (WAJIB BIAR GA ERROR ObjectId)
    def clean_mongo_data(data):
        if isinstance(data, dict):
            return {k: clean_mongo_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [clean_mongo_data(item) for item in data]
        elif isinstance(data, ObjectId):
            return str(data)
        elif isinstance(data, datetime):
            return data.astimezone(WIB).strftime("%d/%m/%Y, %H:%M:%S WIB")
        else:
            return data

    sessions = [clean_mongo_data(s) for s in raw_sessions]

    return {"total_sessions": len(sessions), "sessions": sessions}
