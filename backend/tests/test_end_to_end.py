# backend/tests/test_end_to_end.py
import pytest
import asyncio
from websockets import connect as ws_connect
import json
import os

@pytest.mark.asyncio
@pytest.mark.skipif(True, reason="Enable when server is running at localhost:8000")
async def test_ws_chat_e2e():
    uri = "ws://localhost:8000/ws/chat/test-user"
    async with ws_connect(uri) as ws:
        await ws.send(json.dumps({"text": "saya cemas menghadapi ujian"}))
        resp = await asyncio.wait_for(ws.recv(), timeout=10.0)
        data = json.loads(resp)
        assert "emotion" in data
        assert "response" in data
