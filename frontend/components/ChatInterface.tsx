import { useState } from 'react';
import { Paper, TextInput, Button, Stack, ScrollArea, Box } from '@mantine/core';
import { FaPaperPlane, FaMicrophone, FaStop } from 'react-icons/fa';
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const transcribeAudio = async (audioBase64: string) => {
    try {
      setIsTranscribing(true);
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio_base64: audioBase64 }),
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        
        recorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            if (typeof reader.result === 'string') {
              try {
                const base64Audio = reader.result.split(',')[1]; // Remove data URL prefix
                const transcribedText = await transcribeAudio(base64Audio);
                setInput(transcribedText);
                onSendMessage(transcribedText);
              } catch (error) {
                console.error('Error processing audio:', error);
              }
            }
          };
          
          reader.readAsDataURL(blob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
      }
      setIsRecording(false);
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
        <Stack gap="lg">
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
        <Stack gap="xs">
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextInput
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1 }}
              disabled={isLoading || isTranscribing}
            />
            <Button
              variant="filled"
              size="sm"
              color={isRecording ? 'red' : 'blue'}
              onClick={toggleRecording}
              type="button"
              loading={isTranscribing}
              disabled={isLoading}
            >
              {isRecording ? <FaStop size={14} /> : <FaMicrophone size={14} />}
            </Button>
            <Button
              type="submit"
              variant="filled"
              size="sm"
              disabled={!input.trim() || isLoading || isTranscribing}
              loading={isLoading}
            >
              <span style={{ marginRight: '6px' }}>Submit</span>
              <FaPaperPlane size={14} />
            </Button>
          </div>
        </Stack>
      </Box>
    </Paper>
  );
}
