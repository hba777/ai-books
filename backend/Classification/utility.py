import os
import re
import opik
import pdfkit
import pandas as pd
from jinja2 import Template
from opik.integrations.langchain import OpikTracer
from database_operations import extract_summary_for_pdf, extract_results_for_pdf, get_document_summary
import json
from dataclasses import dataclass
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv(override=True)

config = pdfkit.configuration(wkhtmltopdf=os.getenv("WKHTMLTOPDF_PATH"))

# Define the HumanMessage dataclass (if not already imported from elsewhere)
@dataclass
class HumanMessage:
    content: str
    additional_kwargs: dict
    response_metadata: dict = None
    name: str = ""
    id: str = ""


def generate_html(rows):
    html_template = """
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                font-size: 12px;
                margin: 30px;
                line-height: 1.5;
            }
            h1 {
                text-align: center;
                color: #333;
            }
            .container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
            }
            .chunk {
                flex: 1;
                min-width: 40%;
                border: 1px solid #ccc;
                padding: 10px;
                margin-bottom: 20px;
                background-color: #f9f9f9;
            }
            .chunk-id {
                font-weight: bold;
                color: #1a1a1a;
                margin-bottom: 6px;
            }
            .paragraph, .labels {
                white-space: pre-wrap;
                word-wrap: break-word;
                margin-bottom: 10px;
            }
            .labels {
                background-color: #f0f0f0;
                font-family: monospace;
                font-size: 10px;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
            }
            hr {
                border: 0;
                border-top: 1px solid #ccc;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Document Review Report</h1>
        {% for chunk_id, text, result in rows %}
        <div class="chunk">
            <div class="chunk-id">Chunk ID: {{ chunk_id }}</div>
            <div class="paragraph">{{ text }}</div>
            <div class="labels"><pre>{{ result | tojson(indent=2) }}</pre></div>
        </div>
        <hr/>
        {% endfor %}
    </body>
    </html>
    """
    
    # Render the HTML template
    template = Template(html_template)
    html_content = template.render(rows=rows)

    return html_content

def opik_trace(tags: list):
    """Returns an ibject to put in a langchain chain config
    Example:
    ```chain = create_sql_query_chain(llm, db).with_config({"callbacks": [opik_tracer]})```
    """
    print("\nOPIK_TRACING\n")
    opik.configure(use_local=True, automatic_approvals=True)
    opik_tracer = OpikTracer(tags=tags, project_name=os.getenv("OPIK_PROJECT_NAME"))
    return opik_tracer

def remove_code_block_markers(text):
    # Remove ```json, ```python, or just ```
    return re.sub(r"```(?:\w+)?", "", text)

def create_pdf_to_html(doc_id):
    print(f"Creating PDF for {doc_id}")
    
    # Step 1: Extract data
    rows = extract_results_for_pdf(doc_id)

    # Safely parse rows and convert classification list to string
    parsed_rows = [
        (
            doc.get("text", ""),
            ', '.join(doc.get("classes", [])) if isinstance(doc.get("classes"), list) else str(doc.get("classes", ''))
        )
        for doc in rows
    ]

    # Create DataFrame with correct dtypes
    df = pd.DataFrame(parsed_rows, columns=['text', 'classification'])

    # Step 2: Extract summary
    summary = extract_summary_for_pdf(doc_id)
    summary_df = pd.DataFrame(
        list(summary['class_counts'].items()),
        columns=['Class', 'Paragraph Count']
    )

    # Step 3: Convert to HTML
    doc_summary = get_document_summary(doc_id)
    summary_html = f"""
    <h1>{summary['doc_name']}</h1>
    <div style="margin: 20px 0; font-size: 16px; line-height: 1.6;">
        <strong>Document Summary:</strong><br>
        {doc_summary}
    </div>
    """ + summary_df.to_html(index=False)

    detail_html = df.to_html(index=False)

    combined_html = f"""
    <html>
    <head>
        <style>
            @media print {{
                .page-break {{ page-break-before: always; }}
            }}
            body {{
                font-family: Arial, sans-serif;
                margin: 40px;
            }}
            h1 {{
                text-align: center;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
            }}
        </style>
    </head>
    <body>
        {summary_html}
        <div class="page-break"></div>
        {detail_html}
    </body>
    </html>
    """

    # Step 4: Write HTML file
    output_dir = os.getenv("OUTPUT_PATH") or "output"
    os.makedirs(output_dir, exist_ok=True)
    
    html_file = os.path.join(output_dir, f'{doc_id}.html')
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(combined_html)

    # Step 5: Convert to PDF
    output_path = os.path.join(output_dir, f'{doc_id}.pdf')
    pdfkit.from_file(html_file, output_path, configuration=config)

    print(f"PDF generated at {output_path}")


# Function to extract classification info
def extract_classification_info(messages: List[HumanMessage]) -> List[Dict[str, Any]]:
    results = []

    for msg in messages:
        content = msg.content
        name = msg.name
        
        # Extract the JSON-like portion at the beginning of the string
        match = re.search(r'\{.*?\}', content, re.DOTALL)
        
        if match:
            try:
                json_data = json.loads(match.group())
                result = {
                    'classification': json_data.get('classification'),
                    'confidence_score': json_data.get('confidence_score'),
                    'criteria_matched': json_data.get('criteria_matched')
                }
                results.append(result)
                result["name"] = name
            except json.JSONDecodeError as e:
                print(f"JSON decode error in message: {e}")
        else:
            print("No JSON found in message")

    return results
