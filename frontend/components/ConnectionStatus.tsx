import { useEffect, useState } from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { chatService } from '../services/api';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async () => {
    try {
      setStatus('checking');
      const isConnected = await chatService.checkHealth();
      setStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Check connection immediately
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'green';
      case 'disconnected':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
      default:
        return 'Checking Connection';
    }
  };

  return (
    <Tooltip
      label={`Last checked: ${lastChecked.toLocaleTimeString()}`}
      position="bottom"
      withArrow
    >
      <Badge 
        color={getStatusColor()}
        variant="dot"
        style={{ cursor: 'pointer' }}
        onClick={checkConnection}
      >
        {getStatusText()}
      </Badge>
    </Tooltip>
  );
}
