#backend/app/services/ws_manager.py
from typing import Dict, List
from fastapi import WebSocket

class WSManager:
    def __init__(self):
        """
        Struktur:
        self.connections = {
            "admin": [ { "ws": WebSocket, "user_id": str } ],
            "psikolog": [ { "ws": WebSocket, "user_id": str } ],
        }
        """
        self.connections: Dict[str, List[dict]] = {
            "admin": [],
            "psikolog": [],
            "mahasiswa": []
        }

    # ==========================
    # REGISTER / UNREGISTER
    # ==========================
    def register(self, websocket: WebSocket, *, role: str, user_id: str, session_id: str):
        if role not in self.connections:
            return

        # cegah double connection (refresh / reconnect)
        self.connections[role] = [
            conn for conn in self.connections[role]
            if conn["user_id"] != user_id
        ]

        self.connections[role].append({
            "ws": websocket,
            "user_id": user_id,
            "session_id": session_id
        })

    def unregister(self, websocket: WebSocket):
        for role in self.connections:
            self.connections[role] = [
                conn for conn in self.connections[role]
                if conn["ws"] != websocket
            ]

    # ==========================
    # BROADCAST
    # ==========================
    async def broadcast(self, *, role: str, session_id: str, message: dict):
        if role not in self.connections:
            return

        for conn in list(self.connections[role]):
            if conn["session_id"] != session_id:
                continue
            try:
                await conn["ws"].send_json(message)
            except Exception:
                self.unregister(conn["ws"])

ws_manager = WSManager()
