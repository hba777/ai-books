import fitz  # PyMuPDF
import re
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
# from database_operations import extract_results_for_pdf # <-- Yeh line hata di gayi thi
from .models import LLAMA

# 1. PDF Text Extraction
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# 2. Clean text
def clean_text(text):
    text = re.sub(r'\s+', ' ', text) # Corrected regex back to r'\s+'
    return text.strip()

# 3. Split into chunks (450 words)
def split_into_chunks(text, max_words=450):
    words = text.split()
    return [' '.join(words[i:i+max_words]) for i in range(0, len(words), max_words)]

# 4. Load summarization model and tokenizer
print("Checking for CUDA...")
device = 0 if torch.cuda.is_available() else -1
print("CUDA Available:", torch.cuda.is_available())
if device == 0:
    print("Using GPU:", torch.cuda.get_device_name(0))
else:
    print("Using CPU")

print("Loading T5-Base summarizer...")
model_name = "t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
summarizer = pipeline("summarization", model=model, tokenizer=tokenizer, device=device)

# 5. Summarize chunks
def summarize_chunks(chunks):
    summaries = []
    for i, chunk in enumerate(chunks): # Added enumerate back
        if len(chunk.split()) < 30:
            print(f"Skipping chunk {i+1}: too short") # Restored print
            continue
        
        # T5 limits input to 512 tokens, so truncate if necessary
        max_input_length = tokenizer.model_max_length
        if len(tokenizer.encode(chunk)) > max_input_length:
            chunk = tokenizer.decode(tokenizer.encode(chunk)[:max_input_length], skip_special_tokens=True)
            print("Warning: Chunk truncated for summarization due to length.") # Kept this print

        input_text = "summarize: " + chunk # Restored this line
        try:
            print(f"Summarizing chunk {i+1}/{len(chunks)}...") # Restored print
            summary = summarizer(input_text, max_length=256, min_length=60, do_sample=False)[0]['summary_text'] # Restored original max/min length
            summaries.append(summary)
        except Exception as e:
            print(f"Error on chunk {i+1}: {e}") # Restored print
    return summaries

# 5. Generate summary using LLM (optional, for final refinement)
def generate_summary_using_llm(final_text: str):
    prompt = f"""
    You are a highly capable language assistant. Your task is to rephrase the following text clearly, concisely, and professionally.

    INSTRUCTIONS:
    - Preserve the original meaning and factual accuracy.
    - Improve grammar, coherence, and flow.
    - Use formal English suitable for analytical reports.
    - Do not add or omit information.
    - Return only the rephrased text — no explanations or prefixes.

    TEXT TO REPHRASE:
    <<<
    {final_text}
    >>>
    """
    summary = LLAMA.invoke(prompt.strip())
    return summary.content.strip()


# 6. Full summarization process
def summarize_pdf(chunks):
    intermediate_summaries = summarize_chunks(chunks)

    print("Combining and refining...")
    combined_summary = ' '.join(intermediate_summaries)
    final_chunks = split_into_chunks(combined_summary, max_words=350)

    print("Synthesizing Summary...")
    final_summaries = summarize_chunks(final_chunks)
    final_text = ' '.join(final_summaries)

    summary = generate_summary_using_llm(final_text)
    print("Summary generation complete.")
    return summary

# # 7. Main block
# if __name__ == "__main__":

#     pdf_file = r"W:\document_classification\data\Seeking Peace-Mar 23.pdf"  # Update path as needed
#     final_summary = summarize_pdf(pdf_file)

#     print("\n\n==== FINAL SUMMARY ====\n") # Restored this print