from typing import Dict, Any, Optional
from dotenv import load_dotenv
from haystack import Pipeline
from haystack.dataclasses import ChatMessage
from haystack.components.generators import MistralChatGenerator
from haystack_experimental.dataclasses import Tool
import os

load_dotenv()

class MermaidAgentError(Exception):
    """Custom exception for Mermaid agent errors"""
    pass

class MermaidAgent:
    def __init__(self):
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise MermaidAgentError("MISTRAL_API_KEY not found in environment variables")
        
        try:
            # Initialize the chat generator
            self.generator = MistralChatGenerator(
                model="mistral-medium",
                api_key=api_key,
                temperature=0.1
            )
            
            # Create the mermaid tool
            self.mermaid_tool = self._create_mermaid_tool()
            
            # Create the pipeline
            self.pipeline = Pipeline()
            self.pipeline.add_component("llm", self.generator)
            
        except Exception as e:
            raise MermaidAgentError(f"Failed to initialize Mermaid agent: {str(e)}")

    def _process_to_mermaid(self, input_text: str, existing_mermaid: Optional[str] = None) -> str:
        """
        Process input text or Mermaid file content and return a Mermaid diagram.

        Args:
            input_text (str): text containing the request of the user to be analyzed
            existing_mermaid (str, optional): Previously generated mermaid diagram to iterate from

        Returns:
            str: A properly formatted Mermaid diagram
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": """You are a Mermaid diagram expert and brainstorming tool.
                    Your role is to create mermaid diagram from scratch or update an existing one.
                    Always start the diagram with 'graph TD' and create a mind map like diagram with appropriate mermaid syntax.
                    Return ONLY a valid Mermaid diagram code without any additional text or explanations.
                    Consider an existing mermaid only if present in the prompt.
                    Wrap the mermaid code inside this:
                    <mermaid>
                    [mermaid]
                    </mermaid>
                    """
                },
                {
                    "role": "user",
                    "content": f"User Prompt: {input_text}\n Existing Mermaid: {existing_mermaid}"
                }
            ]
            
            response = self.generator.run(messages)
            return response["replies"][0].content
            
        except Exception as e:
            raise MermaidAgentError(f"Failed to process mermaid diagram: {str(e)}")

    def _create_mermaid_tool(self) -> Tool:
        """Create the Mermaid diagram generation tool"""
        parameters = {
            "type": "object",
            "properties": {
                "input_text": {
                    "type": "string",
                    "description": "Text to convert into a Mermaid diagram"
                },
                "existing_mermaid": {
                    "type": "string",
                    "description": "Optional existing Mermaid diagram to update",
                    "default": None
                }
            },
            "required": ["input_text"]
        }

        return Tool(
            name="mermaid_generator",
            description="Creates or updates Mermaid diagrams from text descriptions",
            parameters=parameters,
            function=self._process_to_mermaid
        )

    async def process(self, text: str) -> Dict[str, Any]:
        """
        Process text input and generate/update Mermaid diagram
        
        Args:
            text (str): Input text to process
            
        Returns:
            Dict[str, Any]: Response containing the generated diagram and status
        """
        try:
            messages = [
                ChatMessage.from_system(
                    """
                    The mermaid code should be returned inside these tags:
                    <mermaid>
                    [mermaid]
                    </mermaid>

                    For each node inside the mermaid provide a markdown description.
                    You must put the description of each node of the mermaid in separated
                    XML tags with the name of the node. The final output should look like:

                    <mermaid>
                    [mermaid]
                    </mermaid>

                    <nodes_description>
                    <Node_1> [markdown] </Node_1>
                    <Node_2> [markdown] </Node_2>
                    </nodes_description>

                    You must return only this and nothing else. Never use backticks.
                    You must use the mermaid tool to generate it.
                    """
                ),
                ChatMessage.from_user(text)
            ]

            response = await self.generator.run(
                messages=messages,
                tools=[self.mermaid_tool]
            )

            return {
                "response": response["replies"][0].content,
                "status": "success"
            }

        except Exception as e:
            error_message = str(e)
            if "MISTRAL_API_KEY" in error_message:
                error_message = "API key configuration error. Please contact support."
            elif "rate limit" in error_message.lower():
                error_message = "Too many requests. Please try again in a moment."
            
            return {
                "response": f"Error: {error_message}",
                "status": "error"
            }

def haystack_agent(text: str) -> Dict[str, Any]:
    """
    Convenience function to create and run the Haystack Mermaid agent
    
    Args:
        text (str): Input text to process
        
    Returns:
        Dict[str, Any]: Response containing the generated diagram and status
    """
    agent = MermaidAgent()
    return agent.process(text)