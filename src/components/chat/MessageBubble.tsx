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
    // Convertir saltos de línea a <br>
    // Detectar listas
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Lista desordenada
      if (trimmed.match(/^[-•*]\s/)) {
        if (!inList) {
          html += '<ul class="valka-message-list">';
          inList = true;
        }
        html += `<li>${trimmed.replace(/^[-•*]\s/, '')}</li>`;
      } 
      // Lista ordenada
      else if (trimmed.match(/^\d+\.\s/)) {
        if (!inList) {
          html += '<ol class="valka-message-list">';
          inList = true;
        }
        html += `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
      } 
      // Texto normal
      else {
        if (inList) {
          html += inList ? '</ul>' : '</ol>';
          inList = false;
        }
        if (trimmed) {
          html += `<p class="valka-message-paragraph">${trimmed}</p>`;
        }
      }
    }

    if (inList) {
      html += '</ul>';
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
          <div 
            className="valka-message-text"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />

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
