from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from .websocket_manager import register_client, unregister_client
import asyncio
router = APIRouter()

active_connections = {}

@router.websocket("/ws/progress/{book_id}")
async def websocket_endpoint(websocket: WebSocket, book_id: str):
    await websocket.accept()
    register_client(book_id, websocket)

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        unregister_client(websocket)

@router.websocket("/ws/index-progress/{book_id}")
async def websocket_endpoint(websocket: WebSocket, book_id: str):
    await websocket.accept()
    active_connections[book_id] = websocket
    try:
        while True:
            await websocket.receive_text()  # Keep connection open
    except WebSocketDisconnect:
        if book_id in active_connections and active_connections[book_id] == websocket:
            del active_connections[book_id]

def notify_indexing_done(book_id: str):
    import asyncio
    ws = active_connections.get(book_id)
    if ws:
        asyncio.create_task(ws.send_text("done"))