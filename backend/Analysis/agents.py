import json
from typing import List, Dict, Callable, Optional
from langgraph.graph import END, StateGraph
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableLambda
from db.mongo import get_agent_configs_collection
from .models import State
from .knowledge_base import get_relevant_info, retriever, knowledge_list
import operator

# Define a type for agent functions for clear type hinting
Agent = Callable[[State], Dict]

# Define a dictionary to hold all available agents, mapping names to their functions
available_agents: Dict[str, Agent] = {}

# ─── PROMPT TEMPLATE ────────────────────────────────────────────────────────

TEMPLATE = """
You are an expert reviewer assessing passages from books on Pakistan's history and politics for alignment with official policies, national narratives, and Pakistan Army's institutional positions.

## Primary Objective
Identify specific text segments that conflict with Pakistan's official positions or national interests. Focus on substantive alignment issues that affect national security, state narratives, or institutional dignity.

## Context
Book Title: {title}
Page: {page}, Paragraph: {paragraph}
Text to analyze: {text}

## Knowledge Base Reference:
- Official Narrative: {official_narrative}
- Key Policy Points: {key_points}
- Sensitive Aspects: {sensitive_aspects}
- Recommended Terminology: {recommended_terminology}
- Authoritative Sources: {authoritative_sources}

## Policy Guidelines:
{policy_guidelines}
- Uphold Pakistan's national unity and territorial integrity
- Protect Pakistan Army's institutional dignity and operational confidentiality
- Avoid narratives that undermine state legitimacy or national cohesion
- Ensure balanced representation of Pakistan's role in regional and international affairs

## Specific criteria:
{specific_criteria}

## Flag Content That:

### 1. Contradicts Official Positions
- Disputes Pakistan's official stance on Kashmir, territorial boundaries, or sovereignty
- Misrepresents Pakistan's foreign policy decisions or diplomatic positions
- Contradicts established narratives about Pakistan's creation, constitutional development, or governance principles

### 2. Undermines National Security Narratives
- Reveals or speculates about sensitive military operations, capabilities, or strategic planning
- Mischaracterizes Pakistan Army's role in national defense or counter-terrorism efforts
- Presents one-sided accounts of Pakistan's security challenges without proper context

### 3. Uses Inappropriate Framing
- Employs terminology that delegitimizes Pakistani institutions or leadership
- Adopts hostile foreign narratives about Pakistan without balanced analysis
- Makes unsupported negative claims about Pakistan's policies or actions as established facts

### 4. Lacks Proper Sourcing
- Makes serious allegations about Pakistani institutions without credible evidence
- Relies exclusively on biased or antagonistic sources for Pakistan-related claims
- Presents controversial interpretations as facts without acknowledging alternative viewpoints

## Do NOT Flag:
- Neutral historical descriptions with proper citations
- Academic analysis clearly presented as scholarly opinion with balanced sourcing
- Factual reporting that uses recommended terminology
- Constructive criticism supported by authoritative Pakistani sources
- Mention of past events without evaluative or inflammatory language

## Decision Framework:
Only flag content if it clearly:
1. *Directly contradicts* established Knowledge Base positions
2. *Compromises* sensitive national security information
3. *Misrepresents* Pakistan's official positions without proper context
4. *Uses prohibited terminology* where recommended alternatives exist
5. *Makes unsupported claims* that damage Pakistan's national interests

If evidence is insufficient or interpretation is ambiguous, recommend human review rather than flagging.

## Output Format:
```json
{{
    "issues_found": true/false,
    "problematic_text": "exact text segment that is problematic",
    "observation": "specific explanation of why this conflicts with KB or policy guidelines",
    "recommendation": "delete/rephrase/fact-check/provide references"
}}
Respond only with valid JSON. Do not include any explanation outside the JSON block.
"""

def register_agent(name: str, agent_function: Agent):
    """
    Registers an agent function under a given name in the global available_agents dictionary.
    """
    available_agents[name] = agent_function

def create_review_agent(
    review_name: str,
    criteria: str,
    guidelines: str,
    confidence_score: int,
    llm_model: ChatGroq,
    knowledge_base: Optional[List[Dict]] = None
) -> Agent:
    """
    Creates a specialized review agent function that includes an internal evaluation loop.
    The confidence_score is now passed as an argument.
    """
    prompt_template = PromptTemplate.from_template(TEMPLATE)

    if knowledge_base:
        # ✅ FIX: First, parse the json_data string within the knowledge_base
        parsed_kb_data = []
        for kb_item in knowledge_base:
            json_data_str = kb_item.get("json_data")
            if json_data_str:
                try:
                    parsed_kb_data.append(json.loads(json_data_str))
                except json.JSONDecodeError as e:
                    print(f"Error parsing json_data for agent {review_name}: {e}")
                    # Handle error or continue

        # Now, extract and format information from the parsed data
        kb_official_narrative = "\\n".join(
            [f"- {kb.get('official_narrative', 'N/A')}" for kb in parsed_kb_data]
        )
        kb_key_points = "\\n".join(
            [f"- {point}" for kb in parsed_kb_data for point in kb.get('key_points', [])]
        )
        sensitive_aspects_list = []
        for kb in parsed_kb_data:
            for aspect in kb.get('sensitive_aspects', []):
                sensitive_aspects_list.append(
                    f" - Topic: {aspect.get('topic', 'N/A')}, "
                    f"Approved Framing: '{aspect.get('approved_framing', 'N/A')}', "
                    f"Problematic Framing: '{aspect.get('problematic_framing', 'N/A')}'"
                )
        kb_sensitive_aspects = "\\n".join(sensitive_aspects_list)
        recommended_terminology_list = []
        for kb in parsed_kb_data:
            for term_type, terms in kb.get('recommended_terminology', {}).items():
                term_list = ", ".join(terms)
                recommended_terminology_list.append(
                    f" - {term_type.capitalize()}: {term_list}"
                )
        kb_recommended_terminology = "\\n".join(recommended_terminology_list)
        kb_authoritative_sources = "\\n".join(
            [f"- {source}" for kb in parsed_kb_data for source in kb.get('authoritative_sources', [])]
        )
    else:
        kb_official_narrative = "No specific knowledge base provided."
        kb_key_points = "No specific knowledge base provided."
        kb_sensitive_aspects = "No specific knowledge base provided."
        kb_recommended_terminology = "No specific knowledge base provided."
        kb_authoritative_sources = "No specific knowledge base provided."

    # ─── AGENT SUB-WORKFLOW ──────────────────────────────────────────────────

    def agent_sub_step(state: State) -> State:
        print(f"\n--- {review_name} Sub-Agent Step - Attempt {state.get('current_agent_retries', 0) + 1} ---")
        report_text = state["report_text"]
        metadata = state["metadata"]
        
        # Now, add relevant knowledge from the vector store based on the chunk text
        relevant_knowledge = get_relevant_info(report_text, k=2)

        prompt = prompt_template.format(
            text=report_text,
            page=metadata.get("page", "N/A"),
            paragraph=metadata.get("paragraph", "N/A"),
            title=metadata.get("title", "N/A"),
            specific_criteria=criteria,
            policy_guidelines=guidelines,
            official_narrative=kb_official_narrative,
            key_points=kb_key_points,
            sensitive_aspects=kb_sensitive_aspects,
            recommended_terminology=kb_recommended_terminology,
            authoritative_sources=kb_authoritative_sources
        )

        print(f"--- {review_name} Input Prompt ---")
        print(prompt)
        print("-" * 30)

        response = llm_model.invoke(prompt)
        raw_output = response.content
        parsed_output = {}
        human_review_flag = False

        try:
            parsed_output = json.loads(raw_output)
            print(f"--- {review_name} Raw Output ---")
            print(raw_output)
            print(f"--- {review_name} Parsed Output ---")
            print(parsed_output)
            print("-" * 30)
        except json.JSONDecodeError:
            error_message = f"Error decoding JSON from {review_name}: {raw_output}"
            print(f"--- {review_name} Output (Error) ---")
            print(error_message)
            print("-" * 30)
            parsed_output = {"error": error_message, "human_review_reason": "JSON_DECODE_ERROR"}
            human_review_flag = True

        return {
            "current_agent_input_prompt": prompt,
            "current_agent_raw_output": raw_output,
            "current_agent_parsed_output": parsed_output,
            "current_agent_retries": state.get("current_agent_retries", 0) + 1,
            "current_agent_human_review": human_review_flag
        }

    def evaluation_sub_step(state: State) -> State:
        if state.get("current_agent_human_review", False):
            print(f"\n--- {review_name} Evaluation Skipped: JSON Decode Error ---")
            return {"current_agent_confidence": 0}

        print(f"\n--- {review_name} Sub-Evaluation Step - Attempt {state.get('current_agent_retries', 0)} ---")
        prompt_from_agent = state["current_agent_input_prompt"]
        response_from_agent = state["current_agent_raw_output"]

        eval_prompt = f"""
Evaluate the following:

Prompt given to agent:
{prompt_from_agent}

Agent's Raw Response:
"{response_from_agent}"

How correct and relevant is the Response to the Prompt?

Give a confidence score between 0 and 100.

Respond only with a single, valid JSON object that follows this structure:
{{"confidence": <score>}}
DO NOT include any explanation or text outside of the JSON object.
"""
        print(f"--- {review_name} Evaluation Prompt ---")
        print(eval_prompt)
        print("-" * 30)

        eval_response = llm_model.invoke(eval_prompt).content
        confidence = 0
        try:
            eval_data = json.loads(eval_response)
            confidence = int(eval_data.get("confidence", 0))
            print(f"--- {review_name} Evaluation Response ---")
            print(eval_data)
            print(f"Confidence: {confidence}")
            print("-" * 30)
        except json.JSONDecodeError:
            print(f"--- {review_name} Evaluation Response (Error) ---")
            print(f"Error decoding JSON from evaluator: {eval_response}")
            print("Confidence set to 0 due to evaluation parsing error.")
            print("-" * 30)
            confidence = 0
        except Exception as e:
            print(f"--- {review_name} Evaluation Response (Other Error) ---")
            print(f"An unexpected error occurred during evaluation parsing: {e}")
            print("Confidence set to 0.")
            print("-" * 30)
            confidence = 0

        return {
            "current_agent_confidence": confidence
        }

    def route_sub_step(state: State) -> str:
        max_retries = 3
        parsed_output = state.get("current_agent_parsed_output", {})
        
        # Check for a "null" response (issues_found is false and problematic_text is null)
        is_null_response = parsed_output.get("issues_found") is False and parsed_output.get("problematic_text") is None

        if state.get("current_agent_human_review", False):
            print(f"\n⚠️ {review_name} JSON Decode Error detected. Routing directly to human review.")
            return "human_review_needed_sub_step"
        elif is_null_response and state["current_agent_retries"] < max_retries:
            print(f"\n🔄 {review_name} Returned a 'null' response. Retrying... (Attempt {state['current_agent_retries']} of {max_retries})")
            return "agent_sub_step"
        elif is_null_response and state["current_agent_retries"] >= max_retries:
            print(f"\n⚠️ {review_name} Returned a 'null' response after {max_retries} retries. Human review needed.")
            return "human_review_needed_sub_step"
        
        if state["current_agent_confidence"] >= confidence_score:
            print(f"\n✨ {review_name} Confidence {state['current_agent_confidence']}% is sufficient (threshold: {confidence_score}%). Exiting sub-workflow.")
            return "end"
        elif state["current_agent_retries"] < max_retries:
            print(f"\n🔄 {review_name} Confidence {state['current_agent_confidence']}% is too low (threshold: {confidence_score}%). Retrying... (Attempt {state['current_agent_retries']} of {max_retries})")
            return "agent_sub_step"
        else:
            print(f"\n⚠️ {review_name} Confidence {state['current_agent_confidence']}% still too low after {max_retries} retries (threshold: {confidence_score}%). Human review needed for this agent's output.")
            return "human_review_needed_sub_step"

    def human_review_sub_step(state: State) -> State:
        print(f"\n--- {review_name} Human Review Needed ---")
        return {
            "current_agent_human_review": True
        }

    agent_graph_builder = StateGraph(State)
    agent_graph_builder.add_node("agent_sub_step", RunnableLambda(agent_sub_step))
    agent_graph_builder.add_node("evaluation_sub_step", RunnableLambda(evaluation_sub_step))
    agent_graph_builder.add_node("human_review_needed_sub_step", RunnableLambda(human_review_sub_step))

    agent_graph_builder.set_entry_point("agent_sub_step")
    agent_graph_builder.add_edge("agent_sub_step", "evaluation_sub_step")
    agent_graph_builder.add_conditional_edges(
        "evaluation_sub_step",
        route_sub_step,
        {
            "agent_sub_step": "agent_sub_step",
            "human_review_needed_sub_step": "human_review_needed_sub_step",
            "end": END
        }
    )
    agent_graph_builder.add_edge("human_review_needed_sub_step", END)

    agent_sub_graph = agent_graph_builder.compile()

    def review_agent_with_evaluation(state: State) -> Dict:
        initial_sub_state = {
            "report_text": state["report_text"],
            "metadata": state["metadata"],
            "current_agent_name": review_name,
            "current_agent_retries": 0,
            "current_agent_confidence": 0,
            "current_agent_human_review": False,
            "final_decision_report": "",
            "aggregate": [],
            "main_node_output": {}
        }

        final_sub_state = agent_sub_graph.invoke(initial_sub_state)

        agent_result = final_sub_state.get("current_agent_parsed_output", {"error": "No output parsed"})
        agent_confidence = final_sub_state.get("current_agent_confidence", 0)
        agent_retries = final_sub_state.get("current_agent_retries", 0)
        agent_human_review = final_sub_state.get("current_agent_human_review", False)
        
        # Check if the final result is a "null" response and retries were exhausted
        is_null_response = agent_result.get("issues_found") is False and agent_result.get("problematic_text") is None
        if agent_human_review and is_null_response:
             state['review_flag'] = True
             state['status'] = 'Complete'
             print(f"\n🚨 Final result was a 'null' response after retries. Setting review_flag to True and status to Complete.")

        return {
            review_name: agent_result,
            "aggregate": [f"{review_name} Output: {agent_result} (Confidence: {agent_confidence}%, Retries: {agent_retries}, Human Review: {agent_human_review})"],
            "main_node_output": {
                review_name: {
                    "output": agent_result,
                    "confidence": agent_confidence,
                    "retries": agent_retries,
                    "human_review": agent_human_review
                }
            }
        }
    return review_agent_with_evaluation

def load_agents_from_mongo(llm_model: ChatGroq):
    """
    Loads agent configurations (name, criteria, guidelines) from a MongoDB collection
    and registers them as review agents.
    Only agents with status=True and type="analysis" are retrieved.
    """
    try:
        collection = get_agent_configs_collection()

        # ✅ Retrieve only agents with active status and type = analysis
        rows = collection.find({"status": True, "type": "analysis"})

        for doc in rows:
            agent_name = doc.get("agent_name")
            criteria = doc.get("criteria")
            guidelines = doc.get("guidelines")
            confidence_score = doc.get("confidence_score")
            knowledge_base_data = doc.get("knowledge_base") # Get the knowledge base data

            if agent_name and criteria and guidelines and confidence_score is not None:
                agent = create_review_agent(
                    agent_name,
                    criteria,
                    guidelines,
                    confidence_score,
                    llm_model,
                    knowledge_base_data # Pass the knowledge base data to the agent function
                )
                register_agent(agent_name, agent)
                print(
                    f"✅ Agent '{agent_name}' loaded from MongoDB with confidence score: {confidence_score}."
                )
            else:
                print(
                    f"⚠️ Error: Missing 'criteria', 'guidelines' or 'confidence_score' "
                    f"for agent '{agent_name}' in MongoDB document: {doc}"
                )
    except Exception as e:
        print(f"❌ An unexpected error occurred during agent loading: {e}")