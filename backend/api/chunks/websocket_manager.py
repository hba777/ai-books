client_socket = None
active_book_id = None

def register_client(book_id: str, websocket):
    global client_socket, active_book_id
    client_socket = websocket
    active_book_id = book_id

def unregister_client(websocket):
    global client_socket, active_book_id
    if websocket == client_socket:
        client_socket = None
        active_book_id = None

def get_client(book_id: str):
    if book_id == active_book_id:
        return client_socket
    return None
