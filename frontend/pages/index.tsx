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

interface ChatResponse {
  response: string;
  mermaid_code?: string;
  status: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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

      // Convert messages to format expected by backend
      const conversationHistory = messages.map(msg => ({
        role: msg.sender,
        content: msg.content
      }));

      // Call chat API
      const response = await chatService.sendMessage({
        message: content,
        conversation_history: conversationHistory
      });
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update diagram if one was generated
      if (response.mermaid_code) {
        setMermaidCode(response.mermaid_code);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
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
    <Box style={{ 
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '2rem',
    }}>
      <Container fluid>
        <Group position="apart" mb="xl">
          <Title order={1} style={{ color: '#1a237e' }}>
            BrainCraft Diagram Generator
          </Title>
          <ConnectionStatus />
        </Group>

        <Grid style={{ minHeight: 'calc(100vh - 150px)' }}>
          <Grid.Col span={6} style={{ height: '100%' }}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={6} style={{ height: '100%' }}>
            <DiagramPanel mermaidCode={mermaidCode} />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}
