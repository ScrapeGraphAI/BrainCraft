import { useEffect, useRef, useState } from 'react';
import { Box, Title, Paper, CopyButton, ActionIcon, Group, Text, Alert } from '@mantine/core';
import { IconCopy, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import mermaid from 'mermaid';
import { createLogger } from '../utils/logger';

const logger = createLogger('DiagramPanel');

interface DiagramPanelProps {
  code: string;
  type?: string;  
}

interface FlowchartConfig {
  htmlLabels: boolean;
  curve: 'basis' | 'linear' | 'cardinal';
}

interface SequenceConfig {
  diagramMarginX: number;
  diagramMarginY: number;
  actorMargin: number;
  width: number;
  height: number;
  boxMargin: number;
  boxTextMargin: number;
  noteMargin: number;
  messageMargin: number;
}

interface MermaidConfig {
  theme?: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null';
  securityLevel?: 'loose' | 'strict' | 'antiscript' | 'sandbox';
  startOnLoad?: boolean;
  fontFamily?: string;
  flowchart?: FlowchartConfig;
  sequence?: SequenceConfig;
}

const defaultConfig = {
  startOnLoad: false,
  theme: 'default' as const,
  securityLevel: 'loose' as const,
  fontFamily: 'arial',
  flowchart: {
    htmlLabels: true,
    curve: 'basis' as const
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
};

mermaid.initialize(defaultConfig);

const DiagramPanel: React.FC<DiagramPanelProps> = ({ code, type = 'flowchart' }) => {  
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagramId] = useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);

  const parseConfig = (code: string): { config: MermaidConfig | null; diagramCode: string } => {
    try {
      const configMatch = code.match(/---\s*\nconfig:\s*([\s\S]*?)\n---\s*\n([\s\S]*)/);
      
      if (configMatch) {
        const [, configYaml, remainingCode] = configMatch;
        const configLines = configYaml.split('\n').map(line => line.trim());
        const config: MermaidConfig = {};
        
        configLines.forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            config[key] = value;
          }
        });

        logger.debug('Parsed Mermaid config', { config });
        return { config, diagramCode: remainingCode.trim() };
      }
    } catch (error) {
      logger.warn('Error parsing Mermaid config', error as Error);
    }
    
    return { config: null, diagramCode: code };
  };

  const determineDiagramType = (code: string): string => {
    const cleanCode = code.toLowerCase().trim();
    if (cleanCode.startsWith('sequencediagram')) return 'sequence';
    if (cleanCode.startsWith('classDiagram')) return 'class';
    if (cleanCode.startsWith('stateDiagram')) return 'state';
    if (cleanCode.startsWith('erDiagram')) return 'er';
    if (cleanCode.startsWith('gantt')) return 'gantt';
    if (cleanCode.startsWith('pie')) return 'pie';
    if (cleanCode.startsWith('graph') || cleanCode.startsWith('flowchart')) return 'flowchart';
    return 'flowchart'; 
  };

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code || !containerRef.current) {
        logger.debug('No code or container ref available, skipping render');
        return;
      }

      try {
        logger.debug('Starting diagram rendering', { type, codeLength: code.length });
        setError(null);
        
        const cleanCode = code.replace(/\`\`\`mermaid|\`\`\`/g, '').trim();
        const { config, diagramCode } = parseConfig(cleanCode);
        
        const actualType = type || determineDiagramType(diagramCode);
        
        if (config) {
          logger.debug('Applying custom Mermaid config', { config });
          await mermaid.initialize({
            ...defaultConfig,
            ...config
          });
        }

        containerRef.current.innerHTML = '';

        const diagramContainer = document.createElement('pre');
        diagramContainer.className = 'mermaid';
        diagramContainer.id = diagramId;
        diagramContainer.style.width = '100%';
        diagramContainer.style.background = 'none';
        diagramContainer.style.textAlign = 'center';
        
        diagramContainer.textContent = diagramCode;
        
        containerRef.current.appendChild(diagramContainer);

        await new Promise(resolve => requestAnimationFrame(resolve));

        logger.debug('Rendering diagram with Mermaid', { 
          type: actualType,
          theme: config?.theme || defaultConfig.theme 
        });
        
        try {
          await mermaid.parse(diagramCode);
          await mermaid.run({
            querySelector: `#${diagramId}`,
          });
          logger.info('Successfully rendered diagram', { type: actualType });
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
      <Group justify="space-between" mb="md">
        <Title order={3}>
          {(type || 'Flowchart').charAt(0).toUpperCase() + (type || 'Flowchart').slice(1)} Diagram
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
    </Box>
  );
};

export default DiagramPanel;
