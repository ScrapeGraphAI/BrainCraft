import { useState } from 'react';
import { Paper, Text, Group, Box, Button, Collapse, CopyButton, ActionIcon, Badge } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconCode, IconCopy, IconCheck } from '@tabler/icons-react';
import mermaid from 'mermaid';

// Initialize mermaid with emoji support
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  htmlLabels: true,
  fontFamily: 'Arial, sans-serif',
  flowchart: {
    htmlLabels: true,
    useMaxWidth: true,
    curve: 'basis'
  }
});

interface ChatMessageProps {
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  diagramCode?: string;
}

export default function ChatMessage({ content, sender, timestamp, diagramCode }: ChatMessageProps) {
  const [showDiagramCode, setShowDiagramCode] = useState(false);

  return (
    <Box
      style={{
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        width: '100%'
      }}
    >
      <Paper
        p="sm"
        style={{
          backgroundColor: sender === 'user' ? '#E3F2FD' : '#F5F5F5',
          borderRadius: '12px'
        }}
      >
        <Box mb="xs">
          <Badge
            size="sm"
            variant="filled"
            color={sender === 'user' ? 'green' : 'blue'}
          >
            {sender === 'user' ? 'YOU' : 'AI-AGENT'}
          </Badge>
        </Box>
        <Text size="sm">{content}</Text>
        {diagramCode && (
          <>
            <Button
              variant="subtle"
              size="xs"
              mt="xs"
              onClick={() => setShowDiagramCode(!showDiagramCode)}
              leftSection={showDiagramCode ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              rightSection={<IconCode size={14} />}
              style={{ width: 'auto' }}
            >
              {showDiagramCode ? 'Hide Code' : 'Show Code'}
            </Button>
            <Collapse in={showDiagramCode}>
              <Box mt="xs">
                <Group justify="space-between" mb="xs">
                  <Text size="xs" color="dimmed">Diagram Code</Text>
                  <CopyButton value={diagramCode} timeout={2000}>
                    {({ copied, copy }) => (
                      <ActionIcon
                        size="xs"
                        color={copied ? 'teal' : 'gray'}
                        onClick={copy}
                      >
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
                <Box
                  component="pre"
                  style={{
                    backgroundColor: '#f8f9fa',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    margin: 0
                  }}
                >
                  <code>{diagramCode}</code>
                </Box>
              </Box>
            </Collapse>
          </>
        )}
      </Paper>
      <Text size="xs" color="dimmed" mt={4} style={{ textAlign: sender === 'user' ? 'right' : 'left' }}>
        {timestamp.toLocaleTimeString()}
      </Text>
    </Box>
  );
}
