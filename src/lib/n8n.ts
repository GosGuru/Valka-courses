// ============================================================================
// VALKA AI Chat - Cliente N8N Webhook (sin SDK, solo fetch)
// ============================================================================

import { N8nWebhookPayload, N8nOptionalReply } from './types';
import { API_VERSION } from './constants';

const N8N_WEBHOOK_URL = 'https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB';
const N8N_TIMEOUT_MS = 30000; // 30 segundos para AI Agent

/**
 * Envía el payload del chat a N8N para procesamiento side-effects
 * (crear programa, loggear en Supabase, buscar en Pinecone, etc.)
 * 
 * Fire-and-forget: no bloquea el streaming del chat
 */
export async function postToN8n(
  payload: N8nWebhookPayload
): Promise<N8nOptionalReply | null> {
  try {
    console.log('[N8N] Enviando webhook:', {
      sessionId: payload.sessionId,
      message: payload.message.substring(0, 50) + '...',
      user: payload.user.nombre || 'anónimo',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT_MS);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[N8N] Webhook respondió con error:', response.status);
      return null;
    }

    // Verificar contenido antes de parsear JSON
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      console.warn('[N8N] Respuesta vacía del servidor');
      return null;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('[N8N] Respuesta recibida:', data);
      return data as N8nOptionalReply;
    } catch (parseError) {
      console.error('[N8N] Error parsing JSON:', responseText.substring(0, 200));
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[N8N] Timeout después de', N8N_TIMEOUT_MS, 'ms');
      } else {
        console.error('[N8N] Error al enviar webhook:', error.message);
      }
    }
    // No lanzar error: fire-and-forget
    return null;
  }
}

/**
 * Construye el payload canónico para N8N
 */
export function buildN8nPayload(
  sessionId: string,
  lastUserMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userContext: N8nWebhookPayload['user'],
  userAgent?: string
): N8nWebhookPayload {
  return {
    sessionId,
    message: lastUserMessage,
    history,
    user: userContext,
    meta: {
      source: 'web',
      version: API_VERSION,
      ts: Date.now(),
      client: userAgent,
    },
  };
}
