"""Document chunking and Indexing"""
from langchain_docling import DoclingLoader
from langchain_docling.loader import ExportType
from langchain_text_splitters import RecursiveCharacterTextSplitter
from summarization import summarize_pdf
from database_operations import insert_document

def parse_to_text(file_path: str):
    """Function to parse and convert document to markdown text"""
    print(f"working with file: {file_path.split('/')[-1]}")
    loader = DoclingLoader(file_path=file_path, export_type=ExportType.MARKDOWN)
    docs = loader.load()
    return docs[0].page_content

def splits(text: str):
    """Convert the markdown text into splits"""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=50,
        length_function=len,
        is_separator_regex=False,
    )
    
    return splitter.split_text(text)

def index(file_path, doc_id):
    """Save the documents in the database"""
    text = parse_to_text(file_path=file_path)
    chunks = splits(text)
    print(f"Split the documents in {len(chunks)} paragraphs.")
    summary = summarize_pdf(chunks)
    indexed_doc_id = insert_document(doc_id, chunks=chunks, summary=summary)

    return indexed_doc_id

#################################################################################

# files = [r"The Lost War.pdf"]
# for file in files:
#     doc_id = index(file)
#     print(f"Document '{doc_id}' indexed!")