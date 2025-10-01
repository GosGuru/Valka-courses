import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useChat, type Message } from './hooks/useChat';
import { useAutoScroll } from './hooks/useAutoScroll';
import MessageBubble from './MessageBubble';
import StarterChips from './StarterChips';
import ScrollToBottomButton from './ScrollToBottomButton';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import './valka-chat-premium.css';

export type { Message };

interface ValkaChatExperienceProps {
  className?: string;
  showHeader?: boolean;
  userContext?: {
    name?: string;
    level?: string;
    goals?: string[];
  };
}

export default function ValkaChatExperience({ 
  className = '', 
  showHeader = true,
  userContext 
}: ValkaChatExperienceProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearError,
    retryLastMessage
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
          </div>
        </div>
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

        {/* Indicador de escritura */}
        {isLoading && <TypingIndicator />}

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
