import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="valka-message-wrapper valka-message-assistant-wrapper">
      <div className="valka-message-bubble valka-message-assistant valka-typing-indicator">
        <div className="valka-message-avatar">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        
        <div className="valka-typing-dots">
          <span className="valka-typing-dot"></span>
          <span className="valka-typing-dot"></span>
          <span className="valka-typing-dot"></span>
        </div>
      </div>
    </div>
  );
}
