import { useEffect, useState } from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { chatService } from '../services/api';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async () => {
    setLastChecked(new Date());
  };

  useEffect(() => {
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    return isConnected ? 'green' : 'red';
  };

  const getStatusText = () => {
    return isConnected ? 'Backend Connected' : 'Backend Disconnected';
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
