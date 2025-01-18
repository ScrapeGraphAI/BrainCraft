from typing import Dict, Any
import base64
import io
from openai import OpenAI
from lmnt.api import Speech
from ..config import get_settings
from ..utils.logger import setup_logger

logger = setup_logger('audio_service')

class AudioServiceError(Exception):
    """Custom exception for audio service errors"""
    pass

class AudioService:
    def __init__(self):
        logger.info("Initializing AudioService")
        settings = get_settings()
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def transcribe_audio(self, audio_base64: str) -> str:
        """Transcribe audio using OpenAI Whisper"""
        logger.info("Processing transcription request")
        try:
            # Decode base64 audio
            audio_bytes = base64.b64decode(audio_base64)
            
            # Create in-memory file object
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.wav"
            
            # Transcribe using OpenAI
            logger.debug("Sending request to OpenAI Whisper")
            transcription = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            
            logger.info("Successfully transcribed audio")
            return transcription.text
        
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}", exc_info=True)
            raise AudioServiceError(f"Failed to transcribe audio: {str(e)}")

    async def synthesize_speech(self, text: str) -> str:
        """Synthesize speech using LMNT"""
        logger.info(f"Processing synthesis request: {text[:100]}...")
        try:
            # Synthesize speech using LMNT
            logger.debug("Sending request to LMNT")
            async with Speech() as speech:
                synthesis = await speech.synthesize(text, 'lily')
            
            # Convert audio bytes to base64
            audio_base64 = base64.b64encode(synthesis['audio']).decode('utf-8')
            
            logger.info("Successfully synthesized speech")
            return audio_base64
        
        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}", exc_info=True)
            raise AudioServiceError(f"Failed to synthesize speech: {str(e)}") 