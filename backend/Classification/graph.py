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
    print("🔧 Starting graph creation")
    subgraph_data = agent_list

    graph = StateGraph(MessagesState)
    print("✅ Initialized parent StateGraph")

    subgraph_names = []
    for item in subgraph_data:
        name = item["agent_name"]
        print(f"🔁 Creating subgraph for: {name}")
        classifier_prompt = item["classifier_prompt"]
        evaluator_prompt = item["evaluators_prompt"]

        subgraph = create_subgraph(name, classifier_prompt, evaluator_prompt)
        print(f"✅ Subgraph '{name}' created")

        try:
            graph.add_node(name, subgraph)
            print(f"✅ Subgraph '{name}' added to parent graph")
        except Exception as e:
            print(f"❌ Error adding subgraph '{name}' to parent graph: {e}")
        subgraph_names.append(name)

    for name in subgraph_names:
        print(f"🔗 Adding edges for subgraph '{name}'")
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
