import React from 'react';
import { ArrowDown } from 'lucide-react';

interface ScrollToBottomButtonProps {
  onClick: () => void;
}

export default function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className="valka-scroll-to-bottom"
      aria-label="Ir al último mensaje"
      type="button"
    >
      <ArrowDown className="w-4 h-4" />
      <span className="valka-scroll-to-bottom-text">Nuevos mensajes</span>
    </button>
  );
}
