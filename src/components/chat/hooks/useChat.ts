import { useState, useCallback, useRef } from 'react';
import { buildN8nPayload } from '../../../lib/n8n';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface UseChatOptions {
  userContext?: {
    id?: string;
    name?: string;
    level?: string;
    goals?: string;
    equipment?: string[];
    time_per_session_min?: number;
    not_logged?: boolean;
  };
}

// Generar UUID simple sin dependencias
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// SessionId persistente por usuario
let globalSessionId: string | null = null;
const getSessionId = () => {
  if (!globalSessionId) {
    globalSessionId = generateUUID();
  }
  return globalSessionId;
};

export function useChat({ userContext }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string>('');

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    lastUserMessageRef.current = text;
    setError(null);

    // Crear mensaje de usuario
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Marcar como enviado
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );

      // Preparar historial para N8N
      const history = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Construir payload para N8N
      const sessionId = getSessionId();
      const payload = buildN8nPayload(
        sessionId,
        text,
        history,
        userContext || { not_logged: true },
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      );

      console.log('[N8N] Enviando:', payload);

      // Enviar a N8N webhook
      const response = await fetch(
        'https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[N8N] Respuesta:', data);

      // Extraer respuesta del N8N
      const reply = 
        data?.output || 
        data?.message || 
        data?.response || 
        data?.text || 
        'Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?';

      // Crear mensaje del asistente
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        status: 'sent'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);

    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      
      // Marcar mensaje de usuario como error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );

      setError(err?.message || 'Error al conectar con el asistente. Por favor, intentá de nuevo.');
      setIsLoading(false);
    }
  }, [isLoading, messages, userContext]);

  const retryLastMessage = useCallback(() => {
    if (lastUserMessageRef.current) {
      // Eliminar el último mensaje de usuario con error
      setMessages(prev => {
        const filtered = prev.filter(msg => 
          !(msg.role === 'user' && msg.status === 'error')
        );
        return filtered;
      });
      setError(null);
      sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setInput('');
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
    clearMessages
  };
}
