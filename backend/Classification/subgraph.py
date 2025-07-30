"""Function to dynamically create subgraphs"""
from typing import Literal
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END, MessagesState
from langgraph.prebuilt import create_react_agent
from models import LLAMA


def create_subgraph(name: str, classifier_prompt: str, evaluator_prompt: str):
    classifier = create_react_agent(
        model=LLAMA,
        tools=[],
        name=f"{name}_classifier",
        prompt=classifier_prompt
    )

    evaluator = create_react_agent(
        model=LLAMA,
        tools=[],
        name=f"{name}_evaluator",
        prompt=evaluator_prompt
    )

    def get_next_node(content: str) -> Literal[f"{name}_classifier", END]:
        return END if "correct" in content.lower() else f"{name}_classifier"

    def classifier_node(state: MessagesState) -> dict:
        result = classifier.invoke(state)
        result["messages"][-1] = HumanMessage(
            content=result["messages"][-1].content,
            name=f"{name}_classifier"
        )
        return {"messages": result["messages"]}

    def evaluator_node(state: MessagesState) -> dict:
        result = evaluator.invoke(state)
        content = result["messages"][-1].content
        
        # Get the next node but don't store it in state
        next_node = get_next_node(content)
        
        # Retain only the last classifier message
        last_classifier_msg = state["messages"][-1]
        return {
            "messages": [last_classifier_msg],
            # Include the next_node in the return value
            "next_node": next_node
        }

    # Build the graph
    graph_builder = StateGraph(MessagesState)
    graph_builder.add_node(f"{name}_classifier", classifier_node)
    graph_builder.add_node(f"{name}_evaluator", evaluator_node)

    graph_builder.set_entry_point(f"{name}_classifier")
    graph_builder.add_edge(f"{name}_classifier", f"{name}_evaluator")

    # Conditional transitions from evaluator
    def edge_selector(state: MessagesState) -> str:
        # The evaluator_node returns the next_node in its output
        # which gets merged into the state
        return state.get("next_node", END)  # Default to END if not found

    graph_builder.add_conditional_edges(
        f"{name}_evaluator",
        edge_selector,
        {
            f"{name}_classifier": f"{name}_classifier",
            END: END,
        },
    )

    graph = graph_builder.compile(debug=False, name=name)
    return graph

# # Example Usage
# import prompts

# paragraph = """Following Pakistan’s launch of Operation Grand Slam and the earlier infiltration through Operation Gibraltar
# in Jammu and Kashmir, full-scale hostilities erupted across the international border. On September 6, Indian forces crossed
# into Lahore sector to divert Pakistani pressure from Kashmir. In response, Pakistan launched a major armored thrust into the
# Khem Karan sector on September 8, aiming to seize ground in Indian Punjab and threaten Indian supply lines."""

# religious_graph = create_subgraph(
#     name="religious",
#     classifier_prompt=prompts.RELIGIOUS_MESSAGE,
#     evaluator_prompt=prompts.RELIGIOUS_EVALUATOR_PROMPT
# )

# # ✅ Use LangChain Message objects
# messages = [
#     HumanMessage(content=paragraph),
#     SystemMessage(content="Only respond in json format. Do not include code block markers like ``` or ```json.")
# ]

# result = religious_graph.with_config(
#     config={
#         "callbacks": [opik_trace(["religious"])]
#     }).invoke({"messages": messages})

# # Output result
# results = result["messages"]
# for res in results:
#     print(res.content)
