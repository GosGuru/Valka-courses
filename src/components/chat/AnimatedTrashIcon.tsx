import React from 'react';
import './AnimatedTrashIcon.css';

interface AnimatedTrashIconProps {
  className?: string;
  isActive?: boolean;
}

export default function AnimatedTrashIcon({ 
  className = '', 
  isActive = false 
}: AnimatedTrashIconProps) {
  return (
    <svg
      className={`animated-trash-icon ${isActive ? 'active' : ''} ${className}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cuerpo de la basura */}
      <path
        className="trash-body"
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
      />
      <path
        className="trash-body"
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
      />
      
      {/* Líneas internas */}
      <g className="trash-lines">
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </g>
      
      {/* Tapa que se abre */}
      <path
        className="trash-lid"
        d="M3 6h18"
      />
    </svg>
  );
}
