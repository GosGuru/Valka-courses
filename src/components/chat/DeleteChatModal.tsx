import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import './DeleteChatModal.css';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messageCount: number;
}

export default function DeleteChatModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  messageCount 
}: DeleteChatModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Pequeño delay para activar la animación
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Esperar a que termine la animación antes de ocultar
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`delete-modal-backdrop ${isAnimating ? 'active' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className={`delete-modal-container ${isAnimating ? 'active' : ''}`}>
        <div className="delete-modal-content">
          {/* Icono de advertencia */}
          <div className="delete-modal-icon">
            <AlertTriangle className="w-6 h-6" />
          </div>

          {/* Título */}
          <h2 id="delete-modal-title" className="delete-modal-title">
            Eliminar conversación
          </h2>

          {/* Descripción */}
          <p className="delete-modal-description">
            ¿Estás seguro de que querés eliminar esta conversación? 
            {messageCount > 0 && (
              <span className="delete-modal-count">
                {' '}Se eliminarán {messageCount} mensaje{messageCount !== 1 ? 's' : ''}.
              </span>
            )}
          </p>

          <p className="delete-modal-warning">
            Esta acción no se puede deshacer.
          </p>

          {/* Botones */}
          <div className="delete-modal-actions">
            <button
              onClick={onClose}
              className="delete-modal-button delete-modal-button-cancel"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="delete-modal-button delete-modal-button-delete"
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
