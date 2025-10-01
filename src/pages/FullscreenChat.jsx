import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ValkaChatExperience } from '../components/chat';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';

const FullscreenChat = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  // Obtener contexto del usuario para N8N
  const userContext = session?.user ? {
    id: session.user.id,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
    level: session.user.user_metadata?.level || 'novato',
    goals: session.user.user_metadata?.goals,
    equipment: session.user.user_metadata?.equipment || [],
    time_per_session_min: session.user.user_metadata?.time_per_session || 30,
    not_logged: false
  } : {
    not_logged: true
  };

  return (
    <>
      <Helmet>
        <title>Chat VALKA - Modo Inmersivo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0a0a" />
      </Helmet>
      
      <div 
        className="relative flex h-screen w-screen flex-col overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0f0f0f 100%)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)'
        }}
      >
        {/* Botón de volver - Minimalista, solo icono */}
        <button
          onClick={() => navigate(-1)}
          className="group absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-black/30 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-black/50 hover:scale-110"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-white/60 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-amber-400" />
        </button>

        {/* Badge VALKA - Solo visible en desktop (hidden sm:flex) */}
        <div className="absolute right-4 top-4 z-30 hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="font-logo text-sm tracking-wider text-white">VALKA</span>
        </div>

        {/* Chat fullscreen - Sin padding en mobile, con padding en desktop */}
        <div className="flex h-full w-full flex-col overflow-hidden p-0 sm:p-6">
          <div className="mx-auto h-full w-full max-w-5xl">
            <ValkaChatExperience 
              showHeader={false}
              showFullscreenButton={false}
              userContext={userContext}
            />
          </div>
        </div>

        {/* Indicador visual inferior - Solo visible en desktop (hidden sm:block) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent hidden sm:block" />
      </div>
    </>
  );
};

export default FullscreenChat;
