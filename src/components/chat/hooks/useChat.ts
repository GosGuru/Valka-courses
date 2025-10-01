import { useState, useCallback, useRef } from 'react';
import { sendMessageToFlowise } from '../../../lib/flowise';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface UseChatOptions {
  userContext?: {
    name?: string;
    level?: string;
    goals?: string[];
  };
}

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

      // Preparar historial para el contexto
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Agregar contexto de usuario si existe
      let enhancedMessage = text;
      if (userContext && messages.length === 0) {
        const contextParts = [];
        if (userContext.name) contextParts.push(`Mi nombre es ${userContext.name}`);
        if (userContext.level) contextParts.push(`mi nivel es ${userContext.level}`);
        if (userContext.goals && userContext.goals.length > 0) {
          contextParts.push(`mis objetivos son: ${userContext.goals.join(', ')}`);
        }
        if (contextParts.length > 0) {
          enhancedMessage = `[Contexto: ${contextParts.join(', ')}] ${text}`;
        }
      }

      // Enviar a Flowise
      const response = await sendMessageToFlowise({
        message: enhancedMessage,
        history
      });

      // Extraer respuesta
      const reply = 
        (response as any)?.text || 
        (response as any)?.answer || 
        (response as any)?.message || 
        (typeof response === 'string' ? response : JSON.stringify(response));

      // Crear mensaje del asistente
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: reply || 'Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?',
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
