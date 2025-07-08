from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

import os

load_dotenv()

app = FastAPI(
    title="AI Books API",
    description="API for the AI Books project.",
    version="1.0.0",
    openapi_tags=[{"name": "Auth", "description": "Authentication related endpoints"}],
    # Adding the security schema directly to Swagger UI
    openapi_security=[{
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }]
)

origins = [
    "http://localhost:3000",  # Your frontend origin
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Change to specific frontend URLs for better security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Import and include users router
from api.users.routes import router as users_router
app.include_router(users_router)

@app.get("/")
def read_root():
    return {
        "mongo_url": os.getenv("MONGO_URL"),
        "secret_key": os.getenv("SECRET_KEY")
    }
