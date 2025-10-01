# ✅ VALKA Chat - Migración de Flowise a N8N Completada

## 🎯 Resumen de cambios

Hemos migrado **exitosamente** el sistema de chat de Flowise a N8N, manteniendo la UI existente y mejorando el backend.

---

## 📦 Cambios realizados

### 1. **Hook `useChat.ts` actualizado**

**Antes (Flowise):**
```typescript
import { sendMessageToFlowise } from '../../../lib/flowise';
const response = await sendMessageToFlowise({ message, history });
```

**Ahora (N8N):**
```typescript
import { buildN8nPayload } from '../../../lib/n8n';

// Genera UUID simple sin dependencias
const generateUUID = () => { ... };

// POST directo al webhook de N8N
const response = await fetch(
  'https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }
);
```

### 2. **UserContext actualizado**

**Antes:**
```typescript
userContext?: {
  name?: string;
  level?: string;
  goals?: string[];  // Array
}
```

**Ahora (compatible con N8N):**
```typescript
userContext?: {
  id?: string;
  name?: string;
  level?: string;
  goals?: string;    // String
  equipment?: string[];
  time_per_session_min?: number;
  not_logged?: boolean;
}
```

### 3. **Archivos modificados:**

```
✅ src/components/chat/hooks/useChat.ts
   - Cambiado de Flowise a N8N
   - Agregado generateUUID()
   - Agregado buildN8nPayload()
   - Logs de debug

✅ src/components/chat/ValkaChatExperience.tsx
   - Interface userContext actualizada

✅ src/pages/FlowiseChatPremium.jsx
   - userContext con campos de N8N

✅ src/pages/FullscreenChat.jsx
   - userContext con campos de N8N

✅ src/App.jsx
   - Removidas rutas de ChatAI

❌ Eliminados:
   - src/pages/ChatAI.jsx
   - src/components/ValkaChatSimple.tsx
```

---

## 🚀 Cómo funciona ahora

### Flujo completo:

```
1. Usuario escribe mensaje en /chat
    ↓
2. useChat.ts construye payload con buildN8nPayload()
    ↓
3. POST a https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB
    ↓
4. N8N AI Agent procesa (OpenAI + Memory + Pinecone)
    ↓
5. N8N retorna respuesta
    ↓
6. useChat.ts extrae data.output y muestra en UI
```

---

## 📤 Payload enviado a N8N

```json
{
  "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "message": "Quiero entrenar dominadas",
  "history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "¿Cuál es tu objetivo?"}
  ],
  "user": {
    "id": "uuid-usuario",
    "name": "Maxi",
    "level": "intermedio",
    "goals": "fuerza + dominadas",
    "equipment": ["barra", "anillas"],
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

## 📥 Respuesta esperada de N8N

Tu **Respond to Webhook** node debe retornar:

```json
{
  "output": "¡Perfecto! Para entrenar dominadas te recomiendo...",
  "sessionId": "mismo-uuid",
  "timestamp": 1738282828000
}
```

El hook busca la respuesta en este orden:
1. `data.output` ✅ (recomendado)
2. `data.message`
3. `data.response`
4. `data.text`

---

## 🎨 UI sin cambios

La interfaz de usuario **permanece idéntica**:

- ✅ Mismo diseño premium
- ✅ Mismos componentes (MessageBubble, StarterChips, etc.)
- ✅ Mismas animaciones
- ✅ Mismo comportamiento de scroll
- ✅ Mismos estilos CSS

**Solo cambió el backend de Flowise → N8N**

---

## 🔍 Debug y logs

En la consola del navegador verás:

```javascript
[N8N] Enviando: {
  sessionId: "...",
  message: "...",
  history: [...],
  user: {...},
  meta: {...}
}

[N8N] Respuesta: {
  output: "...",
  sessionId: "...",
  timestamp: 1738282828000
}
```

---

## 🧪 Testing

### 1. Prueba desde el navegador:

```
http://localhost:5174/chat
```

1. Escribe un mensaje
2. Abre DevTools (F12)
3. Ve a Console
4. Verifica los logs `[N8N] Enviando:` y `[N8N] Respuesta:`

### 2. Prueba con curl:

```bash
curl -X POST https://n8n-n8n.ua4qkv.easypanel.host/webhook/messageWEB \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Quiero entrenar",
    "history": [],
    "user": {"name": "Test", "level": "novato", "not_logged": true},
    "meta": {"source": "web", "version": "v1", "ts": 1738282828000}
  }'
```

---

## ⚙️ Configuración de N8N

Tu workflow debe tener esta estructura:

```
Webhook (POST)
    ↓
AI Agent (OpenAI Chat Model + Memory + Pinecone)
    ↓
Respond to Webhook
```

### En el node "Respond to Webhook":

```javascript
{
  "output": "{{ $json.output }}",  // Respuesta del AI Agent
  "sessionId": "{{ $('Webhook').item.json.body.sessionId }}",
  "timestamp": {{ Date.now() }}
}
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/n8n'"

Verifica que exista: `src/lib/n8n.ts`

### Error: "Cannot find module '@/lib/types'"

Verifica que exista: `src/lib/types.ts`

### No recibo respuesta del chat

1. Verifica URL del webhook en `useChat.ts` línea ~95
2. Verifica que N8N esté activo
3. Verifica formato de respuesta de N8N

### Respuesta muestra "undefined" o vacía

El formato de respuesta de N8N no coincide. Ajusta en `useChat.ts`:

```typescript
const reply = 
  data?.TU_CAMPO_AQUI ||  // 👈 Cambia según tu N8N
  data?.output ||
  data?.message ||
  'Error en respuesta';
```

---

## 📊 Beneficios de N8N vs Flowise

| Característica | Flowise | N8N |
|---------------|---------|-----|
| **Memoria persistente** | ⚠️ Limitada | ✅ Supabase + Memory |
| **RAG (Pinecone)** | ⚠️ Básico | ✅ Completo |
| **Logs de conversación** | ❌ | ✅ Supabase |
| **Webhooks flexibles** | ⚠️ | ✅ Total control |
| **Múltiples modelos** | ⚠️ | ✅ OpenAI, Claude, etc. |
| **Costo** | 💰 | 💰 (más predecible) |

---

## 🚀 Próximos pasos (opcional)

1. **Streaming SSE**: Si N8N lo soporta, implementar respuesta palabra por palabra
2. **Comandos**: `/plan`, `/sesion`, `/progreso`
3. **Onboarding**: Si `not_logged: true`, hacer preguntas
4. **Analytics**: Trackear sesiones en Supabase
5. **Rate limiting**: Proteger el webhook

---

## ✅ Checklist de migración

- [x] useChat.ts migrado a N8N
- [x] UserContext actualizado
- [x] FlowiseChatPremium.jsx actualizado
- [x] FullscreenChat.jsx actualizado
- [x] Archivos innecesarios eliminados
- [x] UUID generado sin dependencias
- [x] Logs de debug agregados
- [x] Documentación completa

---

**🎉 Migración completada exitosamente**

El chat ahora usa N8N con la misma UI premium de siempre.

Accede a `/chat` y empieza a chatear con el nuevo backend.
