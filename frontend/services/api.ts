import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatResponse {
  response: string;
  mermaid_code?: string;
  status: string;
}

export const chatService = {
  // Send chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/chat', request);
    return response.data;
  },

  // Check backend health
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api');
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  },

  // Generate diagram
  generateDiagram: async (prompt: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/generate', { message: prompt });
    return response.data;
  },

  // Refine existing diagram
  refineDiagram: async (currentCode: string, feedback: string): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/refine', {
      current_code: currentCode,
      feedback: feedback,
    });
    return response.data;
  },
};
