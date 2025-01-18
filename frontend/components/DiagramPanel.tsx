import { useEffect, useRef, useState } from 'react';
import { Box, Title, Paper, CopyButton, ActionIcon, Group, Text, Alert } from '@mantine/core';
import { IconCopy, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import mermaid from 'mermaid';
import { createLogger } from '../utils/logger';

const logger = createLogger('DiagramPanel');

interface DiagramPanelProps {
  code: string;
  type: string;
}

// Initialize mermaid with specific configuration
mermaid.initialize({
  startOnLoad: false, // Important: we'll manually initialize
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'arial',
  flowchart: {
    htmlLabels: true,
    curve: 'basis'
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35
  }
});

const DiagramPanel: React.FC<DiagramPanelProps> = ({ code, type }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !containerRef.current) {
        logger.debug('No code or container ref available, skipping render');
        return;
      }

      try {
        logger.debug('Starting diagram rendering', { type, codeLength: code.length });
        setError(null);
        
        // Clean the code by removing any markdown backticks and language identifier
        const cleanCode = code.replace(/\`\`\`mermaid|\`\`\`/g, '').trim();
        logger.debug('Cleaned Mermaid code', { cleanCode });

        // Clear previous content
        containerRef.current.innerHTML = '';

        // Create the diagram container
        const diagramContainer = document.createElement('pre');
        diagramContainer.className = 'mermaid';
        diagramContainer.id = diagramId;
        diagramContainer.style.width = '100%';
        diagramContainer.style.background = 'none';
        diagramContainer.style.textAlign = 'center';
        
        // Insert the clean code
        diagramContainer.textContent = cleanCode;
        
        // Add to DOM
        containerRef.current.appendChild(diagramContainer);

        // Wait for next frame to ensure DOM is updated
        await new Promise(resolve => requestAnimationFrame(resolve));

        logger.debug('Rendering diagram with Mermaid');
        try {
          await mermaid.parse(cleanCode); // First verify syntax
          await mermaid.run({
            querySelector: `#${diagramId}`,
          });
          logger.info('Successfully rendered diagram', { type });
        } catch (mermaidError) {
          logger.error('Mermaid rendering error', mermaidError as Error);
          throw mermaidError;
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to render diagram';
        logger.error('Error rendering diagram', error as Error, { type });
        setError(errorMessage);
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };

    renderDiagram();
  }, [code, type, diagramId]);

  const handleCopy = (copied: boolean) => {
    logger.debug('Diagram code copied to clipboard', { copied });
  };

  return (
    <Box>
      <Group position="apart" mb="md">
        <Title order={3}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Diagram
        </Title>
        <CopyButton value={code} timeout={2000}>
          {({ copied, copy }) => (
            <ActionIcon 
              color={copied ? 'teal' : 'gray'} 
              onClick={() => {
                copy();
                handleCopy(copied);
              }}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          )}
        </CopyButton>
      </Group>

      <Paper p="md" withBorder>
        {error ? (
          <Alert icon={<IconAlertCircle size={16} />} title="Rendering Error" color="red">
            {error}
          </Alert>
        ) : (
          <div 
            ref={containerRef}
            className="mermaid-container" 
            style={{ 
              minHeight: '200px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              background: 'white'
            }} 
          />
        )}
      </Paper>

      <Paper mt="md" p="xs" withBorder>
        <Group position="apart">
          <Text size="sm" color="dimmed">Diagram Code</Text>
          <CopyButton value={code} timeout={2000}>
            {({ copied, copy }) => (
              <ActionIcon 
                size="sm" 
                color={copied ? 'teal' : 'gray'} 
                onClick={() => {
                  copy();
                  handleCopy(copied);
                }}
              >
                {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
              </ActionIcon>
            )}
          </CopyButton>
        </Group>
        <Box
          component="pre"
          mt="xs"
          sx={(theme) => ({
            backgroundColor: theme.colors.gray[0],
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            fontSize: '0.85rem',
            overflowX: 'auto'
          })}
        >
          <code>{code}</code>
        </Box>
      </Paper>
    </Box>
  );
};

export default DiagramPanel;
