from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from utils.jwt_utils import get_user_from_cookie
from db.mongo import get_chunks_collection, get_agent_configs_collection, books_collection, fs
from .schemas import ChunkResponse, ChunkListResponse
import tempfile
from bson import ObjectId
from Classification.index_document import index
from Classification.app import supervisor_loop

router = APIRouter(prefix="/chunks", tags=["Chunks"])

done = []

@router.post("/index-book/{book_id}")
def index_book(book_id: str, background_tasks: BackgroundTasks):
    # 1. Get the book document
    book = books_collection.find_one({"_id": ObjectId(book_id)})
    if not book or "file_id" not in book:
        raise HTTPException(status_code=404, detail="Book or file not found")
    if book.get("status", "").lower() != "pending":
        raise HTTPException(status_code=400, detail="Book status must be 'Pending' to index.")
    file_id = book["file_id"]
# 
    # 2. Retrieve the file from GridFS and write to a temp file
    file_obj = fs.get(file_id)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_obj.read())
        tmp_path = tmp.name
# 
    # 3. Index the document (this will chunk and store in DB, returns doc_id)
    indexed_doc_id = index(tmp_path, book_id)
# 
    return {
        "message": f"Indexing and classification started for book {book_id}",
        "indexed_doc_id": indexed_doc_id,
    }
# 
# 
# @router.post("/classifyBook/{book_id}")
# def index_book(book_id: str, background_tasks: BackgroundTasks):
#     agent_configs_collection = get_agent_configs_collection()
#     agents = list(agent_configs_collection.find({}, {"_id": 0, "agent_name": 1, "classifier_prompt": 1, "evaluator_prompt": 1}))
#     background_tasks.add_task(supervisor_loop, book_id, agents)
#     return {"message": f"Indexing started for book {book_id}", "agents": agents}

@router.post("/classifyBook/{book_id}")
def index_book(book_id: str):
    agent_configs_collection = get_agent_configs_collection()
    agents = list(agent_configs_collection.find({}, {"_id": 0, "agent_name": 1, "classifier_prompt": 1, "evaluators_prompt": 1}))
    # supervisor_loop(book_id, agents)
    compiled=test_agent()
    print(compiled)
    return {"message": f"Indexing started for book {book_id}", "agents": agents}

@router.get("/", response_model=ChunkListResponse, dependencies=[Depends(get_user_from_cookie)])
def get_all_chunks():
    chunks_collection = get_chunks_collection()
    chunks = list(chunks_collection.find())

    # Convert ObjectId to string
    for chunk in chunks:
        chunk["_id"] = str(chunk["_id"])

    return ChunkListResponse(items=[ChunkResponse(**chunk) for chunk in chunks])


@router.get("/count", dependencies=[Depends(get_user_from_cookie)])
def get_chunks_count():
    chunks_collection = get_chunks_collection()
    count = chunks_collection.count_documents({})
    return {"count": count}


from langgraph.prebuilt import create_react_agent
from Classification.models import LLAMA

def test_agent():
    agent = create_react_agent(
        model=LLAMA,
        tools=[],
        name="test_agent",
        prompt="Hello, classify this message."
    )
    # Dummy state
    from langgraph.graph import MessagesState
    state = {"messages": []}
    result = agent.invoke(state)
    print(result)

