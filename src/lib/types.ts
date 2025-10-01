// ============================================================================
// VALKA AI Chat - Tipos TypeScript
// ============================================================================

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: number;
  streaming?: boolean;
}

export type UserLevel = 'novato' | 'intermedio' | 'avanzado';

export interface UserContext {
  id?: string;
  nombre?: string;
  nivel?: UserLevel;
  objetivo?: string;
  restricciones?: Record<string, any>;
  equipment?: string[];
  time_per_session_min?: number;
  not_logged?: boolean;
}

export interface N8nWebhookPayload {
  sessionId: string;
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  user: UserContext;
  meta: {
    source: 'web';
    version: 'v1';
    ts: number;
    client?: string;
  };
}

export interface N8nOptionalReply {
  message?: string;
  toolCalls?: Array<{
    tool: string;
    args: Record<string, any>;
    status?: 'ok' | 'error';
  }>;
  rag?: Array<{ title: string; url?: string }>;
  meta?: { latency_ms?: number };
}

export interface ChatApiRequest {
  sessionId: string;
  messages: ChatMessage[];
  user_context?: UserContext;
}

export interface StreamStats {
  tokens: number;
  latency_ms: number;
  ttfb_ms?: number;
}
