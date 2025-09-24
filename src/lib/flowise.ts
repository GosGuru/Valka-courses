/// <reference types="vite/client" />
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const FLOWISE_BASE_URL = import.meta.env.VITE_FLOWISE_BASE_URL as string | undefined || 'https://cloud.flowiseai.com';
const FLOWISE_CHATFLOW_ID = import.meta.env.VITE_FLOWISE_CHATFLOW_ID as string | undefined || 'e7d9faeb-a60d-41aa-a12c-1028daba491a';
const FLOWISE_API_KEY = import.meta.env.VITE_FLOWISE_API_KEY as string | undefined || 'QCeH1c7cuYu1vKHdtvsWsHEdH7kvpMjZIIw9Iqb4YmE';
const VITE_USE_PROXY = (import.meta.env.VITE_USE_PROXY as string | undefined)?.toLowerCase() === 'true';

function getRestEndpoint() {
  if (VITE_USE_PROXY) return '/api/chat/flowise';
  // Usar valores hardcodeados si no están en el entorno
  const flowiseUrl = FLOWISE_BASE_URL || 'https://cloud.flowiseai.com';
  const chatflowId = FLOWISE_CHATFLOW_ID || 'e7d9faeb-a60d-41aa-a12c-1028daba491a';
  return `${flowiseUrl.replace(/\/$/, '')}/api/v1/prediction/${chatflowId}`;
}

export async function sendMessageToFlowise({
  message,
  history = [],
}: {
  message: string;
  history?: ChatMessage[];
}) {
  const endpoint = getRestEndpoint();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!VITE_USE_PROXY && FLOWISE_API_KEY) headers.Authorization = `Bearer ${FLOWISE_API_KEY}`;

  const body = JSON.stringify({ question: message, history });
  const res = await fetch(endpoint, { method: 'POST', headers, body });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Flowise HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  const txt = await res.text();
  return { text: txt };
}

// Opcional: streaming SSE si tu Flowise lo soporta
export async function sendMessageToFlowiseStream({
  message,
  history = [],
  onToken,
  signal,
}: {
  message: string;
  history?: ChatMessage[];
  onToken: (chunk: string) => void;
  signal?: AbortSignal;
}) {
  let endpoint: string;
  if (VITE_USE_PROXY) {
    endpoint = `/api/chat/flowise?stream=1`;
  } else {
    if (!FLOWISE_BASE_URL || !FLOWISE_CHATFLOW_ID) {
      throw new Error('Faltan FLOWISE_BASE_URL o FLOWISE_CHATFLOW_ID en el entorno');
    }
    endpoint = `${FLOWISE_BASE_URL.replace(/\/$/, '')}/api/v1/prediction/${FLOWISE_CHATFLOW_ID}`;
  }
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Cache-Control': 'no-cache'
  };
  if (!VITE_USE_PROXY && FLOWISE_API_KEY) headers.Authorization = `Bearer ${FLOWISE_API_KEY}`;

  const body = JSON.stringify({ 
    question: message, 
    history,
    streaming: true
  });

  const res = await fetch(endpoint, { method: 'POST', headers, body, signal });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Flowise stream HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        // Manejar formato específico de Flowise: message:data:{...}
        if (trimmed.startsWith('message:data:')) {
          try {
            const jsonStr = trimmed.slice(13); // Remove 'message:data:'
            const parsed = JSON.parse(jsonStr);
            
            // Procesar solo tokens con contenido
            if (parsed.event === 'token' && parsed.data && typeof parsed.data === 'string') {
              onToken(parsed.data);
            }
          } catch (e) {
            // Si falla, intentar formato SSE estándar
            if (trimmed.startsWith('data: ')) {
              try {
                const jsonStr = trimmed.slice(6);
                const parsed = JSON.parse(jsonStr);
                
                if (parsed.event === 'token' && parsed.data && typeof parsed.data === 'string') {
                  onToken(parsed.data);
                }
              } catch (e2) {
                // Fallback: texto plano
                const token = trimmed.slice(6);
                if (token.length > 0) {
                  onToken(token);
                }
              }
            }
          }
        } 
        // Formato SSE estándar
        else if (trimmed.startsWith('data: ')) {
          if (trimmed === 'data: [DONE]') continue;
          
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.event === 'token' && parsed.data && typeof parsed.data === 'string') {
              onToken(parsed.data);
            } else {
              // Fallback para otros formatos
              const token = parsed.token || parsed.chunk || parsed.content || parsed.text || parsed;
              if (typeof token === 'string' && token.length > 0) {
                onToken(token);
              }
            }
          } catch (e) {
            // Texto plano
            const token = trimmed.slice(6);
            if (token.length > 0) {
              onToken(token);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
