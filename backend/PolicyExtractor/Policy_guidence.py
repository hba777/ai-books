import os
import fitz # Import PyMuPDF as 'fitz'
from langchain_core.messages import HumanMessage, SystemMessage
from Analysis.llm_init import llm

# ==============================
# Initialize LangChain's ChatOpenAI client
# ==============================
# The 'llm' object is assumed to be defined in Policy_guidence.py

# ==============================
# Function to extract text from PDF using PyMuPDF
# ==============================
def extract_pdf_text(pdf_path):
    """
    Extracts all text from a PDF file using PyMuPDF (fitz).
    
    Args:
        pdf_path (str): The path to the PDF file.

    Returns:
        str: The extracted text, or None if an error occurs.
    """
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        print(f"Error extracting PDF text with PyMuPDF: {e}")
        return None
    return text

# ==============================
# General Prompt Template
# ==============================
prompt_template = """
You are an expert review agent specialized in analyzing Pakistan's policy documents.
Your specific review role is defined by the placeholder: **{agent_name}**.

### Task:
1. Read the provided document carefully.
2. Based on the role defined in {agent_name}, extract **Pakistan's policy guidance, insights, or directives** that are explicitly or implicitly relevant.
3. If the document does **not** contain relevant information for this role, state only the following sentence:
    "No relevant policy guidance found for {agent_name} in this document."

### Important Rules:
- Do **not** invent or assume content that is not in the document.
- Only use information that is present in the document.
- If partial relevance exists, summarize only those parts that match {agent_name}.
- The output should be concise, structured, and strictly role-specific.

### Output Format:
1. [Brief, single-sentence point]
2. [Brief, single-sentence point]
...

(If no relevant guidance is found, the **only** output should be: "No relevant policy guidance found for {agent_name} in this document.")
"""

# ==============================
# Function to query LLM
# ==============================
def analyze_document_with_agent(pdf_path, agent_name):
    """
    Analyzes a PDF document using a specific agent role and an LLM.

    Args:
        pdf_path (str): The path to the PDF file.
        agent_name (str): The name of the agent role to use for analysis.

    Returns:
        str: The LLM's response content.
    """
    # Extract text from PDF
    document_text = extract_pdf_text(pdf_path)
    
    if document_text is None:
        return "Error: Could not extract text from the PDF."

    # Format the prompt
    prompt_content = prompt_template.format(agent_name=agent_name) + "\n\nDocument:\n" + document_text

    # Create a list of messages using LangChain's message classes
    messages = [
        SystemMessage(content="You are a helpful AI assistant."),
        HumanMessage(content=prompt_content)
    ]
    
    # Send to the LLM using the invoke method
    response = llm.invoke(messages)

    return response.content