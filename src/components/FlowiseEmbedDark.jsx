import React from "react";

// Carga dinámica para evitar peso inicial y problemas SSR
export default function FlowiseEmbedDark({
  chatflowid,
  apiHost,
}) {
  const [Comp, setComp] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("flowise-embed-react");
      if (mounted) setComp(() => mod.FullPageChat);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Comp) return <div className="p-6 text-center text-muted-foreground">Cargando chat…</div>;

  return (
    <Comp
      chatflowid={chatflowid}
      apiHost={apiHost}
      theme={{
        button: {
          autoWindowOpen: { autoOpen: false, openDelay: 0, autoOpenOnMobile: false },
        },
        tooltip: { showTooltip: false },
        disclaimer: { title: "", message: "", buttonText: "" },
        // Tono oscuro inspirado en el SDK de referencia
        chatWindow: {
          showTitle: false,
          showAgentMessages: true,
          title: "",
          titleAvatarSrc: "",
          welcomeMessage: "",
          errorMessage: "Ocurrió un error. Intenta de nuevo.",
          backgroundColor: "#0b0f1a",
          height: "72vh",
          width: "100%",
          fontSize: 16,
          clearChatOnReload: true,
          renderHTML: true,
          botMessage: { backgroundColor: "#0f172a", textColor: "#E5E7EB", showAvatar: false, avatarSrc: "" },
          userMessage: { backgroundColor: "#111827", textColor: "#E5E7EB", showAvatar: false, avatarSrc: "" },
          textInput: {
            placeholder: "Escribí tu pregunta…",
            backgroundColor: "#0a0f18",
            textColor: "#E5E7EB",
            sendButtonColor: "#E5E7EB",
            maxChars: 500,
            autoFocus: true,
            sendMessageSound: false,
            receiveMessageSound: false,
          },
          footer: { textColor: "#6b7280", text: "", company: "", companyLink: "" },
        },
        // Ajustes finos de estilo para mayor contraste y minimalismo
        customCSS: `
          .fc-chat-window, .chat-window {
            border-radius: 14px !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            background: #0b0f1a !important;
            box-shadow: 0 10px 30px rgba(0,0,0,.45) !important;
          }
          .fc-header, .chat-header { display: none !important; }
          .fc-body, .chat-body {
            background: transparent !important;
            padding: 16px !important;
          }
          .fc-footer, .chat-footer {
            background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 60%, rgba(0,0,0,.55) 100%) !important;
            border-top: 1px solid rgba(255,255,255,0.08) !important;
            padding: 12px !important;
          }
          .fc-input, .text-input, textarea, input[type="text"] {
            border-radius: 12px !important;
            background: #0a0f18 !important;
            color: #E5E7EB !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
          }
          .fc-input::placeholder, .text-input::placeholder { color: #9CA3AF !important; }
          .user-message { background: #111827 !important; color: #E5E7EB !important; }
          .bot-message { background: #0f172a !important; color: #E5E7EB !important; }
          .user-message, .bot-message {
            border-radius: 12px !important;
          }
          .fc-send-button, .send-button { color: #E5E7EB !important; }
        `,
      }}
    />
  );
}
