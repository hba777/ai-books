from langgraph.graph import StateGraph, END, START, MessagesState
from langgraph.checkpoint.memory import InMemorySaver
from subgraph import create_subgraph
import json
import uuid
from utility import opik_trace
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def create_graph(definition_json_path: str):
    """Create a LangGraph that integrates multiple subgraphs and runs them in parallel."""
    with open(definition_json_path, "r", encoding="utf-8") as f:
        subgraph_data = json.load(f)

    graph = StateGraph(MessagesState)

    subgraph_names = []
    for item in subgraph_data:
        name = item["name"]
        classifier_prompt = item["classifier_prompt"]
        evaluator_prompt = item["evaluator_prompt"]
        subgraph = create_subgraph(name, classifier_prompt, evaluator_prompt)
        graph.add_node(name, subgraph)
        subgraph_names.append(name)

    # Run all subgraphs in parallel:
    for name in subgraph_names:
        graph.add_edge(START, name)
        graph.add_edge(name, END)

    checkpointer = InMemorySaver()
    compiled_graph = graph.compile(
        debug=False, 
        checkpointer=checkpointer, 
        name="parentgraph"
    )

    # Optional: Visualize the graph
    # mermaid_str = compiled_graph.get_graph().draw_mermaid()
    # print(mermaid_str)

    return compiled_graph


def invoke_graph(paragraph: str, definition_json_path: str):
    """Invoke the LangGraph with shared state to generate classification result."""
    graph = create_graph(definition_json_path)

    # Build initial messages
    messages = []
    messages.append({
        "role": "user",
        "content": paragraph
    })

    if os.getenv("ENABLE_OPIK") != "False":
        result = graph.with_config(
            config={
                "callbacks": [opik_trace(["parentgraph"])],
                "thread_id": str(uuid.uuid4()),
            }).invoke({"messages": messages})
    else:
        result = graph.with_config(
            config={
                "thread_id": str(uuid.uuid4()),
            }).invoke({"messages": messages})

    return result["messages"]
