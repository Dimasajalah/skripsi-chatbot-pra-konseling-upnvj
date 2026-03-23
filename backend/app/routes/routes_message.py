#backend/app/routes/routes_message.py
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.db import get_db
from app.dependencies import verify_jwt_user, verify_jwt_admin

router = APIRouter(
    prefix="/messages",
    tags=["Message"]
)

@router.get("/session/{session_id}")
def get_messages_by_session(
    session_id: str,
    db=Depends(get_db),
    user: dict = Depends(verify_jwt_user)
):
    session = db["chat_sessions"].find_one({"session_id": session_id})

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    if session["user_id"] != user["user_id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")

    data = db["messages"].find(
        {"session_id": session_id}
    ).sort("waktu_kirim", 1)

    return {
        "messages": [
            {
                "message_id": str(m["_id"]),
                "session_id": m["session_id"],
                "isi_pesan": m["isi_pesan"],
                "pengirim": m["pengirim"],
                "waktu_kirim": m["waktu_kirim"],
                "emotion": m.get("emotion"),
                "emotion_confidence": m.get("emotion_confidence"),
                "intent": m.get("intent"),
                "intent_confidence": m.get("intent_confidence"),
                "response_type": m.get("response_type"),
                "risk": m.get("risk")
            }
            for m in data
        ]
    }

@router.delete("/{message_id}")
def delete_message(
    message_id: str,
    db=Depends(get_db),
    user: dict = Depends(verify_jwt_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")

    try:
        oid = ObjectId(message_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID tidak valid")

    result = db["messages"].delete_one({"_id": oid})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message tidak ditemukan")

    return {"message": "Message berhasil dihapus"}

@router.get("/admin/session/{session_id}")
def get_messages_by_session_admin(
    session_id: str,
    admin: dict = Depends(verify_jwt_admin),
    db=Depends(get_db)
):
    data = db["messages"].find(
        {"session_id": session_id}
    ).sort("waktu_kirim", 1)

    return {
        "messages": [
            {
                "message_id": str(m["_id"]),
                "session_id": m["session_id"],
                "isi_pesan": m["isi_pesan"],
                "pengirim": m["pengirim"],
                "waktu_kirim": m["waktu_kirim"]
            }
            for m in data
        ]
    }
    


