from langgraph.graph import START, END, StateGraph
from .models import State
from .llm_init import llm, eval_llm, llm1
from .knowledge_base import knowledge_list, retriever
from .agents import load_agents_from_mongo, available_agents
from .workflow_nodes import main_node, final_report_generator
# Modified imports to use Pipeline 1 specific chunk retrieval functions
# Now importing the new functions from pdf_processor
from .pdf_processor import get_first_pipeline1_chunk, get_all_pipeline1_chunks_details, get_next_pending_pipeline1_chunk, get_all_pending_pipeline1_chunks_details
from .database_saver import save_results_to_mongo, clear_results_collection, update_chunk_analysis_status
from .text_classifier import classify_text
from db.mongo import get_books_collection, get_chunks_collection
from datetime import datetime
from bson import ObjectId
import asyncio
import time 

def run_workflow(book_id: str):
    """
    Run workflow for a specific book by its book_id.
    Loads agents, builds the graph, and processes all pending chunks
    that belong to the specified book.
    """
    # Load agents dynamically from MongoDB
    print("Loading agents from MongoDB...")
    load_agents_from_mongo(llm, eval_llm)

    total_agents = len(available_agents)
    if total_agents == 0:
        print("WARNING: No agents loaded. Analysis workflow might not function as expected.")
        return  # Exit if no agents are loaded

    # Initialize the StateGraph with the defined State
    graph_builder = StateGraph(State)

    # Add core nodes
    graph_builder.add_node("main_node", main_node)
    graph_builder.add_node("fnl_rprt", final_report_generator)

    # Add dynamically loaded agents as nodes
    for agent_name, agent_runnable in available_agents.items():
        graph_builder.add_node(agent_name, agent_runnable)
        print(f"Added agent '{agent_name}' as a node to the graph.")

    # Define graph flow
    graph_builder.add_edge(START, "main_node")
    for agent_name in available_agents:
        graph_builder.add_edge("main_node", agent_name)
        graph_builder.add_edge(agent_name, "fnl_rprt")
    graph_builder.add_edge("fnl_rprt", END)

    # Compile the graph
    graph = graph_builder.compile()

    print(f"Loading chunks for book_id={book_id} from Pipeline 1's database...")

    chunks_collection = get_chunks_collection()
    
    # ✅ Only fetch pending chunks for the specific book
    documents_to_process = chunks_collection.find({
        "doc_id": book_id,
        "analysis_status": "Pending"
    })

    documents_to_process = list(documents_to_process)

    # ✅ Notify frontend that analysis has begun with 0% progress
    try:
        from api.chunks.websocket import notify_analysis_progress
        total_chunks = chunks_collection.count_documents({"doc_id": book_id})
        asyncio.run(notify_analysis_progress(book_id, 0, total_chunks, 0))
    except Exception as notify_err:
        print(f"[Analysis WS] Failed to send initial analysis progress: {notify_err}")

    if documents_to_process:
        print(f"Found {len(documents_to_process)} PENDING chunks for book {book_id} to process.")
        for doc_to_process in documents_to_process:
            if not doc_to_process:
                continue

            # Extract fields
            p1_chunk_uuid = doc_to_process.get("chunk_id")
            doc_id_p1 = doc_to_process.get("doc_id")
            chunk_index_p1 = doc_to_process.get("chunk_index")
            original_chunk_text = doc_to_process.get("text")
            book_name_p1 = doc_to_process.get("doc_name", "Unknown Document")

            merged_text_for_id = original_chunk_text

            print(f"\n--- Processing Chunk ID: {p1_chunk_uuid} (Document: '{book_name_p1}', P1 Doc ID: {doc_id_p1}, P1 Chunk Index: {chunk_index_p1}) ---")
            print(f"Original Chunk Text: {original_chunk_text}\n")

            classification_result = classify_text(merged_text_for_id)
            predicted_label = classification_result['predicted_label']
            print(f"--- Predicted Label for Chunk: \"{predicted_label}\" (Confidence: {classification_result['confidence']}%) ---")

            report_data = {
                "report_text": merged_text_for_id,
                "metadata": {
                    "doc_id": doc_id_p1,
                    "chunk_index": chunk_index_p1,
                    "title": book_name_p1,
                    "chunk_id": p1_chunk_uuid,
                    "predicted_label": predicted_label,
                    "classification_scores": classification_result['all_scores']
                },
                "main_node_output": {},
                "aggregate": [],
                "final_decision_report": "",
                "current_agent_name": "",
                "current_agent_input_prompt": "",
                "current_agent_raw_output": "",
                "current_agent_parsed_output": {},
                "current_agent_confidence": 0,
                "current_agent_retries": 0,
                "current_agent_human_review": False
            }

            print(f"\n--- Langgraph Workflow Input for Chunk ID: {p1_chunk_uuid} ---")
            print("Initial state before agent execution. Individual agents will now perform their internal evaluation loops.")
            print("-" * 40)

            result_with_review = graph.invoke(report_data)

            overall_chunk_status = "Complete"
            agent_analysis_statuses = {agent_name: "Pending" for agent_name in available_agents.keys()}

            for agent_name, agent_data in result_with_review.get("main_node_output", {}).items():
                agent_output = agent_data.get("output", {})

                if (
                    agent_output.get("problematic_text") is None
                    and agent_output.get("observation") is None
                    and agent_output.get("recommendation") is None
                ):
                    agent_analysis_statuses[agent_name] = "Complete"
                else:
                    is_output_complete = True
                    if not isinstance(agent_output, dict):
                        is_output_complete = False
                    else:
                        if "issues_found" in agent_output and not isinstance(agent_output.get("issues_found"), bool):
                            is_output_complete = False
                        if "observation" in agent_output and not isinstance(agent_output.get("observation"), str):
                            is_output_complete = False
                        if "recommendation" in agent_output and not isinstance(agent_output.get("recommendation"), str):
                            is_output_complete = False

                    if is_output_complete:
                        agent_analysis_statuses[agent_name] = "Complete"
                    else:
                        agent_analysis_statuses[agent_name] = "Pending"
                        overall_chunk_status = "Pending"

            save_results_to_mongo(
                chunk_uuid=p1_chunk_uuid,
                doc_id=doc_id_p1,
                chunk_index=chunk_index_p1,
                report_text=original_chunk_text,
                book_name=book_name_p1,
                predicted_label=predicted_label,
                classification_scores=classification_result['all_scores'],
                result_with_review=result_with_review,
                overall_chunk_status=overall_chunk_status,
                agent_analysis_statuses=agent_analysis_statuses
            )

            update_chunk_analysis_status(
                doc_id=doc_id_p1,
                chunk_id=p1_chunk_uuid,
                analysis_status=overall_chunk_status
            )

            print("\n--- Langgraph Workflow Final Output (from State) ---")
            for agent_name, agent_output_data in result_with_review["main_node_output"].items():
                print(f"\n--- Summary for {agent_name} ---\n")
                output_content = agent_output_data.get('output', {})
                print(f"  Parsed Output: {output_content.get('problematic_text', 'No problematic text found.')}")
                print(f"  Observation: {output_content.get('observation', 'N/A')}")
                print(f"  Recommendation: {output_content.get('recommendation', 'N/A')}")
                print(f"  Confidence: {agent_output_data.get('confidence', 0)}%")
                print(f"  Retries: {agent_output_data.get('retries', 0)}")
                print(f"  Human Review Needed: {agent_output_data.get('human_review', False)}")

            print(f"\n--- Overall Chunk Status: {overall_chunk_status} ---\n")
            print(f"--- Agent Analysis Statuses (per chunk, all agents included): {agent_analysis_statuses} ---\n")
            print("Full Result Dictionary (for debugging):\n")
            print(result_with_review)
            print("-" * 40)

        # ✅ Update endDate for the book
        books_collection = get_books_collection()
        books_collection.update_one(
            {"doc_id": book_id},
            {"$set": {"endDate":  time.strftime("%Y-%m-%d %H:%M:%S")}}
        )

    else:
        print(f"No PENDING chunks found for book_id={book_id}. All chunks might be processed, or none were pending.")
