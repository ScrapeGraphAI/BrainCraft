from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from ..services.ai_service import DiagramAgent
from ..utils.logger import setup_logger

logger = setup_logger('api_routes')

# Create router without prefix (prefix will be handled by main.py)
router = APIRouter()
diagram_agent = DiagramAgent()

class ChatRequest(BaseModel):
    message: str

class DiagramData(BaseModel):
    code: str
    type: str

class ChatResponse(BaseModel):
    response: str
    status: str
    diagram: Optional[DiagramData] = None

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages and generate responses"""
    logger.info(f"Received chat request: {request.message[:100]}...")
    try:
        logger.debug("Processing chat request with DiagramAgent")
        result = await diagram_agent.chat(message=request.message)
        logger.info("Successfully processed chat request")
        return result
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.debug("Health check requested")
    return {
        "status": "healthy",
        "service": "BrainCraft API",
        "version": "1.0.0"
    }
