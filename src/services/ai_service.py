from typing import Dict, Any, List
import os
from dotenv import load_dotenv
import requests

load_dotenv()

class DiagramAgent:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.api_url = "https://api.mistral.ai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _chat_completion(self, messages: List[Dict[str, str]]) -> Dict:
        """Send a chat completion request to Mistral API"""
        payload = {
            "model": "mistral-tiny",
            "messages": messages
        }
        
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"Error from Mistral API: {response.text}")
            
        return response.json()

    async def generate_mermaid_diagram(self, query: str) -> Dict[str, Any]:
        """Generate a Mermaid diagram based on user description"""
        messages = [
            {
                "role": "system",
                "content": """You are an expert at creating Mermaid.js diagrams. 
                Convert the user's description into a valid Mermaid diagram code.
                Only respond with the Mermaid code, no explanations."""
            },
            {
                "role": "user",
                "content": query
            }
        ]
        
        response = await self._chat_completion(messages)
        mermaid_code = response['choices'][0]['message']['content']
        
        return {
            "mermaid_code": mermaid_code,
            "status": "success"
        }

    async def refine_mermaid_diagram(self, 
                                   current_code: str, 
                                   feedback: str) -> Dict[str, Any]:
        """Refine an existing Mermaid diagram based on feedback"""
        messages = [
            {
                "role": "system",
                "content": """You are an expert at refining Mermaid.js diagrams.
                Given the current diagram code and user feedback, provide an improved version.
                Only respond with the modified Mermaid code, no explanations."""
            },
            {
                "role": "user",
                "content": f"Current diagram:\n{current_code}\n\nFeedback: {feedback}"
            }
        ]
        
        response = await self._chat_completion(messages)
        refined_code = response['choices'][0]['message']['content']
        
        return {
            "mermaid_code": refined_code,
            "status": "success"
        }

    async def chat(self, message: str, 
                  conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Handle chat interactions and generate responses"""
        if conversation_history is None:
            conversation_history = []
            
        messages = [
            {
                "role": "system",
                "content": """You are a helpful assistant specialized in creating and 
                explaining diagrams. Help users create and modify diagrams using natural language.
                If the user asks for a diagram, use the generate_mermaid tool."""
            }
        ]
        
        # Add conversation history
        messages.extend(conversation_history)
        
        # Add current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        response = await self._chat_completion(messages)
        response_content = response['choices'][0]['message']['content']
        
        # Check if we need to generate a diagram
        if any(keyword in message.lower() 
               for keyword in ["create", "generate", "draw", "make", "diagram"]):
            diagram_result = await self.generate_mermaid_diagram(message)
            return {
                "response": response_content,
                "mermaid_code": diagram_result["mermaid_code"],
                "status": "success"
            }
        
        return {
            "response": response_content,
            "status": "success"
        }
