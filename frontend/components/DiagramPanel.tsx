import { Paper, Text } from '@mantine/core';
import dynamic from 'next/dynamic';

// Dynamically import Mermaid component to avoid SSR issues
const Mermaid = dynamic(() => import('./Mermaid'), {
  ssr: false,
});

interface DiagramPanelProps {
  mermaidCode?: string;
}

export default function DiagramPanel({ mermaidCode }: DiagramPanelProps) {
  return (
    <Paper shadow="sm" p="md" style={{ 
      height: '100%',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {mermaidCode ? (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Mermaid code={mermaidCode} />
        </div>
      ) : (
        <div style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <Text size="lg" color="dimmed">
            Your diagram will appear here once you describe what you'd like to create.
          </Text>
        </div>
      )}
    </Paper>
  );
}
