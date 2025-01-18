import axios, { AxiosError } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Use relative URL since we're using Next.js rewrites
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true // Important for CORS
});

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  status: string;
}

// Error handling
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response) {
      throw new Error(axiosError.response.data.message || 'Server error');
    } else if (axiosError.request) {
      throw new Error('No response from server. Please check your connection.');
    }
  }
  throw error;
};

export const chatService = {
  // Send chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/chat', request);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Check backend health
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health');
      console.log('Health check response:', response.data); // Debug log
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};
