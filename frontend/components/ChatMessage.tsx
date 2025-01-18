import { Paper, Text, Avatar, Group, Box } from '@mantine/core';

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatMessage({ content, sender, timestamp }: ChatMessageProps) {
  return (
    <Box
      style={{
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
      }}
    >
      <Group spacing="sm" align="flex-start">
        {sender === 'assistant' && (
          <Avatar radius="xl" size="md" color="blue">AI</Avatar>
        )}
        <Box>
          <Paper
            p="sm"
            style={{
              backgroundColor: sender === 'user' ? '#E3F2FD' : '#F5F5F5',
              borderRadius: '12px',
            }}
          >
            <Text size="sm">{content}</Text>
          </Paper>
          <Text size="xs" color="dimmed" mt={4}>
            {timestamp.toLocaleTimeString()}
          </Text>
        </Box>
        {sender === 'user' && (
          <Avatar radius="xl" size="md" color="green">You</Avatar>
        )}
      </Group>
    </Box>
  );
}
