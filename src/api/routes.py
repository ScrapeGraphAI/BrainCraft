from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from ..services.ai_service import DiagramAgent

router = APIRouter()
diagram_agent = DiagramAgent()

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    mermaid_code: Optional[str] = None
    status: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle chat messages and generate responses"""
    try:
        result = await diagram_agent.chat(
            message=request.message,
            conversation_history=request.conversation_history
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_diagram(request: ChatRequest):
    """Generate a new diagram based on description"""
    try:
        result = await diagram_agent.generate_mermaid_diagram(request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/refine")
async def refine_diagram(current_code: str, feedback: str):
    """Refine an existing diagram based on feedback"""
    try:
        result = await diagram_agent.refine_mermaid_diagram(
            current_code=current_code,
            feedback=feedback
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
