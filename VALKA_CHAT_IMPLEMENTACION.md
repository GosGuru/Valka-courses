# 🚀 VALKA Chat - Implementación Simple con N8N

## ✅ Arquitectura Final (sin SDK innecesarios)

```
Frontend React (ValkaChatSimple.tsx)
    ↓
    POST fetch directo
    ↓
N8N Webhook: https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB
    ↓
    AI Agent (OpenAI + Memory + Pinecone RAG)
    ↓
    Respond to Webhook (retorna respuesta)
    ↓
Frontend renderiza respuesta
```

## 📦 Archivos creados

```
src/
├── components/
│   └── ValkaChatSimple.tsx      # Chat sin dependencias extras
├── lib/
│   ├── types.ts                 # Tipos del payload
│   ├── constants.ts             # VALKA_SYSTEM_PROMPT + config
│   └── n8n.ts                   # Helper para construir payload
```

## 🔧 Cómo usar

### 1. En cualquier página:

```tsx
import { ValkaChatSimple } from '@/components/ValkaChatSimple';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ChatPage() {
  const { session } = useAuth();

  const userContext = session?.user ? {
    id: session.user.id,
    nombre: session.user.user_metadata?.name || session.user.email?.split('@')[0],
    nivel: session.user.user_metadata?.level,
    objetivo: session.user.user_metadata?.goals,
  } : {
    not_logged: true
  };

  return (
    <div className="h-screen">
      <ValkaChatSimple userContext={userContext} />
    </div>
  );
}
```

### 2. En modo fullscreen:

En `src/pages/FullscreenChat.jsx`, reemplaza el chat actual:

```tsx
import { ValkaChatSimple } from '@/components/ValkaChatSimple';

// ... dentro del componente
<ValkaChatSimple userContext={userContext} />
```

## 📤 Payload que se envía a N8N

```json
{
  "sessionId": "uuid-v4",
  "message": "Quiero una rutina de 30 minutos",
  "history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "¿Cuál es tu objetivo?"}
  ],
  "user": {
    "id": "uuid-usuario",
    "nombre": "Maxi",
    "nivel": "intermedio",
    "objetivo": "fuerza + dominadas",
    "equipment": ["barra"],
    "time_per_session_min": 30,
    "not_logged": false
  },
  "meta": {
    "source": "web",
    "version": "v1",
    "ts": 1738282828000,
    "client": "Mozilla/5.0..."
  }
}
```

## 📥 Respuesta esperada de N8N

Tu N8N debe retornar JSON con la respuesta del AI Agent. El componente busca en este orden:

1. `data.output`
2. `data.message`
3. `data.response`
4. `data.text`

Ejemplo de respuesta esperada:

```json
{
  "output": "¡Perfecto! Para tu objetivo de fuerza y dominadas, te recomiendo...",
  "sessionId": "uuid-v4",
  "timestamp": 1738282828000
}
```

## 🎨 Features incluidas

✅ **Sin dependencias extras** (no @anthropic-ai/sdk, no uuid pesado)
✅ **UUID generado en el cliente** (función simple)
✅ **localStorage automático** (histórico persistente)
✅ **Indicador de carga** (puntos animados)
✅ **Copy to clipboard**
✅ **Reset conversación**
✅ **Stats de latencia y tokens estimados**
✅ **Responsive mobile-first**
✅ **Auto-scroll**
✅ **Enter para enviar, Shift+Enter para nueva línea**

## 🔍 Debugging

### Ver payload en consola:

```js
console.log('[N8N] Enviando:', payload);
console.log('[N8N] Respuesta:', data);
```

### Probar webhook con curl:

```bash
curl -X POST https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hola",
    "history": [],
    "user": {"not_logged": true},
    "meta": {"source": "web", "version": "v1", "ts": 1738282828000}
  }'
```

## 🚀 Próximos pasos

1. **Ajustar el formato de respuesta** según lo que retorne tu N8N
2. **Agregar streaming** si N8N lo soporta (SSE)
3. **Implementar onboarding** si `user.not_logged === true`
4. **Agregar comandos** como `/plan 3d`, `/sesion`, `/progreso`

## 🎯 VALKA System Prompt

El prompt está en `src/lib/constants.ts` → `VALKA_SYSTEM_PROMPT`

Configúralo en tu AI Agent de N8N para que el coach hable como querés.

---

**Todo listo sin dependencias innecesarias** 🎉
