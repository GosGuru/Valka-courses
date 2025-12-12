import { useEffect, useCallback, useRef, useState } from 'react';

interface UseBeforeUnloadOptions {
  enabled: boolean;
  message?: string;
  onBeforeUnload?: () => void;
}

export function useBeforeUnload({ 
  enabled, 
  message = 'Tenés cambios sin guardar. ¿Estás seguro de que querés salir?',
  onBeforeUnload 
}: UseBeforeUnloadOptions) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  // Handler para beforeunload (navegación externa, cierre de pestaña, recarga)
  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!enabled) return;
    
    // Llamar callback si existe
    if (onBeforeUnload) {
      onBeforeUnload();
    }
    
    // Prevenir el unload y mostrar diálogo del navegador
    e.preventDefault();
    // Chrome requiere returnValue
    e.returnValue = message;
    return message;
  }, [enabled, message, onBeforeUnload]);

  // Agregar/remover listener según el estado
  useEffect(() => {
    if (enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      console.log('[BeforeUnload] Protection enabled');
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      console.log('[BeforeUnload] Protection disabled');
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, handleBeforeUnload]);

  // Métodos para control manual
  const enable = useCallback(() => {
    // La protección se habilitará en el próximo render
  }, []);

  const disable = useCallback(() => {
    // La protección se deshabilitará en el próximo render
  }, []);

  return {
    isProtected: enabled,
    enable,
    disable,
    showCustomModal,
    setShowCustomModal,
    pendingNavigation: pendingNavigationRef
  };
}
