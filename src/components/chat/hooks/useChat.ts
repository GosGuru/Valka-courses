import { useState, useCallback, useRef, useEffect } from 'react';
import { buildN8nPayload } from '../../../lib/n8n';
import { useChatStorage } from './useChatStorage';

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
  autoSave?: boolean;
  loadFromStorage?: boolean;
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

export function useChat({ 
  userContext,
  autoSave = true,
  loadFromStorage = true 
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string>('');

  const isLoggedIn = userContext?.id !== undefined && !userContext?.not_logged;
  
  // Hook de almacenamiento
  const chatStorage = useChatStorage({
    userId: userContext?.id,
    isLoggedIn,
    autoSave
  });

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Cargar mensajes del localStorage al iniciar
  useEffect(() => {
    if (loadFromStorage && chatStorage.storageReady) {
      const savedMessages = chatStorage.loadMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
        console.log(`[Chat] Loaded ${savedMessages.length} messages from storage`);
      }
    }
  }, [loadFromStorage, chatStorage.storageReady]);

  // Auto-guardar mensajes cuando cambien
  useEffect(() => {
    if (autoSave && chatStorage.storageReady && messages.length > 0) {
      chatStorage.saveMessages(messages);
    }
  }, [messages, autoSave, chatStorage.storageReady]);

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

      console.log('═════════════════════════════════════════════════════════');
      console.log('[N8N] 📦 PAYLOAD COMPLETO QUE SE VA A ENVIAR:');
      console.log('═════════════════════════════════════════════════════════');
      console.log('SessionId:', payload.sessionId);
      console.log('Message:', payload.message);
      console.log('History length:', payload.history.length);
      console.log('User context:', JSON.stringify(payload.user, null, 2));
      console.log('Meta:', JSON.stringify(payload.meta, null, 2));
      console.log('═════════════════════════════════════════════════════════');
      console.log('PAYLOAD JSON COMPLETO:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('═════════════════════════════════════════════════════════');

      // Usar proxy de Vite en desarrollo, directo en producción
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const n8nUrl = isDev 
        ? '/api/n8n/webhook/messageWEB'
        : 'https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB';
      
      console.log('[N8N] 🌐 URL de destino:', n8nUrl);
      console.log('[N8N] 🔧 Modo desarrollo:', isDev);
      console.log('[N8N] 📤 Enviando request con fetch...');

      // Enviar a N8N webhook (respuesta simple)
      const response = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('[N8N] 📡 Response recibido - Status:', response.status, response.statusText);

      console.log('[N8N] 📥 Status:', response.status);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Leer respuesta JSON simple (sin streaming)
      const responseText = await response.text();
      console.log('[N8N] 📥 Response:', responseText.substring(0, 200));

      if (!responseText || responseText.trim() === '') {
        throw new Error('El servidor devolvió una respuesta vacía');
      }

      // Parsear JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { output: responseText };
      }

      console.log('[N8N] Datos parseados:', data);

      // Extraer y limpiar contenido
      let reply: string = '';

      if (Array.isArray(data)) {
        // Si es array: [{output:"..."}, ...]
        reply = data.map(item => item.output || item.message || item.text || '').filter(t => t).join('\n\n');
      } else if (data.output && Array.isArray(data.output)) {
        // Si es {output:[{output:"..."}, ...]}
        const outputs = data.output
          .map((item: any) => {
            const text = item.output || item.text || item.content || '';
            return String(text)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\\"/g, '"')
              .trim();
          })
          .filter((text: string) => text.length > 0);
        reply = outputs.join('\n\n');
      } else if (data.output) {
        // Si es {output:"..."}
        reply = String(data.output)
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .trim();
      } else if (data.message || data.response || data.text) {
        reply = data.message || data.response || data.text;
      }

      if (!reply) {
        reply = 'Lo siento, no pude generar una respuesta. ¿Podrías reformular tu pregunta?';
      }

      console.log('[N8N] ✅ Respuesta final:', reply.substring(0, 100) + '...');

      // Crear mensaje del asistente con la respuesta
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

      // Solo mostrar error si realmente falló
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );

      const friendlyError = err?.message?.includes('500')
        ? 'El servidor está teniendo problemas. Por favor, intentá en unos segundos.'
        : err?.message || 'Error al conectar con el asistente. Por favor, intentá de nuevo.';
      
      setError(friendlyError);
      setIsLoading(false);
    }
  }, [isLoading, messages, userContext]);

  const retryLastMessage = useCallback(() => {
    if (lastUserMessageRef.current) {
      setMessages(prev => prev.filter(msg => 
        !(msg.role === 'user' && msg.status === 'error')
      ));
      setError(null);
      sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    if (chatStorage.storageReady) {
      chatStorage.clearMessages();
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, [chatStorage]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
    clearMessages,
    hasUnsavedChanges: chatStorage.hasUnsavedChanges,
    chatStorage
  };
}
