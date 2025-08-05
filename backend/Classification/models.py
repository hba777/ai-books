import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv(override=True)

LLAMA = ChatGroq(
    api_key = os.getenv("GROQ_API_KEY"),
    model=os.getenv("GROQ_MODEL"),
    temperature=0,
    max_tokens=None,
    timeout=30,
    max_retries=2,
)
