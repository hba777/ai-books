from langgraph.graph import StateGraph, END, START, MessagesState
from langgraph.checkpoint.memory import InMemorySaver
from .subgraph import create_subgraph
import json
import uuid
from .utility import opik_trace
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def create_graph(agent_list):
    """Create a LangGraph that integrates multiple subgraphs and runs them in parallel."""
    subgraph_data = agent_list

    graph = StateGraph(MessagesState)

    subgraph_names = []
    for item in subgraph_data:
        name = item["agent_name"]
        classifier_prompt = item["classifier_prompt"]
        evaluator_prompt = item["evaluators_prompt"]
        subgraph = create_subgraph(name, classifier_prompt, evaluator_prompt)

        try:
            graph.add_node(name, subgraph)
        except Exception as e:
            print(f"❌ Error adding subgraph '{name}' to parent graph: {e}")
        subgraph_names.append(name)

    for name in subgraph_names:
        graph.add_edge(START, name)
        graph.add_edge(name, END)

    checkpointer = InMemorySaver()
    print("🧠 Checkpointer initialized")

    compiled_graph = graph.compile(
        debug=False, 
        checkpointer=checkpointer, 
        name="parentgraph"
    )

    print("✅ Parent graph compiled successfully")
    return compiled_graph



def invoke_graph(paragraph: str, agent_list):
    """Invoke the LangGraph with shared state to generate classification result."""
    graph = create_graph(agent_list)

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
