"""Main pipeline"""
import os
import json
import time
from .graph import invoke_graph
from .utility import create_pdf_to_html, extract_classification_info
from .database_operations import fetch_next_pending_chunk, fetch_chunk_context, mark_chunk_as_done, get_chunk_id, save_classification_result, mark_document_done, get_pending_documents


done = []

def get_text_from_context(context):
    if isinstance(context, dict):
        parts = []
        if context.get("previous"):
            parts.append(context["previous"])
        if context.get("next"):
            parts.append(context["next"])
        return "\n\n".join(parts).strip()
    elif isinstance(context, str):
        return context
    else:
        return str(context)

def supervisor_loop(doc_id, agent_list):
    print("#####-----START-----#####")
    if doc_id in done:
        return doc_id

    while True:
        time.sleep(int(os.getenv("DELAY")))
        chunk_index = fetch_next_pending_chunk(doc_id)
        if chunk_index is None:
            # print(f"Indexing of document: {doc_id} complete!\nAll chunks processed.")
            # create_pdf_to_html(doc_id)
            mark_document_done(doc_id)
            break

        print(f"Processing chunk {chunk_index}...")
        context = fetch_chunk_context(doc_id, chunk_index)
        current_text = get_text_from_context(context["current"])

        # Retry until valid JSON is obtained
        while True:
            try:
                results = invoke_graph(current_text, agent_list)
                if isinstance(results, str):
                    results = json.loads(results)
                break
            except Exception as e:
                print(f"JSON decode error: {e}, retrying chunk {chunk_index}...")

        classifications = extract_classification_info(results)
        valid_results = []

        # Process classification parsing and validation
        try:
            valid_results.clear()
            for classes in classifications:
                label = classes["classification"].lower()
                confidence = float(classes["confidence_score"])
                agent_name = classes["name"]

                if "non" in label:
                    continue
                if label in agent_name and confidence >= 70:
                    print("------> update valid results")
                    valid_results.append(classes)
        except Exception as e:
            print(f"Classification validation error: {e}, retrying parsing for chunk {chunk_index}...")
                
        chunk_id = get_chunk_id(doc_id, chunk_index)
        print("------> got chunk id")
        if chunk_id:
            save_classification_result(chunk_id, valid_results)
            print("------> saved classification result")

        mark_chunk_as_done(doc_id, chunk_index)
        print(f"------> chunk: {chunk_index} marked as done")

    print("Loop Ended")
    return doc_id

