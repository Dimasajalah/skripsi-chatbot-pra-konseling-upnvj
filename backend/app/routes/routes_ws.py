# backend/app/routes/routes_ws.py
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from app.dependencies import verify_token
from app.services.chatbot_handler import handle_chat_message_ws
from app.services.notification_service import NotificationService
from app.services.ws_manager import ws_manager
from app.utils.time_utils import now
from app.db import get_db
from bson import ObjectId
from datetime import datetime
import json
import asyncio

# WebSocket digunakan sebagai media pengiriman pesan real-time
# Sedangkan pemrosesan NLP, deteksi emosi, dan logika chatbot
# mengikuti alur yang sama dengan REST API (/chatbot/message)

router = APIRouter()

@router.websocket("/chatbot/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await websocket.accept()

    try:
        # ======================
        # AUTH
        # ======================
        token = websocket.query_params.get("token")

        if not token:
            await websocket.send_json(
                {"type": "error", "message": "No token provided"}
            )
            await websocket.close(code=1008)
            return

        try:
            user = verify_token(token)
        except Exception:
            await websocket.send_json(
                {"type": "error", "message": "Invalid or expired token"}
            )
            await websocket.close(code=1008)
            return

        # Ambil role dari token (AMAN)
        role = user.get("role")

        # ======================
        # INIT
        # ======================
        db = get_db()

        schedules_col = db["counseling_schedules"]
        sessions_col = db["chat_sessions"]

        session = sessions_col.find_one({"session_id": session_id})

        if not session:
            await websocket.send_json(
                {"type": "error", "message": "Session tidak ditemukan"}
            )
            await websocket.close(code=1008)
            return

        if role == "mahasiswa":
            if session.get("user_id") != user["user_id"]:
                await websocket.send_json(
                    {"type": "error", "message": "Akses session ditolak"}
                )
                await websocket.close(code=1008)
                return
        elif role in ["admin", "psikolog"]:
            # admin & psikolog boleh join untuk monitoring / notifikasi
            pass

        else:
            await websocket.send_json({"type": "error", "message": "Role tidak valid"})
            await websocket.close(code=1008)
            return

        if not session.get("is_active", True):
            await websocket.send_json(
                {"type": "error", "message": "Session sudah ditutup"}
            )
            await websocket.close()
            return

        # register SEMUA role (termasuk mahasiswa)
        ws_manager.register(
            websocket, role=role, user_id=user["user_id"], session_id=session_id
        )

        # ======================
        # MAIN LOOP
        # ======================
        while True:
            try:
                raw = await websocket.receive_text()
                data = json.loads(raw)
                msg_type = data.get("type")
            except WebSocketDisconnect:
                ws_manager.unregister(websocket)
                break
            except Exception:
                continue

            # ==================================================
            # CHAT FLOW
            # ==================================================
            if msg_type == "chat":
                user_text = data.get("message", "").strip()

                if not user_text:
                    await websocket.send_json(
                        {"type": "error", "message": "Pesan tidak boleh kosong"}
                    )
                    continue

                current_session = sessions_col.find_one({"session_id": session_id})

                if not current_session or not current_session.get("is_active", True):
                    await websocket.send_json(
                        {"type": "error", "message": "Session sudah ditutup"}
                    )
                    break

                result = await asyncio.to_thread(
                    handle_chat_message_ws,
                    text=user_text,
                    session_id=session_id,
                    user=user,
                    db=db,
                )

                if result.get("risk") and result["risk"].get("is_critical"):
                    

                    await ws_manager.broadcast(
                        role="admin",
                        session_id=session_id,
                        message={
                            "type": "critical_notification",
                            "session_id": session_id,
                            "risk": result["risk"],
                        },
                    )

                    await ws_manager.broadcast(
                        role="psikolog",
                        session_id=session_id,
                        message={
                            "type": "critical_notification",
                            "session_id": session_id,
                            "risk": result["risk"],
                        },
                    )

                if result["intent"] == "konseling":
                    schedules = list(
                        schedules_col.find(
                            {"status": "available"},
                            {"_id": 1, "psychologist_name": 1, "date": 1, "time": 1},
                        )
                    )

                    result["next_step"] = "show_schedule"
                    result["schedules"] = [
                        {
                            "schedule_id": str(s["_id"]),
                            "psychologist": s["psychologist_name"],
                            "date": s["date"],
                            "time": s["time"],
                        }
                        for s in schedules
                    ]

                await ws_manager.broadcast(
                    role="mahasiswa",
                    session_id=session_id,
                    message={
                        "type": "chat_response",
                        "session_id": session_id,
                        "chatbot_text": result["chatbot_text"],
                        "response_type": result["response_type"],
                        "emotion": result["emotion"],
                        "emotion_confidence": result["emotion_confidence"],
                        "intent": result["intent"],
                        "intent_confidence": result["intent_confidence"],
                        "risk": result["risk"],
                        "meta": result["meta"],
                        "empathetic_text": result["response"].get("empathetic_text"),
                        "suggestion": result["response"].get("suggestion"),
                        "cta": result["response"].get("cta"),
                    },
                )

            # ==================================================
            # SCHEDULE ACTION (APPROVE / REJECT)
            # ==================================================
            elif msg_type == "schedule_action":
                schedule_id = data.get("schedule_id")
                action = data.get("action")

                if not schedule_id or action not in ["approve", "reject"]:
                    continue

                status = "approved" if action == "approve" else "rejected"

                try:
                    schedules_col.update_one(
                        {"_id": ObjectId(schedule_id), "status": "available"},
                        {"$set": {"status": status}},
                    )

                except Exception as e:
                    print(f"[WS] Schedule update error: {e}")

                if status == "approved":
                    # ambil mahasiswa dari chat_session
                    chat_session = sessions_col.find_one({"session_id": session_id})

                    if not chat_session:
                        print("Chat session tidak ditemukan saat create counseling session")
                    else:
                        db["counseling_sessions"].insert_one({
                            "_id": session_id,  # supaya konsisten
                            "mahasiswa_id": chat_session.get("user_id"),
                            "psikolog_id": None,  # akan di-set saat prepare_schedule
                            "status": "requested",
                            "created_at": now()
                        })

                await websocket.send_json(
                    {
                        "type": "schedule_confirmation",
                        "status": status,
                        "message": f"Jadwal konseling berhasil {'dikonfirmasi' if status == 'approved' else 'ditolak'}.",
                    }
                )

    except WebSocketDisconnect:
        print(">>> WS disconnected <<<")
        ws_manager.unregister(websocket)

    except Exception as e:
        print(f">>> WS fatal error: {e}")
