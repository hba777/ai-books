from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from .websocket_manager import register_client, unregister_client
import asyncio
router = APIRouter()

active_connections = {}
analysis_connections = {}

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

async def notify_indexing_done(book_id: str):
    ws = active_connections.get(book_id)
    print(f"[WebSocket Notify] Sending 'done' to {book_id}")
    if ws:
        await ws.send_text("done")


@router.websocket("/ws/analysis-progress/{book_id}")
async def analysis_progress_websocket(websocket: WebSocket, book_id: str):
    await websocket.accept()
    analysis_connections[book_id] = websocket
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        if book_id in analysis_connections and analysis_connections[book_id] == websocket:
            del analysis_connections[book_id]

async def notify_analysis_progress(book_id: str, progress: int, total: int, done: int):
    ws = analysis_connections.get(book_id)
    if ws:
        await ws.send_json({
            "analysis_progress": progress,
            "analysis_total": total,
            "analysis_done": done
        })
