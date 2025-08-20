import os
from datetime import datetime
from typing import Dict, Any


def format_prompt(prompt_text: str) -> str:
    """Converts \\n and other escaped sequences into proper newlines and readable structure."""
    prompt_text = prompt_text.encode('utf-8').decode('unicode_escape')
    formatted_lines = []
    lines = prompt_text.strip().split("\n")

    for line in lines:
        line = line.strip()
        if line.isupper() and line.endswith(":"):
            formatted_lines.append(f"\n{line}")
        elif ":" in line and line.split(":")[0].isupper():
            parts = line.split(":", 1)
            formatted_lines.append(f"\n{parts[0]}:\n{parts[1].strip()}")
        else:
            formatted_lines.append(line)

    return "\n".join(formatted_lines)


def log_previous_agent_data(agent: Dict[str, Any], agent_id: str):
    """Logs agent data under /agent_logs/<type>/<agent_name>/ with timestamped filenames."""
    base_log_dir = "/agent_logs"

    agent_type = agent.get("type", "unknown").lower()
    if agent_type not in {"classification", "analysis"}:
        agent_type = "unknown"

    agent_name = agent.get("agent_name", "UnnamedAgent").replace(" ", "_")

    # Path: agent_logs/<type>/<agent_name>/
    log_dir = os.path.join(base_log_dir, agent_type, agent_name)
    os.makedirs(log_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = os.path.join(log_dir, f"agent_{agent_name}_{timestamp}.txt")

    with open(log_file, "w", encoding="utf-8") as f:
        f.write(f"=== Agent ID: {agent_id} ===\n")
        f.write(f"Agent Name: {agent.get('agent_name', '')}\n")
        f.write(f"Type: {agent.get('type', '')}\n")
        f.write(f"Status: {agent.get('status', '')}\n")

        if agent.get("criteria"):
            f.write(f"\n--- Criteria ---\n{agent['criteria']}\n")

        if agent.get("guidelines"):
            f.write(f"\n--- Guidelines ---\n{agent['guidelines']}\n")

        # handle classifier_prompt as object
        classifier_prompt = agent.get("classifier_prompt")
        if classifier_prompt:
            f.write(f"\n--- Classifier Prompt ---\n")
            if isinstance(classifier_prompt, dict):
                if classifier_prompt.get("content_indicators"):
                    f.write("\nContent Indicators:\n")
                    f.write(format_prompt(classifier_prompt["content_indicators"]) + "\n")
                if classifier_prompt.get("authorship_indicators"):
                    f.write("\nAuthorship Indicators:\n")
                    f.write(format_prompt(classifier_prompt["authorship_indicators"]) + "\n")
            else:
                # fallback: treat as plain text if it comes in string format
                f.write(format_prompt(str(classifier_prompt)) + "\n")

        if agent.get("evaluators_prompt"):
            f.write(f"\n--- Evaluator Prompt ---\n")
            f.write(format_prompt(agent["evaluators_prompt"]) + "\n")



        if agent_type == "analysis":
            kb_items = agent.get("knowledge_base", [])
            if kb_items:
                f.write("\n--- Knowledge Base Items ---\n")
                for idx, item in enumerate(kb_items, start=1):
                    f.write(f"\nItem {idx}:\n")
                    if item.get("main_category"):
                        f.write(f"  Main Category: {item['main_category']}\n")
                    if item.get("sub_category"):
                        f.write(f"  Sub Category: {item['sub_category']}\n")
                    if item.get("topic"):
                        f.write(f"  Topic: {item['topic']}\n")
                    if item.get("json_data"):
                        f.write(f"  Description: {item['json_data']}\n")
