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
  threshold = 150
}: UseAutoScrollOptions) {
  const [shouldShowScrollButton, setShouldShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para hacer scroll al fondo
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
    setShouldShowScrollButton(false);
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
    const isScrollingDown = currentScrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = currentScrollTop;

    // Usuario está haciendo scroll manualmente
    setIsUserScrolling(true);

    // Actualizar visibilidad del botón
    const nearBottom = isNearBottom();
    setShouldShowScrollButton(!nearBottom);

    // Reset del flag después de un tiempo
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, [isNearBottom, messagesContainerRef]);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    // Si el usuario no está haciendo scroll y está cerca del fondo, auto-scroll
    if (!isUserScrolling || isNearBottom()) {
      // Pequeño delay para que el DOM se actualice
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Si está lejos del fondo, mostrar botón
      setShouldShowScrollButton(true);
    }
  }, [messageCount, isUserScrolling, isNearBottom, scrollToBottom]);

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
