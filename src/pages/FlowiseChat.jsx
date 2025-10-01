import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Maximize2 } from "lucide-react";
import { ValkaChatExperience } from "../components/chat";
import { useAuth } from "@/contexts/SupabaseAuthContext";

const STARTER_PROMPTS = [
  "Cómo empezar dominadas",
  "Rutina 3 días: fuerza + movilidad",
  "Progresión para primera bandera",
  "Plan para flexiones a pino",
];

const QUICK_ACTIONS = [
  {
    title: "Revisar programas activos",
    description: "Descubrí rutinas adaptadas a tu nivel y objetivo actual.",
    to: "/programs",
  },
  {
    title: "Biblioteca técnica",
    description: "Repasá la ejecución correcta de cada movimiento paso a paso.",
    to: "/library",
  },
  {
    title: "Actualizar tus objetivos",
    description: "Ajustá tu perfil para que el asistente entienda tus preferencias.",
    to: "/profile/edit",
  },
];

const TIPS = [
  "Contá con qué equipamiento contás para obtener progresiones realistas.",
  "Pedí ajustes en tus rutinas actuales si sentís que están muy fáciles o difíciles.",
  "Preguntá por progresiones paso a paso para dominar habilidades específicas.",
  "Solicitá recomendaciones de movilidad o activación para complementar tu sesión.",
];

const PrivacyNotice = ({ className = "" }) => (
  <div className={`rounded-2xl border px-4 py-3 text-xs leading-relaxed sm:text-sm ${className}`}>
    <span>
      Este chat sanitiza datos personales automáticamente. Podés usar la opción
      <span className="font-semibold"> "No publicar mi pregunta"</span> en tu primer mensaje.
    </span>
    <Link
      to="/politica-privacidad"
      className="ml-2 font-semibold text-amber-400 transition-colors hover:text-amber-300"
    >
      Política de Privacidad
    </Link>
  </div>
);

const PublicChatShell = () => {
  const navigate = useNavigate();

  return (
  <section
    className="relative flex h-screen flex-col overflow-hidden valka-animated-bg"
    style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0f0f0f 100%)" }}
  >
    <header className="flex-shrink-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4 md:px-6 lg:py-3">
        <Link
          to="/"
          className="font-logo text-xl tracking-wider text-white transition-colors hover:text-amber-400 sm:text-2xl"
        >
          VALKA
        </Link>
        <nav className="flex items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <Link
            to="/programs"
            className="rounded-lg border border-transparent px-2 py-1 text-white/80 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-3 sm:py-1.5"
          >
            Programas
          </Link>
          <Link
            to="/politica-privacidad"
            className="rounded-lg border border-transparent px-2 py-1 text-white/80 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-3 sm:py-1.5"
          >
            Privacidad
          </Link>
        </nav>
      </div>
    </header>

    <div className="mx-auto w-full max-w-7xl flex-shrink-0 px-3 pb-2 pt-3 sm:px-4 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <PrivacyNotice className="border-white/20 bg-black/40 text-white/70 backdrop-blur flex-1" />
        
        {/* Botón Modo Fullscreen */}
        <button
          onClick={() => navigate('/chat/fullscreen')}
          className="group flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/60 hover:bg-black/60 hover:shadow-lg hover:shadow-amber-400/20"
          title="Modo inmersivo"
        >
          <Maximize2 className="h-4 w-4 text-white/70 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-400" />
          <span className="hidden text-sm font-medium text-white/70 transition-colors duration-300 group-hover:text-white sm:inline">
            Pantalla completa
          </span>
        </button>
      </div>
    </div>

    <div className="flex flex-1 overflow-hidden px-3 pb-4 pt-2 sm:px-4 md:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col">
        <ValkaChatExperience showHeader={true} />
      </div>
    </div>
  </section>
  );
};

const AuthenticatedChatShell = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  // Obtener contexto del usuario si está disponible
  const userContext = session?.user ? {
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
    level: session.user.user_metadata?.level,
    goals: session.user.user_metadata?.goals
  } : undefined;

  return (
    <section className="h-full overflow-hidden px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6">
        <div className="flex-shrink-0 rounded-3xl border border-white/10 bg-gradient-to-br from-[#171720] via-[#101018] to-[#0d0d14] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400/80">
              Asistente inteligente
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Centro de ayuda VALKA</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
              Resolvé dudas sobre tu entrenamiento, pedí ajustes personalizados en rutinas y conseguí progresiones específicas en tiempo real.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <PrivacyNotice className="w-full border-white/15 bg-white/5 text-white/70 backdrop-blur-sm sm:max-w-xs" />
            
            {/* Botón Modo Fullscreen */}
            <button
              onClick={() => navigate('/chat/fullscreen')}
              className="group flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/60 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-400/20"
              title="Modo inmersivo"
            >
              <Maximize2 className="h-4 w-4 text-white/70 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-400" />
              <span className="text-sm font-medium text-white/70 transition-colors duration-300 group-hover:text-white">
                Pantalla completa
              </span>
            </button>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <span
              key={prompt}
              className="whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-wide text-white/70"
            >
              {prompt}
            </span>
          ))}
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden gap-6 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col overflow-hidden">
          <ValkaChatExperience 
            showHeader={true} 
            userContext={userContext}
          />
        </div>
        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Atajos rápidos</h2>
            <p className="mt-2 text-sm text-white/60">
              Abrí recursos clave mientras conversás con el asistente.
            </p>
            <div className="mt-4 space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-start justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-left transition-all hover:border-amber-400/60 hover:bg-white/[0.08]"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{action.title}</p>
                    <p className="mt-1 text-xs text-white/60">{action.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-amber-400 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white">Tips para sacarle provecho</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400/80" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
  );
};

const FlowiseChat = () => {
  const { session } = useAuth();

  return (
    <>
      <Helmet>
        <title>Chat Valka - Asistente Premium</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Asistente premium de Valka para dudas sobre calistenia y entrenamiento."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
      </Helmet>
      {session ? <AuthenticatedChatShell /> : <PublicChatShell />}
    </>
  );
};

export default FlowiseChat;
