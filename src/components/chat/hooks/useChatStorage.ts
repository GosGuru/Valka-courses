import { useState, useEffect, useCallback } from 'react';
import { Message } from './useChat';

const CHAT_STORAGE_KEY = 'valka_chat_messages';
const CHAT_TIMESTAMP_KEY = 'valka_chat_timestamp';
const CHAT_EXPIRY_DAYS = 7; // Mensajes expiran después de 7 días

interface UseChatStorageOptions {
  userId?: string | null;
  isLoggedIn: boolean;
  autoSave?: boolean;
}

export function useChatStorage({ 
  userId, 
  isLoggedIn,
  autoSave = true 
}: UseChatStorageOptions) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  // Generar key única para cada usuario
  const getStorageKey = useCallback((key: string) => {
    if (isLoggedIn && userId) {
      return `${key}_user_${userId}`;
    }
    return `${key}_guest`;
  }, [userId, isLoggedIn]);

  // Verificar si los mensajes han expirado
  const isExpired = useCallback(() => {
    const timestampKey = getStorageKey(CHAT_TIMESTAMP_KEY);
    const timestamp = localStorage.getItem(timestampKey);
    
    if (!timestamp) return true;
    
    const savedDate = new Date(parseInt(timestamp));
    const now = new Date();
    const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > CHAT_EXPIRY_DAYS;
  }, [getStorageKey]);

  // Cargar mensajes del localStorage
  const loadMessages = useCallback((): Message[] => {
    try {
      const storageKey = getStorageKey(CHAT_STORAGE_KEY);
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) return [];
      
      // Verificar expiración
      if (isExpired()) {
        clearMessages();
        return [];
      }
      
      const messages = JSON.parse(saved);
      
      // Convertir timestamps string a Date objects
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('[ChatStorage] Error loading messages:', error);
      return [];
    }
  }, [getStorageKey, isExpired]);

  // Guardar mensajes en localStorage
  const saveMessages = useCallback((messages: Message[]) => {
    try {
      if (messages.length === 0) {
        clearMessages();
        setHasUnsavedChanges(false);
        return;
      }

      const storageKey = getStorageKey(CHAT_STORAGE_KEY);
      const timestampKey = getStorageKey(CHAT_TIMESTAMP_KEY);
      
      // Guardar mensajes
      localStorage.setItem(storageKey, JSON.stringify(messages));
      
      // Guardar timestamp
      localStorage.setItem(timestampKey, Date.now().toString());
      
      setHasUnsavedChanges(true);
      
      console.log(`[ChatStorage] Saved ${messages.length} messages for`, 
        isLoggedIn ? `user ${userId}` : 'guest');
    } catch (error) {
      console.error('[ChatStorage] Error saving messages:', error);
    }
  }, [getStorageKey, userId, isLoggedIn]);

  // Limpiar mensajes del localStorage
  const clearMessages = useCallback(() => {
    try {
      const storageKey = getStorageKey(CHAT_STORAGE_KEY);
      const timestampKey = getStorageKey(CHAT_TIMESTAMP_KEY);
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem(timestampKey);
      
      setHasUnsavedChanges(false);
      
      console.log('[ChatStorage] Cleared messages');
    } catch (error) {
      console.error('[ChatStorage] Error clearing messages:', error);
    }
  }, [getStorageKey]);

  // Verificar si hay mensajes guardados
  const hasStoredMessages = useCallback((): boolean => {
    const storageKey = getStorageKey(CHAT_STORAGE_KEY);
    const saved = localStorage.getItem(storageKey);
    return saved !== null && !isExpired();
  }, [getStorageKey, isExpired]);

  // Inicializar
  useEffect(() => {
    const messages = loadMessages();
    setHasUnsavedChanges(messages.length > 0);
    setStorageReady(true);
  }, [loadMessages]);

  return {
    loadMessages,
    saveMessages,
    clearMessages,
    hasStoredMessages,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    storageReady
  };
}
