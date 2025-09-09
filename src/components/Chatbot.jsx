import React, { useEffect, useRef, useState } from "react";
import "@n8n/chat/style.css";
import "../styles/chatbot.css";
import ChatbotFallback from "./ChatbotFallback";

const Chatbot = () => {
  const chatContainerRef = useRef(null);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const enhancementsAppliedRef = useRef(false);

  // Eliminados íconos personalizados para estados de envío (petición del usuario)

  const setupEnhancements = () => {
    if (enhancementsAppliedRef.current) return; // evitar duplicados
    const messagesContainer = document.querySelector('[data-chat-messages]');
    const inputWrapper = document.querySelector('[data-chat-input]');
    const textarea = inputWrapper?.querySelector('textarea');
    const sendButton = inputWrapper?.querySelector('button');
    if (!messagesContainer || !inputWrapper || !textarea || !sendButton) return;

    enhancementsAppliedRef.current = true;

    // Auto-expansión del textarea
    const autoResize = () => {
      textarea.style.height = 'auto';
      const max = 140; // px
      const newH = Math.min(textarea.scrollHeight, max);
      textarea.style.height = newH + 'px';
      // Scroll container al fondo para que siempre se vea el input
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    textarea.addEventListener('input', autoResize);
    autoResize();

  let loadingUIActive = false;
  let loaderBubble = null;
  // Para streaming parcial
  let botMessagesCountAtSend = 0;
  let lastPartialLength = 0;

    const startLoadingUI = () => {
      if (loadingUIActive) return;
      loadingUIActive = true;
      // Solo mostramos burbuja loader, sin tocar el botón
      loaderBubble = document.createElement('div');
      loaderBubble.className = 'valka-chat-loader-bubble';
      loaderBubble.innerHTML = '<div class="valka-spinner" aria-label="Pensando..."></div>';
      messagesContainer.appendChild(loaderBubble);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      botMessagesCountAtSend = messagesContainer.querySelectorAll('[data-chat-message="bot"]').length;
      lastPartialLength = 0;
    };

    const stopLoadingUI = () => {
      if (!loadingUIActive) return;
      loadingUIActive = false;
      if (loaderBubble && loaderBubble.parentNode) loaderBubble.parentNode.removeChild(loaderBubble);
      loaderBubble = null;
    };

    // Observer: detectar nuevo mensaje bot o streaming dentro del último
    const observer = new MutationObserver(() => {
      if (!loadingUIActive) return;
      const botMessages = messagesContainer.querySelectorAll('[data-chat-message="bot"]');
      const currentCount = botMessages.length;
      if (currentCount > botMessagesCountAtSend) {
        stopLoadingUI();
        return;
      }
      if (currentCount === botMessagesCountAtSend && currentCount > 0) {
        const lastBot = botMessages[currentCount - 1];
        if (lastBot) {
          const txt = lastBot.textContent || '';
          if (txt.trim().length > 0 && txt.length !== lastPartialLength) {
            stopLoadingUI();
            return;
          }
          lastPartialLength = txt.length;
        }
      }
    });
    observer.observe(messagesContainer, { childList: true, subtree: true, characterData: true });

    // Hook al botón enviar
    sendButton.addEventListener('click', () => {
      const val = textarea.value.trim();
      if (val.length) {
        startLoadingUI();
        // Reset altura tras enviar (el lib limpia el textarea)
        setTimeout(() => {
          autoResize();
        }, 50);
      }
    });

    // Hook a Enter (sin Shift) para enviar
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const val = textarea.value.trim();
        if (val.length) {
          // Dejar que la lib procese el submit, luego activar loader
          setTimeout(() => startLoadingUI(), 0);
        }
      }
    });

    // Safety: si pasan 25s sin respuesta, restaurar
    const safetyInterval = setInterval(() => {
      if (!loadingUIActive) return;
      // Si no hay loaderBubble (ej: fue removido) restaurar
      if (!document.body.contains(loaderBubble)) {
        stopLoadingUI();
      }
    }, 25000);

    // Limpieza
    const cleanup = () => {
      textarea.removeEventListener('input', autoResize);
      textarea.removeEventListener('keydown', () => {}); // no critical
      sendButton.removeEventListener('click', () => {});
      observer.disconnect();
      clearInterval(safetyInterval);
    };
    // Guardar en ref para futura limpieza si se quisiera
    enhancementsAppliedRef.current = true;
  };

  useEffect(() => {
    let chatInstance = null;

    const loadChat = async () => {
      try {
        setLoading(true);
        console.log("🔄 Cargando chatbot de VALKA... Intento:", retryCount + 1);

        // Limpiar contenedor existente
        if (chatContainerRef.current) {
          chatContainerRef.current.innerHTML = "";
        }

        // Remover widgets existentes
        const existingWidgets = document.querySelectorAll(
          "[data-chat-widget], #n8n-chat, .n8n-chat"
        );
        existingWidgets.forEach((widget) => widget.remove());

        // Importar y crear chat
        const { createChat } = await import("@n8n/chat");
        console.log("📦 Módulo @n8n/chat importado correctamente");

        // Configuración simplificada del chat
        chatInstance = createChat({
          webhookUrl:
            "https://n8n-n8n.ua4qkv.easypanel.host/webhook/fcd8405d-5e63-4604-a6cf-3e89b4a5c402/chat",
          target: "#valka-chatbot-container",
          mode: "window",
          loadPreviousSession: false, // Deshabilitado para evitar errores
          showWelcomeScreen: true,
          initialMessages: [
            "¡Hola! ",
            "Soy el asistente virtual de VALKA. ¿En qué puedo ayudarte hoy?",
          ],
          i18n: {
            en: {
              title: "¡Hola! ",
              subtitle: "Guerrero de VALKA, ¿en qué puedo guiarte hoy?",
              footer: "", // Texto vacío para eliminar "Powered by"
              getStarted: "Iniciar Conversación",
              inputPlaceholder: "Escribe tu pregunta...",
            },
          },
          // Activar streaming para recibir tokens incrementales desde n8n
          enableStreaming: true,
          metadata: {
            source: "valka-platform",
            timestamp: new Date().toISOString(),
          },
        });

        // Verificar que el chat se creó correctamente
        setTimeout(() => {
          // Buscar el widget del chat con múltiples selectores
          const chatWidget = document.querySelector(
            "[data-chat-widget], [data-chat-toggle], .n8n-chat, #valka-chatbot-container > *"
          );

          if (chatWidget) {
            setChatLoaded(true);
            setLoading(false);
            console.log("✅ Chatbot de VALKA cargado correctamente");
            // Pequeño delay para asegurar que el DOM interno esté listo
            setTimeout(setupEnhancements, 500);
          } else {
            throw new Error(
              "Widget del chat no encontrado después de la inicialización"
            );
          }
        }, 3000); // Más tiempo para que se cargue
      } catch (error) {
        console.error("❌ Error al cargar el chatbot:", error);
        setLoading(false);

        // Reintentar hasta 3 veces
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000);
        }
      }
    };

    // Cargar el chat
    const timer = setTimeout(loadChat, 20);

    return () => {
      clearTimeout(timer);
      if (chatInstance) {
        try {
          const chatWidget = document.querySelector(
            "[data-chat-widget], #n8n-chat"
          );
          if (chatWidget) {
            chatWidget.remove();
          }
        } catch (error) {
          console.log("Error al limpiar el chatbot:", error);
        }
      }
    };
  }, [retryCount]);

  const handleFallbackClick = () => {
    // Reintentar cargar
    setChatLoaded(false);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <>
      <div
        id="valka-chatbot-container"
        ref={chatContainerRef}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
        }}
      />
      {!chatLoaded && (
        <ChatbotFallback onClick={handleFallbackClick} loading={loading} />
      )}
      {retryCount >= 3 && !chatLoaded && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            background: "hsl(260, 70%, 35%)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            zIndex: 9999,
            maxWidth: "200px",
            textAlign: "center",
          }}
        >
          El chatbot está temporalmente no disponible. <br />
          <small>Intenta recargar la página.</small>
        </div>
      )}
    </>
  );
};

export default Chatbot;
