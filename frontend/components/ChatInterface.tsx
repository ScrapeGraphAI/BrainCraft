import { useState } from 'react';
import { Paper, TextInput, Button, Stack, ScrollArea, Box } from '@mantine/core';
import { FaPaperPlane } from 'react-icons/fa';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatInterface({ messages, onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <Paper shadow="sm" p="md" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '12px',
    }}>
      <ScrollArea style={{ flex: 1, marginBottom: '1rem' }}>
        <Stack spacing="lg">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
            />
          ))}
        </Stack>
      </ScrollArea>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing="xs">
          <TextInput
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rightSection={
              <Button
                type="submit"
                variant="filled"
                size="xs"
                disabled={!input.trim() || isLoading}
                loading={isLoading}
                style={{ marginRight: '5px' }}
              >
                <FaPaperPlane size={14} />
              </Button>
            }
            disabled={isLoading}
          />
        </Stack>
      </Box>
    </Paper>
  );
}
