import React from 'react';
import type { ChatMessage } from '../lib/flowise';
import { sendMessageToFlowise, sendMessageToFlowiseStream } from '../lib/flowise';

export default function ChatWidget() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const controllerRef = React.useRef<AbortController | null>(null);
  const starterPrompts = React.useMemo(() => [
    'Cómo empezar dominadas',
    'Rutina 3 días: fuerza + movilidad',
    'Progresión para primera bandera',
    'Plan para flexiones a pino',
  ], []);
  const enableStream = true;

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // Intentar sin streaming primero (más confiable)
      const res = await sendMessageToFlowise({ message: text, history: [...messages, userMsg] });
      const reply = (res as any)?.text ?? (res as any)?.answer ?? (res as any)?.message ?? (typeof res === 'string' ? res : JSON.stringify(res));
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply || 'Sin respuesta' };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setError(e?.message || 'Error contactando a Flowise');
      // Remover mensaje de usuario si falló completamente
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  React.useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#0b0f1a] via-[#0d1117] to-[#111827] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden backdrop-blur-sm" role="region" aria-label="Chat con asistente de Valka">
      {/* Área de mensajes con scroll */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto bg-transparent sm:px-4 sm:py-4 lg:px-6 lg:py-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-6 text-lg font-medium sm:text-xl text-white/90">Empezá una conversación o elegí un tema:</div>
            <div className="flex flex-wrap justify-center max-w-2xl gap-3 sm:gap-4">
              {starterPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSend(p)}
                  disabled={loading}
                  className="whitespace-nowrap rounded-full border border-white/15 bg-gradient-to-r from-[#1a1f36] to-[#1e2347] px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base text-slate-200 hover:bg-gradient-to-r hover:from-[#1e2347] hover:to-[#252b4a] hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-50 transition-all duration-200"
                  aria-label={`Usar prompt: ${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex mb-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] sm:max-w-[70%] px-4 py-3 shadow-lg transition-all duration-200 ${
              m.role === 'user' 
                ? 'bg-[#2a2a2a] text-white rounded-2xl rounded-br-md border border-white/10 hover:bg-[#333333]' 
                : 'bg-[#1a1a1a] text-slate-100 rounded-2xl rounded-bl-md border border-white/5 hover:bg-[#1f1f1f]'
            }`}>
              <MessageText content={m.content || 'Mensaje vacío'} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[75%] sm:max-w-[70%] bg-[#1a1a1a] rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-white/5">
              <div className="flex items-start gap-3 text-slate-200">
                <Spinner />
                <div>
                  <div className="text-sm font-medium tracking-tight sm:text-base text-white/90">Generando respuesta...</div>
                  <div className="mt-1 text-xs sm:text-sm text-white/60">Procesando tu pregunta</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      
      {/* Input container siempre abajo */}
      <div className="px-3 py-3 border-t border-white/15 bg-gradient-to-b from-transparent via-black/30 to-black/60 backdrop-blur-md sm:px-4 sm:py-4 lg:px-6">
        {error && (
          <div className="mb-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm sm:text-base px-3 py-2.5 sm:px-4 sm:py-3 animate-in slide-in-from-bottom-2 duration-300">
            {error}
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Escribí tu pregunta…" 
            className="flex-1 min-h-[52px] max-h-[120px] sm:min-h-[56px] sm:max-h-[140px] resize-none overflow-y-auto rounded-2xl bg-slate-800/95 text-slate-100 placeholder:text-slate-400 border border-slate-600/50 px-4 py-3 sm:px-5 sm:py-4 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400/50 focus:bg-slate-700/95 transition-all duration-200 hover:border-slate-500/70 hover:bg-slate-700/90" 
          />
          <button 
            onClick={() => handleSend()} 
            disabled={loading || !input.trim()} 
            className="inline-flex h-[52px] min-w-[90px] sm:h-[56px] sm:min-w-[110px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 sm:px-7 text-sm sm:text-base font-semibold text-gray-900 transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2 animate-pulse">
                <Spinner small />
                <span className="hidden sm:inline">Enviando…</span>
              </div>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageText({ content }: { content: string }) {
  return (
    <div className="leading-relaxed prose-sm prose prose-invert sm:prose-base max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
    </div>
  );
}

function Spinner({ small = false }: { small?: boolean }) {
  const size = small ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6';
  return (
    <svg className={`animate-spin ${size} text-amber-400/90`} viewBox="0 0 24 24" fill="none" aria-hidden="true" role="progressbar">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
