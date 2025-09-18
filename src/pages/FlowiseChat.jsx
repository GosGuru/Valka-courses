import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

// Página de chat con header y fondo dinámico
const FlowiseChat = () => {
  return (
    <>
      <Helmet>
        <title>Chat Valka</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Asistente de Valka para dudas rápidas sobre calistenia." />
      </Helmet>

      <section className="relative min-h-[80vh] valka-animated-bg">
        {/* Header superior */}
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/40 backdrop-blur">
          <div className="flex items-center justify-between w-full max-w-6xl px-4 py-3 mx-auto md:px-6">
            <Link to="/" className="text-2xl tracking-wider font-logo text-primary">VALKA</Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/programs" className="rounded px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/60 transition-colors">Programas</Link>
              <a href="/politica-privacidad" className="rounded px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent hover:border-border/60 transition-colors">Privacidad</a>
            </nav>
          </div>
        </header>

        {/* Aviso de privacidad breve */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="px-4 pt-4 pb-2 text-xs text-muted-foreground md:px-6">
            Este chat sanitiza datos personales automáticamente. Podés usar la opción "No publicar mi pregunta" en tu primer mensaje.
            <a href="/politica-privacidad" className="ml-2 underline text-primary">Política de Privacidad</a>
          </div>
        </div>

        {/* Contenedor del chat */}
        <div className="min-h-[70vh] w-full">
          <FlowiseFullPage />
        </div>
      </section>
    </>
  );
};

// Wrapper del widget FullPageChat con import dinámico
const FlowiseFullPage = () => {
  const [Comp, setComp] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("flowise-embed-react");
      if (mounted) setComp(() => mod.FullPageChat);
    })();
    return () => { mounted = false; };
  }, []);

  if (!Comp) return <div className="p-6 text-center text-muted-foreground">Cargando chat…</div>;

  return (
    <Comp
      chatflowid="e7d9faeb-a60d-41aa-a12c-1028daba491a"
      apiHost="https://cloud.flowiseai.com"
      theme={{
        button: {
          backgroundColor: "hsl(var(--primary))",
          right: 20,
          bottom: 20,
          size: 48,
          dragAndDrop: true,
          iconColor: "white",
          customIconSrc: "https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg",
          autoWindowOpen: { autoOpen: false, openDelay: 0, autoOpenOnMobile: false },
        },
        tooltip: { showTooltip: true, tooltipMessage: "Hola 👋", tooltipBackgroundColor: "black", tooltipTextColor: "white", tooltipFontSize: 16 },
        disclaimer: {
          title: "Privacidad",
          message: 'Al usar este chat aceptás la <a target="_blank" href="/politica-privacidad">Política de Privacidad</a>.',
          textColor: "black",
          buttonColor: "#3b82f6",
          buttonText: "Empezar",
          buttonTextColor: "white",
          blurredBackgroundColor: "rgba(0, 0, 0, 0.4)",
          backgroundColor: "white",
        },
        // CSS inyectado dentro del widget para alinear tipografías y radios con VALKA
        customCSS: `
          :root { --valka-primary: #3B81F6; --valka-chat-h: 600px; }
          * { font-family: 'Bebas Neue', sans-serif; }
          h1,h2,h3,.fc-title,.chatbot-header-title { font-family: 'Russo One', sans-serif !important; letter-spacing: .06em; }
          /* Eliminar halo, altura fija y layout en 3 filas (header, mensajes con scroll, input) */
          .fc-chat-window, .chat-window, .chatbot-container {
            border-radius: 16px !important;
            border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: 0 10px 30px rgba(0,0,0,.25) !important;
            background: transparent !important;
            overflow: hidden !important;
            height: var(--valka-chat-h) !important;
            max-height: var(--valka-chat-h) !important;
            display: grid !important;
            grid-template-rows: auto 1fr auto !important;
          }
          /* Asignar filas por posición presumida */
          .fc-chat-window > *:first-child, .chat-window > *:first-child, .chatbot-container > *:first-child { grid-row: 1 !important; }
          .fc-chat-window > *:last-child, .chat-window > *:last-child, .chatbot-container > *:last-child { grid-row: 3 !important; }
          .fc-chat-window > *:not(:first-child):not(:last-child),
          .chat-window > *:not(:first-child):not(:last-child),
          .chatbot-container > *:not(:first-child):not(:last-child) {
            grid-row: 2 !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding: 12px !important;
          }
          /* Alturas responsivas por variable */
          @media (max-width: 1024px) { :root { --valka-chat-h: 560px; } }
          @media (max-width: 768px)  { :root { --valka-chat-h: 520px; } }
          @media (max-width: 480px)  { :root { --valka-chat-h: 460px; } }
          /* Safe-area iOS para el footer */
          .fc-footer, .chat-footer { padding-bottom: max(8px, env(safe-area-inset-bottom, 0px)) !important; }
          .chatbot-header, .fc-header, .chat-header, .chat-body, .fc-body, .chat-footer, .fc-footer {
            background: transparent !important;
          }
          /* El área de mensajes crece y hace scroll; input y header quedan fijos */
          /* Compat: si existen estas clases, también aplicamos scroll */
          .fc-body, .chat-body { 
            overflow-y: auto !important; 
            scroll-behavior: smooth !important;
          }
          .fc-header, .chat-header, .fc-footer, .chat-footer { flex: 0 0 auto !important; position: static !important; }
          .fc-input, .text-input, input[type="text"], textarea { 
            border-radius: 12px !important; 
            background: rgba(0,0,0,.15) !important;
            color: #e6e6e6 !important;
            border: 1px solid rgba(255,255,255,.08) !important;
          }
          .fc-input::placeholder, .text-input::placeholder { color: #bdbdbd !important; }
          /* Asegurar contraste del título */
          .fc-title, .chatbot-header-title { color: #e6e6e6 !important; text-shadow: 0 1px 2px rgba(0,0,0,.35); font-size: 18px !important; }
          .user-message { background: hsl(var(--primary)) !important; color: #111 !important; }
          .bot-message { background: rgba(17,24,39,.85) !important; color: #F5F5F5 !important; border-left: 3px solid hsl(var(--primary)); }
          .fc-footer, .chat-footer { 
            opacity: 1 !important; 
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(10,10,10,.45) 60%, rgba(10,10,10,.65) 100%) !important;
            backdrop-filter: blur(4px) !important;
          }
          /* Input controlado: altura y sin scrollbar visual salvo texto multi-línea */
          .fc-footer textarea, .chat-footer textarea { min-height: 48px !important; max-height: 96px !important; overflow-y: auto !important; resize: none !important; }
          .fc-input, .text-input, input[type="text"], textarea { line-height: 1.2 !important; }
          /* Normalización tipográfica dentro del chat para evitar cambios de tamaño por contenido */
          .fc-chat-window, .chat-window, .chatbot-container { font-size: 16px !important; }
          .user-message, .bot-message, .user-message *, .bot-message * { font-size: 16px !important; line-height: 1.55 !important; }
          .bot-message h1 { font-size: 20px !important; }
          .bot-message h2 { font-size: 18px !important; }
          .bot-message h3 { font-size: 17px !important; }
          .bot-message h4, .bot-message h5, .bot-message h6 { font-size: 16px !important; }
          .bot-message strong { font-weight: 700 !important; }
          .bot-message em { font-style: italic !important; }
          .bot-message code, .bot-message pre { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important; font-size: 14px !important; }
          .bot-message ul, .bot-message ol { padding-left: 1.25rem !important; }
        `,
        chatWindow: {
          showTitle: true,
          showAgentMessages: true,
          title: "VALKA Asistente",
          titleAvatarSrc: "",
          welcomeMessage: "",
          errorMessage: "Ocurrió un error. Intenta de nuevo.",
          backgroundColor: "transparent",
          height: "72vh",
          width: "100%",
          fontSize: 16,
          starterPrompts: [
            "Cómo empezar dominadas",
            "Rutina 3 días: fuerza + movilidad",
            "Progresión para primera bandera",
          ],
          starterPromptFontSize: 15,
          clearChatOnReload: true,
          sourceDocsTitle: "Fuentes:",
          renderHTML: true,
          botMessage: { backgroundColor: "rgba(17,24,39,.85)", textColor: "#F5F5F5", showAvatar: false, avatarSrc: "" },
          userMessage: { backgroundColor: "hsl(var(--primary))", textColor: "#111111", showAvatar: true, avatarSrc: "https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png" },
          textInput: {
            placeholder: "Escribí tu pregunta…",
            backgroundColor: "#111827",
            textColor: "#e6e6e6",
            sendButtonColor: "hsl(var(--primary))",
            maxChars: 300,
            maxCharsWarningMessage: "Superaste el límite de caracteres. Por favor, usá menos de 300.",
            autoFocus: true,
            sendMessageSound: false,
            receiveMessageSound: false,
          },
          feedback: { color: "#303235" },
          dateTimeToggle: { date: true, time: true },
          footer: { textColor: "#303235", text: "VALKA", company: "", companyLink: "https://entrenaconvalka.com" },
        },
      }}
    />
  );
};

export default FlowiseChat;
