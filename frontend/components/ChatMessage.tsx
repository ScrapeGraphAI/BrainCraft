import { useState } from 'react';
import { Paper, Text, Avatar, Group, Box, Button, Collapse, CopyButton, ActionIcon } from '@mantine/core';
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
  const [showDiagram, setShowDiagram] = useState(true);

  // Function to render the diagram
  const renderDiagram = async (code: string) => {
    try {
      const { svg } = await mermaid.render('diagram-' + Math.random(), code);
      return svg;
    } catch (error) {
      console.error('Error rendering diagram:', error);
      return null;
    }
  };

  return (
    <Box
      style={{
        alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
      }}
    >
      <Group gap="sm" align="flex-start">
        {sender === 'assistant' && (
          <Avatar radius="xl" size="md" color="blue">AI</Avatar>
        )}
        <Box style={{ width: '100%' }}>
          <Paper
            p="sm"
            style={{
              backgroundColor: sender === 'user' ? '#E3F2FD' : '#F5F5F5',
              borderRadius: '12px',
            }}
          >
            <Text size="sm">{content}</Text>
            {diagramCode && (
              <>
                <Button
                  variant="subtle"
                  size="xs"
                  mt="xs"
                  onClick={() => setShowDiagram(!showDiagram)}
                  leftSection={showDiagram ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                  style={{ width: 'auto', marginRight: '8px' }}
                >
                  {showDiagram ? 'Hide Diagram' : 'Show Diagram'}
                </Button>
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
                <Collapse in={showDiagram}>
                  <Box mt="xs" className="mermaid-container">
                    <div
                      className="mermaid"
                      dangerouslySetInnerHTML={{
                        __html: diagramCode
                      }}
                    />
                  </Box>
                </Collapse>
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
