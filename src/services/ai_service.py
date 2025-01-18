from typing import Dict, Any, List
import os
from dotenv import load_dotenv
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory
from langchain.schema import SystemMessage

load_dotenv()

class AIServiceError(Exception):
    """Custom exception for AI service errors"""
    pass

class DiagramAgent:
    def __init__(self):
        api_key = os.getenv("MISTRAL_API_KEY")
        if not api_key:
            raise AIServiceError("MISTRAL_API_KEY not found in environment variables")
            
        try:
            self.llm = ChatMistralAI(
                api_key=api_key,
                model="mistral-medium",
                temperature=0.7
            )
            
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # Define tools
            self.tools = [
                Tool(
                    name="generate_mermaid",
                    description="Generate a Mermaid.js diagram from a description",
                    func=self._generate_mermaid_diagram
                ),
                Tool(
                    name="refine_mermaid",
                    description="Refine an existing Mermaid.js diagram",
                    func=self._refine_mermaid_diagram
                )
            ]
            
            # Create the agent with tools
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are an expert diagram creation assistant. You can:
                1. Generate Mermaid.js diagrams from descriptions
                2. Refine existing diagrams based on feedback
                3. Explain diagram concepts and syntax
                
                Always use the appropriate tools when working with diagrams.
                When generating diagrams, always wrap the Mermaid code in triple backticks with 'mermaid' language identifier."""),
                MessagesPlaceholder(variable_name="chat_history"),
                ("user", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad")
            ])
            
            self.agent = create_openai_tools_agent(self.llm, self.tools, prompt)
            self.agent_executor = AgentExecutor(
                agent=self.agent,
                tools=self.tools,
                memory=self.memory,
                verbose=True
            )
        except Exception as e:
            raise AIServiceError(f"Failed to initialize AI service: {str(e)}")

    def _generate_mermaid_diagram(self, description: str) -> str:
        """Generate a Mermaid diagram based on description"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "Create a valid Mermaid.js diagram based on the description. Return the diagram code wrapped in triple backticks with 'mermaid' language identifier."
                },
                {
                    "role": "user",
                    "content": description
                }
            ]
            
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            raise AIServiceError(f"Failed to generate diagram: {str(e)}")

    def _refine_mermaid_diagram(self, current_code: str, feedback: str) -> str:
        """Refine an existing Mermaid diagram based on feedback"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "Improve the Mermaid.js diagram based on the feedback. Return the modified diagram code wrapped in triple backticks with 'mermaid' language identifier."
                },
                {
                    "role": "user",
                    "content": f"Current diagram:\n{current_code}\n\nFeedback: {feedback}"
                }
            ]
            
            response = self.llm.invoke(messages)
            return response.content
        except Exception as e:
            raise AIServiceError(f"Failed to refine diagram: {str(e)}")

    async def chat(self, message: str) -> Dict[str, Any]:
        """Handle chat interactions using LangChain agent"""
        try:
            response = await self.agent_executor.ainvoke({"input": message})
            return {
                "response": response["output"],
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
