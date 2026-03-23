# backend/app/services/notification_service.py
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.utils.time_utils import now

class NotificationService:
    """
    Centralized notification service.
    Semua pembuatan notifikasi (critical, schedule, rekomendasi)
    HARUS lewat service ini agar konsisten antara REST & WebSocket.
    """

    def __init__(self, db):
        self.db = db
        self.notifications = db["notifications"]

    # =====================================================
    # CORE HELPERS
    # =====================================================
    # baris sekitar 50
    # Tambahkan ini ke kelas NotificationService

    def _create_notification(
        self,
        *,
        notif_type: str,
        session_id: str,
        message: str,
        to_roles: list,
        details: Optional[dict] = None,
    ):
        doc = {
            "type": notif_type,
            "session_id": session_id,
            "message": message,
            "to_roles": to_roles,
            "user_id": details.get("mahasiswa_id") if details else None,
            "details": details,
            "created_at": now(),
            "is_read": False,
            "read_by": [],
            "read_at": None,
        }
        return self.notifications.insert_one(doc).inserted_id

    # =====================================================
    # CRITICAL RISK
    # =====================================================
    # baris sekitar 50
    # baris 61 (create_critical_notification)
    def create_critical_notification(
        self,
        *,
        session_id: str,
        user_id: str,
        risk_data: dict
    ):
        if not isinstance(user_id, str):
            user_id = str(user_id)

        return self._create_notification(
            notif_type="critical_alert",
            session_id=session_id,
            message="Terdeteksi risiko psikologis kritis pada sesi chatbot.",
            to_roles=["admin", "psikolog"],
            details={
                **risk_data,
                "mahasiswa_id": user_id
            }
        )

    # =====================================================
    # SCHEDULE FLOW
    # =====================================================
    def notify_schedule_proposed(
        self,
        *,
        session_id: str,
        psychologist_name: str,
        mahasiswa_id: str,
    ):
        return self._create_notification(
            notif_type="schedule_proposed",
            session_id=session_id,
            message=f"Psikolog {psychologist_name} mengajukan jadwal konseling.",
            to_roles=["mahasiswa"],
            details={
                "mahasiswa_id": str(mahasiswa_id)
            }
        )

    def notify_schedule_confirmed(
        self,
        *,
        session_id: str,
        approved: bool,
    ):
        """
        Mahasiswa menyetujui / menolak jadwal
        Target: psikolog & admin
        """
        status = "disetujui" if approved else "ditolak"
        return self._create_notification(
            notif_type="schedule_confirmation",
            session_id=session_id,
            message=f"Jadwal konseling telah {status} oleh mahasiswa.",
            to_roles=["admin", "psikolog"],
        )
        
        # =====================================================
    # MANUAL / FOLLOW UP (Psikolog → Mahasiswa)
    # =====================================================
    def notify_follow_up(
        self,
        *,
        mahasiswa_id: str,
        message: str,
        session_id: Optional[str] = None,
        notif_type: str = "follow_up",
    ):
        """
        Psikolog mengirim notifikasi langsung ke mahasiswa
        tanpa membuat jadwal konseling
        """
        return self._create_notification(
            notif_type=notif_type,
            session_id=session_id,
            message=message,
            to_roles=["mahasiswa"],
            details={
                "mahasiswa_id": str(mahasiswa_id)
            }
        )

    # =====================================================
    # GENERIC FETCH / UPDATE
    # =====================================================
    def get_notifications_for_role(self, role: str, *, only_unread: bool = False):
        query = {"to_roles": {"$in": [role]}}

        if only_unread:
            query["is_read"] = False

        return list(
            self.notifications.find(
                query,
                {
                    "_id": 1,
                    "type": 1,
                    "session_id": 1,
                    "message": 1,
                    "created_at": 1,
                    "is_read": 1,
                    "read_by": 1,
                }
            ).sort("created_at", -1)
        )

    def mark_as_read(self, notif_id, *, read_by: str):
        try:
            query = {"_id": ObjectId(notif_id)}
        except Exception:
            query = {"_id": notif_id}

        return self.notifications.update_one(
            query,
            {
                "$addToSet": {"read_by": read_by},
                "$set": {
                    "is_read": True,
                    "read_at": now(),
                }
            },
        )


