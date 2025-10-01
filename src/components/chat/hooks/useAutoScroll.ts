import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoScrollOptions {
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  messageCount: number;
  threshold?: number; // px desde el fondo para considerar "en el fondo"
}

export function useAutoScroll({
  messagesContainerRef,
  messagesEndRef,
  messageCount,
  threshold = 200
}: UseAutoScrollOptions) {
  const [shouldShowScrollButton, setShouldShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para hacer scroll al fondo
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
    setShouldShowScrollButton(false);
    setUserHasScrolledUp(false);
  }, [messagesEndRef]);

  // Detectar si el usuario está cerca del fondo
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= threshold;
  }, [messagesContainerRef, threshold]);

  // Handler del scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    lastScrollTopRef.current = currentScrollTop;

    // Usuario está haciendo scroll manualmente
    setIsUserScrolling(true);
    
    // Si scrollea hacia arriba, marcamos que quiere ver mensajes antiguos
    if (isScrollingUp) {
      setUserHasScrolledUp(true);
    }

    // Actualizar visibilidad del botón
    const nearBottom = isNearBottom();
    setShouldShowScrollButton(!nearBottom);
    
    // Si llegó al fondo manualmente, resetear flag
    if (nearBottom) {
      setUserHasScrolledUp(false);
    }

    // Reset del flag después de un tiempo más largo para iOS
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 300);
  }, [isNearBottom, messagesContainerRef]);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    // Solo auto-scroll si el usuario NO ha scrolleado hacia arriba intencionalmente
    // y está cerca del fondo
    if (!userHasScrolledUp && (!isUserScrolling || isNearBottom())) {
      // Delay más largo para iOS para evitar conflictos con momentum scroll
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 150);
      return () => clearTimeout(timer);
    } else if (userHasScrolledUp) {
      // Si está lejos del fondo intencionalmente, mostrar botón
      setShouldShowScrollButton(true);
    }
  }, [messageCount, isUserScrolling, userHasScrolledUp, isNearBottom, scrollToBottom]);

  // Scroll inicial (sin animación)
  useEffect(() => {
    if (messageCount === 0) {
      scrollToBottom(false);
    }
  }, [messageCount, scrollToBottom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    shouldShowScrollButton,
    scrollToBottom,
    handleScroll,
    isNearBottom
  };
}
