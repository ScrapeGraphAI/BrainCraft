from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router

app = FastAPI(title="BrainCraft API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api")

@app.get("/api")
async def health_check():
    return {
        "status": "ok",
        "service": "BrainCraft API",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    return {"message": "Welcome to BrainCraft API"}
