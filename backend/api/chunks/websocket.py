from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from .websocket_manager import register_client, unregister_client
import asyncio
router = APIRouter()

@router.websocket("/ws/progress/{book_id}")
async def websocket_endpoint(websocket: WebSocket, book_id: str):
    await websocket.accept()
    register_client(book_id, websocket)

    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        unregister_client(websocket)
