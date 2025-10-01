# ✅ VALKA Chat AI - Sistema Completo Implementado

## 🎯 Resumen

Sistema de chat con IA implementado **SIN dependencias innecesarias**, conectado directamente a tu N8N webhook.

### ❌ Lo que NO necesitamos:
- `@anthropic-ai/sdk` (N8N maneja la llamada a Claude)
- `uuid` npm package (generamos UUID simple en cliente)
- API routes complejas con streaming
- Backend adicional

### ✅ Lo que SÍ usamos:
- `fetch` nativo del navegador
- Tu N8N webhook existente
- Tipos TypeScript para estructura
- Componente React simple y eficiente

---

## 🚀 Cómo probar

### 1. Accede al nuevo chat:

```
http://localhost:5174/chat-ai
```

O en producción:
```
https://tu-dominio.com/chat-ai
```

### 2. Verifica que funcione:

1. Abre la consola del navegador (F12)
2. Escribe un mensaje en el chat
3. Deberías ver en consola:
   ```
   [N8N] Enviando: { sessionId, message, history, user, meta }
   [N8N] Respuesta: { ... }
   ```

---

## 📤 Formato del Payload enviado a N8N

```json
{
  "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "message": "Quiero una rutina de dominadas",
  "history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "¿Cuál es tu objetivo?"}
  ],
  "user": {
    "id": "uuid-del-usuario",
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

---

## 📥 Formato de Respuesta esperado de N8N

Tu webhook de N8N debe retornar JSON con **al menos uno** de estos campos:

```json
{
  "output": "¡Perfecto! Para tu objetivo de dominadas te recomiendo...",
  "sessionId": "mismo-uuid-enviado",
  "timestamp": 1738282828000
}
```

El componente busca la respuesta en este orden:
1. `data.output` ✅ (recomendado)
2. `data.message`
3. `data.response`
4. `data.text`

---

## 🔧 Configurar N8N para que funcione

### En tu workflow de N8N:

1. **Webhook node** (ya lo tienes):
   - URL: `https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB`
   - Method: POST
   - Responde a Webhook: ✅ Activado

2. **AI Agent node** (ya lo tienes):
   - Modelo: OpenAI Chat Model
   - Memory: Simple Memory
   - Tool: Pinecone Vector Store

3. **Respond to Webhook node**:
   ```javascript
   {
     "output": "{{ $json.output }}",  // La respuesta del AI Agent
     "sessionId": "{{ $('Webhook').item.json.body.sessionId }}",
     "timestamp": {{ Date.now() }}
   }
   ```

---

## 🎨 Personalizar el System Prompt

El prompt del coach está en: `src/lib/constants.ts`

```typescript
export const VALKA_SYSTEM_PROMPT = `
Sos el coach de VALKA...
// Editar aquí tu prompt
`;
```

**Para que N8N use este prompt**, configúralo en tu AI Agent node:
- System Message: Pegar el contenido de `VALKA_SYSTEM_PROMPT`

O mejor aún, **envía el system prompt en el payload** y que N8N lo use:

En `src/lib/n8n.ts`, modifica `buildN8nPayload` para incluir:

```typescript
return {
  sessionId,
  message: lastUserMessage,
  history,
  user: userContext,
  systemPrompt: VALKA_SYSTEM_PROMPT, // 👈 Agregar esto
  meta: {
    source: 'web',
    version: API_VERSION,
    ts: Date.now(),
    client: userAgent,
  },
};
```

---

## 📍 Rutas disponibles

```
/chat            → Flowise chat (legacy)
/chat/fullscreen → Modo fullscreen (Flowise)
/chat-ai         → Nuevo chat con N8N ✨ (recomendado)
```

---

## 🧪 Testing

### Test manual:

```bash
curl -X POST https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hola, quiero entrenar",
    "history": [],
    "user": {
      "nombre": "Test",
      "nivel": "novato",
      "not_logged": true
    },
    "meta": {
      "source": "web",
      "version": "v1",
      "ts": 1738282828000
    }
  }'
```

Deberías recibir:
```json
{
  "output": "¡Hola! ¿Cuál es tu objetivo principal?",
  "sessionId": "test-123",
  "timestamp": 1738282828000
}
```

---

## 🐛 Troubleshooting

### "No recibo respuesta del chat"

1. Verifica en consola del navegador:
   ```
   [N8N] Enviando: {...}
   [N8N] Respuesta: {...}
   ```

2. Si ves error de CORS:
   - En N8N → Settings → Security
   - Allowed Origins: `*` o tu dominio específico

3. Si ves error 404:
   - Verifica que la URL del webhook sea exacta
   - En `src/lib/n8n.ts` línea 8

### "El chat muestra 'Respuesta recibida' en vez del mensaje"

Tu N8N está retornando un formato diferente. Verifica en consola qué estructura tiene `data` y ajusta en:

`src/components/ValkaChatSimple.tsx` línea ~110:

```typescript
const assistantContent =
  data.TU_CAMPO_AQUI ||  // 👈 Cambia según tu respuesta
  data.output ||
  data.message ||
  'Respuesta recibida';
```

### "No se guarda el histórico"

localStorage está activado por defecto. Verifica:
1. Navegador no está en modo incógnito
2. Permisos de localStorage habilitados
3. Clave: `valka-chat-{sessionId}`

---

## 🚀 Próximos pasos (opcional)

1. **Streaming**: Si N8N soporta SSE, implementar streaming palabra por palabra
2. **Comandos**: `/plan 3d`, `/sesion`, `/progreso`, `/deload`
3. **Onboarding**: Si `user.not_logged`, hacer 3 preguntas (objetivo, nivel, días)
4. **Guardar en Supabase**: Histórico de conversaciones por usuario
5. **Rate limiting**: Limitar mensajes por minuto
6. **Typing indicator**: Mostrar "Coach está escribiendo..."

---

## 📦 Archivos creados

```
src/
├── components/
│   └── ValkaChatSimple.tsx      # 380 líneas - Chat completo
├── pages/
│   └── ChatAI.jsx                # Página del chat
├── lib/
│   ├── types.ts                  # Tipos TypeScript
│   ├── constants.ts              # VALKA_SYSTEM_PROMPT
│   └── n8n.ts                    # Cliente N8N
└── App.jsx                       # Rutas actualizadas

Docs/
├── VALKA_CHAT_IMPLEMENTACION.md  # Este archivo
└── VALKA_AI_CHAT_README.md       # README anterior (legacy)
```

---

## ✅ Checklist final

- [x] Dependencias innecesarias eliminadas
- [x] Componente ValkaChatSimple creado
- [x] Página ChatAI creada
- [x] Rutas agregadas en App.jsx
- [x] Payload N8N estructurado
- [x] localStorage para persistencia
- [x] UI responsive mobile-first
- [x] Copy, reset, stats incluidos
- [x] Documentación completa

---

**¡Todo listo para usar! 🎉**

Accede a `/chat-ai` y empieza a chatear con tu coach VALKA.
