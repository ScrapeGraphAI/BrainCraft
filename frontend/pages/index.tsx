import { useState, useEffect } from 'react';
import { Container, Grid, Title, Box, Group } from '@mantine/core';
import ChatInterface from '../components/ChatInterface';
import DiagramPanel from '../components/DiagramPanel';
import ConnectionStatus from '../components/ConnectionStatus';
import { chatService } from '../services/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    // Set up periodic connection check
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      console.log('Checking connection...'); // Debug log
      const isHealthy = await chatService.checkHealth();
      console.log('Connection status:', isHealthy); // Debug log
      setIsConnected(isHealthy);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Call chat API
      const response = await chatService.sendMessage({
        message: content
      });
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Check if response contains Mermaid diagram code
      const mermaidMatch = response.response.match(/\`\`\`mermaid\n([\s\S]*?)\n\`\`\`/);
      if (mermaidMatch) {
        setMermaidCode(mermaidMatch[1]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '0',
      content: 'Hello! I\'m your AI diagram assistant. I can help you create and modify diagrams using natural language. Try asking me to create a flowchart, sequence diagram, or any other type of diagram!',
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <Title>BrainCraft</Title>
        <ConnectionStatus isConnected={isConnected} />
      </Group>
      
      <Grid>
        <Grid.Col span={6}>
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Box sx={{ height: '100%', minHeight: 400 }}>
            <DiagramPanel code={mermaidCode} />
          </Box>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
