from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services import DiagramAgent, AudioService
from ..utils.logger import setup_logger

logger = setup_logger('api_routes')

# Create router without prefix
router = APIRouter()
diagram_agent = DiagramAgent()
audio_service = AudioService()

class ChatRequest(BaseModel):
    message: str

class DiagramData(BaseModel):
    code: str
    type: str

class ChatResponse(BaseModel):
    response: str
    status: str
    diagram: Optional[DiagramData] = None

class AudioRequest(BaseModel):
    audio_base64: str

class TextRequest(BaseModel):
    text: str

class AudioResponse(BaseModel):
    audio_base64: str

class TranscriptionResponse(BaseModel):
    text: str

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

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio_request: AudioRequest):
    """Transcribe audio using OpenAI Whisper"""
    logger.info("Received transcription request")
    try:
        text = await audio_service.transcribe_audio(audio_request.audio_base64)
        return TranscriptionResponse(text=text)
    except Exception as e:
        logger.error(f"Error in transcribe endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize", response_model=AudioResponse)
async def synthesize_speech(text_request: TextRequest):
    """Synthesize speech using LMNT"""
    logger.info(f"Received synthesis request: {text_request.text[:100]}...")
    try:
        audio_base64 = await audio_service.synthesize_speech(text_request.text)
        return AudioResponse(audio_base64=audio_base64)
    except Exception as e:
        logger.error(f"Error in synthesize endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
