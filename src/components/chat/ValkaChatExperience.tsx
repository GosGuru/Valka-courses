import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, Maximize } from 'lucide-react';
import { useChat, type Message } from './hooks/useChat';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useBeforeUnload } from './hooks/useBeforeUnload';
import MessageBubble from './MessageBubble';
import StarterChips from './StarterChips';
import ScrollToBottomButton from './ScrollToBottomButton';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import AnimatedTrashIcon from './AnimatedTrashIcon';
import DeleteChatModal from './DeleteChatModal';
import UnsavedChangesModal from './UnsavedChangesModal';
import './valka-chat-premium.css';

export type { Message };

interface ValkaChatExperienceProps {
  className?: string;
  showHeader?: boolean;
  showFullscreenButton?: boolean;
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

export default function ValkaChatExperience({ 
  className = '', 
  showHeader = true,
  showFullscreenButton = true,
  userContext 
}: ValkaChatExperienceProps) {
  const navigate = useNavigate();
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearError,
    retryLastMessage,
    clearMessages,
    hasUnsavedChanges
  } = useChat({ userContext });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    shouldShowScrollButton,
    scrollToBottom,
    handleScroll
  } = useAutoScroll({
    messagesContainerRef,
    messagesEndRef,
    messageCount: messages.length
  });

  const [showStarterChips, setShowStarterChips] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isTrashActive, setIsTrashActive] = useState(false);

  // Determinar si el usuario está logueado
  const isLoggedIn = userContext?.id !== undefined && !userContext?.not_logged;

  // Protección contra pérdida de datos (solo para usuarios no logueados con mensajes)
  const shouldProtect = !isLoggedIn && messages.length > 0;
  
  const beforeUnload = useBeforeUnload({
    enabled: shouldProtect,
    onBeforeUnload: () => {
      console.log('[Chat] Attempting to leave with unsaved messages');
    }
  });

  // Enfocar input al cargar
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Ocultar chips después del primer mensaje
  useEffect(() => {
    if (messages.length > 0) {
      setShowStarterChips(false);
    }
  }, [messages.length]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride ?? input.trim();
    if (!text || isLoading) return;
    
    await sendMessage(text);
    if (!textOverride) {
      setInput('');
    }
  };

  const handleChipClick = (prompt: string) => {
    setInput(prompt);
    // Dar tiempo a la animación antes de enfocar
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(prompt.length, prompt.length);
    }, 200);
  };

  const handleOpenDeleteModal = () => {
    if (messages.length === 0) return;
    setIsTrashActive(true);
    setShowDeleteModal(true);
    
    // Resetear el estado activo después de la animación
    setTimeout(() => setIsTrashActive(false), 500);
  };

  const handleConfirmDelete = () => {
    clearMessages();
    setShowStarterChips(true);
  };

  const handleConfirmLeave = () => {
    // El usuario confirmó que quiere salir sin guardar
    // Deshabilitamos la protección temporalmente para permitir la navegación
    clearMessages();
    setShowUnsavedModal(false);
    
    // Si hay navegación pendiente, ejecutarla
    if (beforeUnload.pendingNavigation.current) {
      beforeUnload.pendingNavigation.current();
      beforeUnload.pendingNavigation.current = null;
    }
  };

  return (
    <div 
      className={`valka-chat-container ${className}`}
      role="region" 
      aria-label="Chat con asistente de Valka"
    >
      {/* Header opcional */}
      {showHeader && (
        <div className="valka-chat-header">
          <div className="valka-chat-header-content">
            <div className="valka-chat-header-icon">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="valka-chat-header-text">
              <h2 className="valka-chat-title">Asistente VALKA</h2>
              <p className="valka-chat-subtitle">
                Estoy aquí para guiarte en tu entrenamiento
              </p>
            </div>
            
            {/* Botones de acción */}
            <div className="valka-header-actions">
              {/* Botón Limpiar Chat */}
              <button
                onClick={handleOpenDeleteModal}
                className="valka-action-button"
                title="Limpiar conversación"
                aria-label="Limpiar conversación"
                disabled={messages.length === 0}
              >
                <AnimatedTrashIcon isActive={isTrashActive} />
              </button>

              {/* Botón Fullscreen */}
              {showFullscreenButton && (
                <button
                  onClick={() => navigate('/chat/fullscreen')}
                  className="valka-action-button"
                  title="Pantalla completa"
                  aria-label="Activar modo pantalla completa"
                >
                  <Maximize className="lucide-maximize" strokeWidth={1.5} size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        messageCount={messages.length}
      />

      {/* Modal de cambios sin guardar (solo para usuarios no logueados) */}
      {!isLoggedIn && (
        <UnsavedChangesModal
          isOpen={showUnsavedModal}
          onClose={() => setShowUnsavedModal(false)}
          onConfirmLeave={handleConfirmLeave}
          messageCount={messages.length}
        />
      )}

      {/* Área de mensajes */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="valka-chat-messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Starter chips cuando no hay mensajes */}
        {showStarterChips && messages.length === 0 && (
          <StarterChips onChipClick={handleChipClick} />
        )}

        {/* Mensajes */}
        {messages.map((message: Message, index: number) => (
          <MessageBubble
            key={message.id || index}
            message={message}
            isLatest={index === messages.length - 1}
          />
        ))}

        {/* Indicador de escritura - solo si NO hay mensaje del asistente en progreso */}
        {isLoading && !messages.some(m => m.role === 'assistant' && m.status === 'sending') && (
          <TypingIndicator />
        )}

        {/* Anchor para scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Botón scroll to bottom */}
      {shouldShowScrollButton && (
        <ScrollToBottomButton onClick={scrollToBottom} />
      )}

      {/* Input area */}
      <div className="valka-chat-input-container">
        {/* Error banner */}
        {error && (
          <div className="valka-chat-error" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={retryLastMessage}
              className="valka-chat-error-retry"
              aria-label="Reintentar envío"
            >
              Reintentar
            </button>
            <button
              onClick={clearError}
              className="valka-chat-error-close"
              aria-label="Cerrar error"
            >
              ×
            </button>
          </div>
        )}

        {/* Input y botón */}
        <MessageInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
