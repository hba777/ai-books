"""Document chunking and Indexing"""
import pdfplumber
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .summarization import summarize_pdf
from .database_operations import insert_document

def create_chunks_with_page_numbers(file_path: str):
    """
    Loads PDF, extracts text and page numbers using pdfplumber, and splits the content into chunks.
    """
    documents = []
    print(f"working with file: {file_path.split('/')[-1]}")
    
    with open(file_path, "rb") as pdf_file:
        with pdfplumber.open(pdf_file) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    doc = Document(
                        page_content=text,
                        metadata={"page": i + 1} # <-- Page number is explicitly added here
                    )
                    documents.append(doc)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=10000,
        chunk_overlap=5000,
        length_function=len,
        is_separator_regex=False,
    )
    
    # Splitting Document objects preserves the metadata
    chunks = splitter.split_documents(documents)
    return chunks


def index(file_path, doc_id):
    """Save the documents in the database"""
    chunks = create_chunks_with_page_numbers(file_path=file_path)
    print(f"Split the documents in {len(chunks)} paragraphs.")
    
    # Extract plain text from chunks
    summary_chunks_text = [chunk.page_content for chunk in chunks]

    # Convert list of strings into a single summary string
    summary = "\n\n".join(summary_chunks_text)

    # Pass the chunks and combined summary to the DB
    indexed_doc_id = insert_document(doc_id, chunks=chunks, summary=summary)

    return indexed_doc_id

#################################################################################

# files = [r"The Lost War.pdf"]
# for file in files:
#     doc_id = index(file)
#     print(f"Document '{doc_id}' indexed!")