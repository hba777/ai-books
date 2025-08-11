from langchain.chat_models import ChatOpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.embeddings import FastEmbedEmbeddings
import os
from dotenv import load_dotenv

load_dotenv(override=True)

# --- 1. Define your Embedding Model (BGE-Large with FastEmbed) ---
embeddings = FastEmbedEmbeddings(model_name=os.getenv("embedding_model"))





llm = ChatOpenAI(
    openai_api_base="http://192.168.18.100:8000/v1",
   openai_api_key="EMPTY",
   model_name="llama-3.1-8b-instant"
)

eval_llm = ChatOpenAI(
    openai_api_base="http://192.168.18.100:8000/v1",
    openai_api_key="EMPTY",
   model_name="llama-3.1-8b-instant"
)

llm1 = ChatOpenAI(
    openai_api_base="http://192.168.18.100:8000/v1",
   openai_api_key="EMPTY",
   model_name="llama-3.1-8b-instant"
)












