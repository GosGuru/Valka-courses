import React, { forwardRef, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ value, onChange, onSend, isLoading, disabled = false }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = 'auto';
      const maxHeight = 140; // px
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    }, [value, textareaRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !isLoading && value.trim()) {
          onSend();
        }
      }
    };

    const handleSubmit = () => {
      if (!disabled && !isLoading && value.trim()) {
        onSend();
      }
    };

    return (
      <div className="valka-input-wrapper">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí tu pregunta..."
          className="valka-input"
          disabled={disabled || isLoading}
          rows={1}
          aria-label="Escribe tu mensaje"
          maxLength={2000}
        />

        <button
          onClick={handleSubmit}
          disabled={disabled || isLoading || !value.trim()}
          className="valka-send-button"
          aria-label={isLoading ? 'Enviando mensaje' : 'Enviar mensaje'}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              <span className="valka-send-button-text">Enviando</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="valka-send-button-text">Enviar</span>
            </>
          )}
        </button>
      </div>
    );
  }
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
