from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {
        "mongo_url": os.getenv("MONGO_URL"),
        "secret_key": os.getenv("SECRET_KEY")
    }
