import React, { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const formatContent = (content: string) => {
    // Función helper para aplicar markdown básico
    const applyMarkdown = (text: string) => {
      return text
        // Negritas: **texto** o __texto__
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        // Cursivas: *texto* o _texto_
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        // Código inline: `texto`
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    };

    // Convertir saltos de línea a <br> y detectar listas
    const lines = content.split('\n');
    let html = '';
    let inList = false;
    let listType = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Lista desordenada
      if (trimmed.match(/^[-•*]\s/)) {
        if (!inList || listType !== 'ul') {
          if (inList) html += `</${listType}>`;
          html += '<ul class="valka-message-list">';
          inList = true;
          listType = 'ul';
        }
        const itemText = applyMarkdown(trimmed.replace(/^[-•*]\s/, ''));
        html += `<li>${itemText}</li>`;
      } 
      // Lista ordenada
      else if (trimmed.match(/^\d+\.\s/)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += `</${listType}>`;
          html += '<ol class="valka-message-list">';
          inList = true;
          listType = 'ol';
        }
        const itemText = applyMarkdown(trimmed.replace(/^\d+\.\s/, ''));
        html += `<li>${itemText}</li>`;
      } 
      // Texto normal
      else {
        if (inList) {
          html += `</${listType}>`;
          inList = false;
          listType = '';
        }
        if (trimmed) {
          const formattedText = applyMarkdown(trimmed);
          html += `<p class="valka-message-paragraph">${formattedText}</p>`;
        }
      }
    }

    if (inList) {
      html += `</${listType}>`;
    }

    return html;
  };

  return (
    <div 
      className={`valka-message-wrapper ${isUser ? 'valka-message-user-wrapper' : 'valka-message-assistant-wrapper'}`}
      data-message-role={message.role}
    >
      <div className={`valka-message-bubble ${isUser ? 'valka-message-user' : 'valka-message-assistant'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="valka-message-avatar">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}

        {/* Contenido */}
        <div className="valka-message-content">
          {/* Mostrar contenido si existe */}
          {message.content && (
            <>
              <div 
                className="valka-message-text"
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
              {/* Cursor parpadeante solo cuando está recibiendo más contenido */}
              {!isUser && message.status === 'sending' && (
                <span className="valka-streaming-cursor">▋</span>
              )}
            </>
          )}

          {/* Estado de envío para mensajes de usuario */}
          {isUser && message.status === 'sending' && (
            <div className="valka-message-status">
              <span className="valka-message-status-dot valka-message-status-sending"></span>
              <span className="valka-message-status-text">Enviando...</span>
            </div>
          )}

          {isUser && message.status === 'error' && (
            <div className="valka-message-status valka-message-status-error-text">
              <span className="valka-message-status-dot valka-message-status-error"></span>
              <span className="valka-message-status-text">Error al enviar</span>
            </div>
          )}
        </div>

        {/* Botón copiar (solo para asistente) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="valka-message-copy-btn"
            aria-label={copied ? 'Copiado' : 'Copiar mensaje'}
            title={copied ? 'Copiado' : 'Copiar'}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Avatar usuario */}
        {isUser && (
          <div className="valka-message-avatar valka-message-avatar-user">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
