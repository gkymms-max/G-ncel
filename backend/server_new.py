from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create app
app = FastAPI(title="Quote Management API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from routes.auth import router as auth_router

# Include routers
app.include_router(auth_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Quote Management API v2.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
