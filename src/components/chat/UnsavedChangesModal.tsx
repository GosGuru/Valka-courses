import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import './UnsavedChangesModal.css';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
  messageCount: number;
}

export default function UnsavedChangesModal({ 
  isOpen, 
  onClose, 
  onConfirmLeave,
  messageCount 
}: UnsavedChangesModalProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirmLeave = () => {
    onConfirmLeave();
    onClose();
  };

  const handleSignIn = () => {
    // Primero cerrar el modal
    onClose();
    // Navegar al login después de un pequeño delay
    setTimeout(() => {
      navigate('/auth');
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`unsaved-modal-backdrop ${isAnimating ? 'active' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-modal-title"
    >
      <div className={`unsaved-modal-container ${isAnimating ? 'active' : ''}`}>
        <div className="unsaved-modal-content">
          {/* Icono de advertencia */}
          <div className="unsaved-modal-icon">
            <AlertCircle className="w-6 h-6" />
          </div>

          {/* Título */}
          <h2 id="unsaved-modal-title" className="unsaved-modal-title">
            Perderás esta conversación
          </h2>

          {/* Descripción */}
          <p className="unsaved-modal-description">
            Tenés {messageCount} mensaje{messageCount !== 1 ? 's' : ''} sin guardar.
            {' '}Si salís ahora, se perderán permanentemente.
          </p>

          <p className="unsaved-modal-suggestion">
            <strong>💡 Sugerencia:</strong> Iniciá sesión para guardar automáticamente todas tus conversaciones.
          </p>

          {/* Botones */}
          <div className="unsaved-modal-actions">
            <button
              onClick={onClose}
              className="unsaved-modal-button unsaved-modal-button-cancel"
              type="button"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSignIn}
              className="unsaved-modal-button unsaved-modal-button-signin"
              type="button"
            >
              <LogIn size={16} strokeWidth={2} />
              Iniciar Sesión
            </button>
            
            <button
              onClick={handleConfirmLeave}
              className="unsaved-modal-button unsaved-modal-button-leave"
              type="button"
            >
              Salir de todos modos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
