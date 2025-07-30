import pymongo
from typing import Dict, List
from config import MONGO_URI, PDF_DB_NAME, PDF_COLLECTION_NAME # PDF_DB_NAME is "document_classification"

# Assuming Pipeline 1's documents collection is named 'documents'
DOCUMENTS_COLLECTION_NAME = "documents"

# Original function (kept as per request, but not directly used for P1 chunks in mains1.py)
def get_merged_pdf_chunks() -> Dict[str, str]:
    """
    Connects to MongoDB, retrieves PDF chunks, and merges them with
    2 preceding and 2 succeeding chunks for context.
    Returns a dictionary where keys are original chunk _ids (as strings)
    and values are the merged text.
    NOTE: This function expects schema from Pipeline 2's original PDF processing
          (e.g., 'page_number', 'chunk_number', 'chunk_text').
          It is NOT suitable for Pipeline 1's chunk schema ('text', 'doc_id', 'chunk_index').
    """
    mongo_client_pdf = None
    merged_texts = {}
    try:
        mongo_client_pdf = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client_pdf[PDF_DB_NAME]
        pdf_collection = pdf_db[PDF_COLLECTION_NAME]

        pages_cursor = pdf_collection.distinct("page_number")
        pages = sorted(list(pages_cursor))

        for page_num in pages:
            chunks_on_page = list(pdf_collection.find(
                {"page_number": page_num},
                {"_id": 1, "chunk_number": 1, "chunk_text": 1}
            ).sort("chunk_number", pymongo.ASCENDING))

            for i in range(len(chunks_on_page)):
                current_doc = chunks_on_page[i]
                current_id = str(current_doc["_id"])

                surrounding_chunks_docs = chunks_on_page[max(i - 2, 0):min(i + 3, len(chunks_on_page))]
                merged_text = " ".join([doc["chunk_text"] for doc in surrounding_chunks_docs])
                merged_texts[current_id] = merged_text
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching merged PDF chunks: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching merged PDF chunks: {e}")
    finally:
        if mongo_client_pdf:
            mongo_client_pdf.close()
    return merged_texts

# --- HELPER FUNCTION TO FETCH DOC NAME FROM PIPELINE 1's DOCUMENTS COLLECTION ---
def _get_doc_name_from_p1_documents_collection(doc_id: str) -> str:
    """
    Helper function to fetch the document name from Pipeline 1's 'documents' collection
    given a doc_id.
    """
    mongo_client = None
    doc_name = "Unknown Document"
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI)
        # Access Pipeline 1's main database directly
        p1_db = mongo_client["document_classification"]
        documents_collection = p1_db[DOCUMENTS_COLLECTION_NAME]
        doc_info = documents_collection.find_one({"doc_id": doc_id}, {"doc_name": 1})
        if doc_info and "doc_name" in doc_info:
            doc_name = doc_info["doc_name"]
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching document name for doc_id {doc_id}: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching document name for doc_id {doc_id}: {e}")
    finally:
        if mongo_client:
            mongo_client.close()
    return doc_name

# --- MODIFIED FUNCTIONS TO FETCH CHUNKS FROM PIPELINE 1's SCHEMA WITH DOC NAME ---

def get_first_pipeline1_chunk() -> Dict:
    """
    Retrieves the first chunk from the collection where Pipeline 1 stores its data.
    Adds the associated document name to the chunk dictionary.
    Returns a dictionary representing the first chunk found (P1 schema + doc_name).
    """
    mongo_client_pdf = None
    first_chunk = None
    try:
        mongo_client_pdf = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client_pdf[PDF_DB_NAME]
        pdf_collection = pdf_db[PDF_COLLECTION_NAME]
        first_chunk = pdf_collection.find_one({}, sort=[('doc_id', pymongo.ASCENDING), ('chunk_index', pymongo.ASCENDING)])
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching first Pipeline 1 chunk: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching first Pipeline 1 chunk: {e}")
    finally:
        if mongo_client_pdf:
            mongo_client_pdf.close()

    if first_chunk and "doc_id" in first_chunk:
        first_chunk["doc_name"] = _get_doc_name_from_p1_documents_collection(first_chunk["doc_id"])
    return first_chunk

def get_all_pipeline1_chunks_details() -> List[Dict]:
    """
    Retrieves all chunks from the collection where Pipeline 1 stores its data.
    Adds the associated document name to each chunk dictionary.
    Returns a list of dictionaries, where each dictionary is a chunk (P1 schema + doc_name).
    """
    mongo_client_pdf = None
    all_chunks = []
    try:
        mongo_client_pdf = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client_pdf[PDF_DB_NAME]
        pdf_collection = pdf_db[PDF_COLLECTION_NAME]
        all_chunks = list(pdf_collection.find({}, sort=[('doc_id', pymongo.ASCENDING), ('chunk_index', pymongo.ASCENDING)]))
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching all Pipeline 1 chunks: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching all Pipeline 1 chunks: {e}")
    finally:
        if mongo_client_pdf:
            mongo_client_pdf.close()

    # Optimize: Fetch all unique doc_names in one go if there are many unique doc_ids
    unique_doc_ids = list(set(chunk.get("doc_id") for chunk in all_chunks if "doc_id" in chunk))
    doc_names_map = {}
    if unique_doc_ids: # Only query if there are doc_ids to look up
        temp_mongo_client = None
        try:
            temp_mongo_client = pymongo.MongoClient(MONGO_URI)
            p1_db = temp_mongo_client["document_classification"]
            documents_collection = p1_db[DOCUMENTS_COLLECTION_NAME]
            for doc_info in documents_collection.find({"doc_id": {"$in": unique_doc_ids}}, {"doc_id": 1, "doc_name": 1}):
                doc_names_map[doc_info["doc_id"]] = doc_info.get("doc_name", "Unknown Document")
        except Exception as e:
            print(f"Error pre-fetching document names for unique doc IDs: {e}")
        finally:
            if temp_mongo_client:
                temp_mongo_client.close()

    for chunk in all_chunks:
        if "doc_id" in chunk:
            chunk["doc_name"] = doc_names_map.get(chunk["doc_id"], "Unknown Document")
    return all_chunks

# --- NEW FUNCTIONS TO FETCH PENDING CHUNKS FROM PIPELINE 1's SCHEMA WITH DOC NAME ---

def get_next_pending_pipeline1_chunk() -> Dict:
    """
    Retrieves the next chunk with 'analysis_status' as "Pending" from the collection
    where Pipeline 1 stores its data. Adds the associated document name to the chunk dictionary.
    Returns a dictionary representing the first pending chunk found (P1 schema + doc_name).
    """
    mongo_client_pdf = None
    pending_chunk = None
    try:
        mongo_client_pdf = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client_pdf[PDF_DB_NAME]
        pdf_collection = pdf_db[PDF_COLLECTION_NAME]
        # Find one chunk with analysis_status 'Pending', ordered by doc_id and chunk_index
        pending_chunk = pdf_collection.find_one(
            {"analysis_status": "Pending"},
            sort=[('doc_id', pymongo.ASCENDING), ('chunk_index', pymongo.ASCENDING)]
        )
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching next pending Pipeline 1 chunk: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching next pending Pipeline 1 chunk: {e}")
    finally:
        if mongo_client_pdf:
            mongo_client_pdf.close()

    if pending_chunk and "doc_id" in pending_chunk:
        pending_chunk["doc_name"] = _get_doc_name_from_p1_documents_collection(pending_chunk["doc_id"])
    return pending_chunk

def get_all_pending_pipeline1_chunks_details() -> List[Dict]:
    """
    Retrieves all chunks with 'analysis_status' as "Pending" from the collection
    where Pipeline 1 stores its data. Adds the associated document name to each chunk dictionary.
    Returns a list of dictionaries, where each dictionary is a pending chunk (P1 schema + doc_name).
    """
    mongo_client_pdf = None
    all_pending_chunks = []
    try:
        mongo_client_pdf = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client_pdf[PDF_DB_NAME]
        pdf_collection = pdf_db[PDF_COLLECTION_NAME]
        # Find all chunks with analysis_status 'Pending', ordered by doc_id and chunk_index
        all_pending_chunks = list(pdf_collection.find(
            {"analysis_status": "Pending"},
            sort=[('doc_id', pymongo.ASCENDING), ('chunk_index', pymongo.ASCENDING)]
        ))
    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error when fetching all pending Pipeline 1 chunks: {e}")
    except Exception as e:
        print(f"❌ An unexpected error occurred when fetching all pending Pipeline 1 chunks: {e}")
    finally:
        if mongo_client_pdf:
            mongo_client_pdf.close()

    # Optimize: Fetch all unique doc_names in one go for pending chunks
    unique_doc_ids = list(set(chunk.get("doc_id") for chunk in all_pending_chunks if "doc_id" in chunk))
    doc_names_map = {}
    if unique_doc_ids:
        temp_mongo_client = None
        try:
            temp_mongo_client = pymongo.MongoClient(MONGO_URI)
            p1_db = temp_mongo_client["document_classification"]
            documents_collection = p1_db[DOCUMENTS_COLLECTION_NAME]
            for doc_info in documents_collection.find({"doc_id": {"$in": unique_doc_ids}}, {"doc_id": 1, "doc_name": 1}):
                doc_names_map[doc_info["doc_id"]] = doc_info.get("doc_name", "Unknown Document")
        except Exception as e:
            print(f"Error pre-fetching document names for unique pending doc IDs: {e}")
        finally:
            if temp_mongo_client:
                temp_mongo_client.close()

    for chunk in all_pending_chunks:
        if "doc_id" in chunk:
            chunk["doc_name"] = doc_names_map.get(chunk["doc_id"], "Unknown Document")
    return all_pending_chunks