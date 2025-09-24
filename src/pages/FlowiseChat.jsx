import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";

// Página de chat con header y fondo dinámico
const FlowiseChat = () => {
  return (
    <>
      <Helmet>
        <title>Chat Valka</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Asistente de Valka para dudas rápidas sobre calistenia." />
      </Helmet>

      <section className="relative flex flex-col min-h-screen valka-animated-bg" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0f0f0f 100%)" }}>
        {/* Header superior */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="flex items-center justify-between w-full max-w-7xl px-3 py-2.5 mx-auto sm:px-4 md:px-6 lg:py-3">
            <Link to="/" className="text-xl tracking-wider text-white transition-colors sm:text-2xl font-logo hover:text-amber-400">VALKA</Link>
            <nav className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
              <Link to="/programs" className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200">Programas</Link>
              <a href="/politica-privacidad" className="rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200">Privacidad</a>
            </nav>
          </div>
        </header>

        {/* Aviso de privacidad breve */}
        <div className="flex-shrink-0 w-full mx-auto max-w-7xl">
          <div className="px-3 pt-3 pb-2 text-xs leading-relaxed sm:px-4 md:px-6 sm:text-sm text-white/60">
            Este chat sanitiza datos personales automáticamente. Podés usar la opción "No publicar mi pregunta" en tu primer mensaje.
            <a href="/politica-privacidad" className="ml-2 underline transition-colors text-amber-400 hover:text-amber-300">Política de Privacidad</a>
          </div>
        </div>

        {/* Contenedor principal con altura fija */}
        <div className="flex items-center justify-center flex-1 px-3 py-4 sm:px-4 md:px-6 lg:px-8">
          <div className="w-full max-w-5xl h-[80vh]">
            <ChatWidget />
          </div>
        </div>
      </section>
    </>
  );
};

export default FlowiseChat;
