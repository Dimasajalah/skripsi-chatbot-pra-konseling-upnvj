# backend/app/routes/routes_chatsession.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.db import get_db
from app.dependencies import verify_jwt_user, verify_jwt_admin

router = APIRouter(prefix="/chat-sessions", tags=["ChatSession"])


@router.get("/")
def list_chat_sessions(user: dict = Depends(verify_jwt_user), db=Depends(get_db)):
    sessions = db["chat_sessions"].find(
        {"mahasiswa_id": user["user_id"]},
        {
            "_id": 0,
            "session_id": 1,
            "mahasiswa_id": 1,
            "created_at": 1,
            "ended_at": 1,
            "is_active": 1,
            "critical_detected": 1,
            "messages": 1,
        },
    )

    result = []
    for s in sessions:
        result.append(
            {
                "session_id": s["session_id"],
                "created_at": s.get("created_at"),
                "closed_at": s.get("ended_at"),
                "status_session": "active" if s.get("is_active") else "closed",
                "critical_detected": s.get("critical_detected", False),
            }
        )

    return {"sessions": result}


@router.get("/{session_id}")
def get_chat_session(
    session_id: str, user: dict = Depends(verify_jwt_user), db=Depends(get_db)
):
    session = db["chat_sessions"].find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    if session["mahasiswa_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    session["_id"] = str(session["_id"])
    return session


@router.put("/{session_id}/close")
def close_chat_session(
    session_id: str, user: dict = Depends(verify_jwt_user), db=Depends(get_db)
):
    session = db["chat_sessions"].find_one({"session_id": session_id})

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    if session["mahasiswa_id"] != user["user_id"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    messages = db["messages"].find({"session_id": session_id})
    critical = any(m.get("risk", {}).get("is_critical") for m in messages)

    result = db["chat_sessions"].update_one(
        {"session_id": session_id},
        {
            "$set": {
                "is_active": False,
                "ended_at": datetime.utcnow(),
                "critical_detected": critical,
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return {"message": "Session ditutup"}


@router.delete("/{session_id}")
def delete_chat_session(
    session_id: str, admin: dict = Depends(verify_jwt_admin), db=Depends(get_db)
):
    result = db["chat_sessions"].delete_one({"session_id": session_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return {"message": "Session berhasil dihapus"}


@router.get("/admin/{session_id}")
def get_chat_session_admin(
    session_id: str, admin: dict = Depends(verify_jwt_admin), db=Depends(get_db)
):
    session = db["chat_sessions"].find_one({"session_id": session_id}, {"_id": 0})

    if not session:
        raise HTTPException(status_code=404, detail="Session tidak ditemukan")

    return session
