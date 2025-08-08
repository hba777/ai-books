import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI

load_dotenv(override=True)

LLAMA = ChatOpenAI(
    model=os.getenv("LLM_MODEL"),  # e.g., llama-3.1-8b-instant
    openai_api_key=os.getenv("LLM_API_KEY", "EMPTY"),  # Use EMPTY or dummy key if local
    openai_api_base=os.getenv("LLM_API_BASE"),
    temperature=float(os.getenv("LLM_TEMPERATURE", "0.7")),
    max_tokens=None,
    request_timeout=30,
    max_retries=2,
)