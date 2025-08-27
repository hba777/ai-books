"""Document chunking and Indexing"""
import pdfplumber
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .summarization import summarize_pdf
from .database_operations import insert_document


def get_chunk_coordinates(words):
    """
    Calculate the bounding box coordinates (x0, top, x1, bottom) for a list of words.
    """
    if not words:
        return None
    x0 = min(float(w['x0']) for w in words)
    top = min(float(w['top']) for w in words)
    x1 = max(float(w['x1']) for w in words)
    bottom = max(float(w['bottom']) for w in words)
    return (x0, top, x1, bottom)

def create_chunks_with_page_numbers(file_path: str):
    """
    Loads PDF, extracts text and page numbers using pdfplumber, and splits the content into chunks.
    """
    chunks = []
    print(f"Working with file: {file_path.split('/')[-1]}")

    chunk_size = 10000  # Example chunk size in characters
    chunk_overlap = 5000 # Example overlap in characters

    with open(file_path, "rb") as pdf_file:
        with pdfplumber.open(pdf_file) as pdf:
            for page_index, page in enumerate(pdf.pages):
                words = page.extract_words(
                    x_tolerance=1,
                    y_tolerance=1,
                    keep_blank_chars=False
                )

                if not words:
                    continue

                current_chunk_words = []
                current_chunk_text = ""

                # Initialize variables for managing overlap
                last_chunk_words = []

                for word in words:
                    word_text = word['text']
                    
                    # Check if adding the next word exceeds the chunk size
                    if len(current_chunk_text) + len(word_text) + 1 > chunk_size and current_chunk_words:
                        # Finalize and append the completed chunk
                        coords = get_chunk_coordinates(current_chunk_words)
                        chunks.append(Document(
                            page_content=current_chunk_text.strip(),
                            metadata={
                                "page": page_index + 1,
                                "coordinates": coords
                            }
                        ))

                        # Save the current chunk for potential overlap in the next chunk
                        last_chunk_words = current_chunk_words
                        
                        # Find the words for the new chunk's overlap
                        overlap_words = []
                        overlap_text = ""
                        # Iterate backward from the end of the last chunk to build the overlap
                        for w in reversed(last_chunk_words):
                            if len(overlap_text) + len(w['text']) + 1 <= chunk_overlap:
                                overlap_words.insert(0, w)
                                overlap_text = w['text'] + (" " if overlap_text else "") + overlap_text
                            else:
                                break
                        
                        # Start a new chunk with the overlap and the current word
                        current_chunk_words = overlap_words
                        current_chunk_text = " ".join([w['text'] for w in current_chunk_words])

                    current_chunk_words.append(word)
                    current_chunk_text += (" " if current_chunk_text else "") + word_text

                # Add the last chunk of the page
                if current_chunk_words:
                    coords = get_chunk_coordinates(current_chunk_words)
                    chunks.append(Document(
                        page_content=current_chunk_text.strip(),
                        metadata={
                            "page": page_index + 1,
                            "coordinates": coords
                        }
                    ))
    return chunks
    
def index(file_path, doc_id):
    """Save the documents in the database"""
    chunks = create_chunks_with_page_numbers(file_path=file_path)
    print(f"Split the documents in {len(chunks)} paragraphs.")
    
    # Extract plain text from chunks
    summary_chunks_text = [chunk.page_content for chunk in chunks]

    # Convert list of strings into a single summary string
    # summary = "\n\n".join(summary_chunks_text)

    summary = summarize_pdf(summary_chunks_text)
    # Pass the chunks and combined summary to the DB
    indexed_doc_id = insert_document(doc_id, chunks=chunks, summary=summary)

    return indexed_doc_id

#################################################################################

# files = [r"The Lost War.pdf"]
# for file in files:
#     doc_id = index(file)
#     print(f"Document '{doc_id}' indexed!")