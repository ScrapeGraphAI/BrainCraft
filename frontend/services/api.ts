import axios, { AxiosError } from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('api_service');

// Create axios instance with default config
logger.info('Initializing API service');
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

export interface DiagramData {
  code: string;
  type: string;
}

export interface ChatResponse {
  response: string;
  status: string;
  diagram?: DiagramData;
}

export interface SynthesizeRequest {
  text: string;
}

export interface SynthesizeResponse {
  audio_base64: string;
}

// Error handling
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response) {
      logger.error('API request failed with response', undefined, {
        status: axiosError.response.status,
        data: axiosError.response.data
      });
      throw new Error(axiosError.response.data.message || 'Server error');
    } else if (axiosError.request) {
      logger.error('No response received from API', undefined, {
        request: axiosError.request
      });
      throw new Error('No response from server. Please check your connection.');
    }
  }
  logger.error('Unknown API error occurred', error as Error);
  throw error;
};

export const chatService = {
  // Send chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    logger.info('Sending chat message', { messageLength: request.message.length });
    try {
      logger.debug('Making POST request to /chat endpoint');
      const response = await api.post<ChatResponse>('/chat', request);
      logger.debug('Received chat response', {
        hasResponse: !!response.data.response,
        hasDiagram: !!response.data.diagram
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  // Check backend health
  checkHealth: async (): Promise<boolean> => {
    logger.debug('Checking API health');
    try {
      const response = await api.get('/health');
      const isHealthy = response.data.status === 'healthy';
      logger.info('Health check completed', { isHealthy });
      return isHealthy;
    } catch (error) {
      logger.error('Health check failed', error as Error);
      return false;
    }
  },

  // Synthesize text to speech
  synthesizeSpeech: async (text: string): Promise<string> => {
    logger.info('Synthesizing speech', { textLength: text.length });
    try {
      logger.debug('Making POST request to /synthesize endpoint');
      const response = await api.post<SynthesizeResponse>('/synthesize', { text });
      logger.debug('Received synthesize response');
      return response.data.audio_base64;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
