from langgraph.graph import StateGraph, END, START, MessagesState
from langgraph.checkpoint.memory import InMemorySaver
from .subgraph import create_subgraph
import json
import uuid
from .utility import opik_trace
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# Hardcoded prompt templates
def create_classifier_prompt(agent_name: str, criteria_content: dict) -> str:
    """
    Generates a complete classifier prompt string using a hardcoded template
    and dynamic criteria content, which is now a nested dictionary.
    """
    # Combine content and authorship indicators into a single formatted string
    if isinstance(criteria_content, dict):
        full_criteria = f"{criteria_content.get('content_indicators', '')}\n{criteria_content.get('authorship_indicators', '')}"
    else:
        full_criteria = criteria_content

    template = f"""
SYSTEM ROLE:
You are a specialized {agent_name} Content Classification Agent for the Pakistan Armed Forces.
Your primary responsibility is to identify content that requires review by the {agent_name} Affairs Department to ensure
it aligns with Pakistan's national values,
respects religious sentiments, and maintains the dignity of Islam and other religions practiced in Pakistan.

CLASSIFICATION CRITERIA:
You must identify if the text meets ANY of the following criteria:
{full_criteria}

ANALYSIS INSTRUCTIONS:
1. Analyze the provided text with Pakistan's religious harmony and national unity as primary concerns.
2. Determine if it contains religious content requiring specialized review.
3. Assign a confidence score (0-100%) to your classification.
4. If classified as Religious, identify which specific criteria were met.

STRICT INSTRUCTIONS:
1. You MUST ONLY classify for your specific category: {agent_name}
2. If content doesn't match your criteria, return confidence=0
3. NEVER classify as another category - only your specialty
4. Output MUST be valid JSON matching the exact format below

OUTPUT FORMAT:
You must respond only in the following JSON format:
{{
"classification": "{agent_name}",
"confidence_score": [0-100],
"criteria_matched": ["list specific criteria numbers matched"]
}}
"""
    return template.strip()

def create_evaluator_prompt(agent_name: str, criteria_content: str) -> str:
    """
    Generates a complete evaluator prompt string using a hardcoded template
    and dynamic criteria content.
    """
    template = f"""
SYSTEM ROLE:
You are an Evaluation Agent reviewing whether the {agent_name} Classification Agent has properly identified content
requiring review by the Religious Affairs Department.

EVALUATION OBJECTIVE:
Determine the correctness and justification of the agent's classification regarding religious content.

EVALUATION CRITERIA:
{criteria_content}

RESPONSE FORMAT:
You must respond with "correct" or "incorrect" based on the evaluation of the agent's
classification.
"""
    return template.strip()

def create_graph(agent_list):
    """Create a LangGraph that integrates multiple subgraphs and runs them in parallel."""
    subgraph_data = agent_list

    graph = StateGraph(MessagesState)

    subgraph_names = []
    for item in subgraph_data:
        name = item["agent_name"]
        classifier_criteria = item["classifier_prompt"]
        evaluator_criteria = item["evaluators_prompt"]

        classifier_prompt = create_classifier_prompt(name, classifier_criteria) 
        evaluator_prompt = create_evaluator_prompt(name, evaluator_criteria)

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
