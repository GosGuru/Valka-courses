# 🚀 VALKA AI Chat - Sistema de Streaming con Anthropic + N8N

## 📦 Estructura de archivos

```
src/
├── lib/
│   ├── types.ts                 # Tipos TypeScript
│   ├── constants.ts             # VALKA_SYSTEM_PROMPT + config
│   ├── n8n.ts                   # Cliente webhook N8N
│   └── anthropic-stream.ts      # Cliente Anthropic streaming
├── components/
│   └── ValkaChat.tsx            # UI chat con streaming palabra a palabra
├── api/
│   └── valka-chat.ts            # API route SSE streaming
└── pages/
    └── (tu página que usa <ValkaChat />)

.env.example                     # Variables de entorno
```

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install @anthropic-ai/sdk uuid
npm install -D @types/uuid
```

O con bun:

```bash
bun add @anthropic-ai/sdk uuid
bun add -D @types/uuid
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Editar `.env.local` y agregar tu API key de Anthropic:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
VITE_N8N_WEBHOOK_URL=https://n8n-n8n.ua4qkv.easypanel.host/webhook-test/messageWEB
```

### 3. Configurar API route

Si usás **Vite** (como tu proyecto actual), necesitás configurar el proxy para `/api/*`:

En `vite.config.js`:

```js
export default defineConfig({
  // ... tu config existente
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Manejar la API route
            if (req.url.startsWith('/api/valka-chat')) {
              // Tu lógica de API aquí
            }
          });
        },
      },
    },
  },
});
```

**ALTERNATIVA RECOMENDADA**: Si no querés configurar proxy, podés crear un pequeño servidor Express/Fastify que maneje solo `/api/valka-chat` y hacer que Vite lo llame.

O más simple: **Convertir a Next.js** que tiene API routes nativas.

### 4. Usar el componente

En cualquier página (ej: `src/pages/ChatPage.jsx`):

```tsx
import { ValkaChat } from '@/components/ValkaChat';
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
      <ValkaChat userContext={userContext} />
    </div>
  );
}
```

## 🎯 Flujo de funcionamiento

1. **Usuario envía mensaje** → `ValkaChat.tsx`
2. **POST a `/api/valka-chat`** con `{ sessionId, messages, user_context }`
3. **API route**:
   - Dispara webhook a N8N (fire-and-forget)
   - Llama a Anthropic Messages API con streaming
   - Retorna SSE stream con tokens
4. **Frontend recibe tokens** y los renderiza en tiempo real
5. **N8N procesa** (crear programa, loggear en Supabase, RAG en Pinecone)
6. **Si N8N responde**, se muestra "Acciones del Coach"

## 📊 Payload a N8N

```json
{
  "sessionId": "uuid-v4",
  "message": "último mensaje del usuario",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "user": {
    "id": "uuid-si-está-logueado",
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

## 🔥 Comandos especiales

El chat soporta comandos:

- `/plan 3d` → Generar programa de 3 días
- `/sesion` → Sugerir sesión para hoy
- `/progreso` → Revisar avances
- `/deload` → Explicar semana de descarga
- `/reset` → Reiniciar conversación

## 🎨 Personalización

### Modificar el prompt del coach

Editar `src/lib/constants.ts` → `VALKA_SYSTEM_PROMPT`

### Cambiar modelo de Anthropic

En `src/lib/constants.ts`:

```ts
export const MODEL_NAME = 'claude-3-5-sonnet-20241022'; // o claude-opus-4, etc.
```

### Ajustar tokens máximos

```ts
export const MAX_TOKENS = 2048; // aumentar para respuestas más largas
```

## 🐛 Troubleshooting

### Error: "ANTHROPIC_API_KEY no definida"

Verificar que `.env.local` tenga la key y que empiece con `VITE_`:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Streaming no funciona

1. Verificar que el API route retorne `Content-Type: text/event-stream`
2. Verificar que el navegador soporte SSE
3. Revisar consola del servidor para errores de Anthropic

### N8N no recibe datos

1. Verificar URL del webhook en `.env.local`
2. Revisar logs del servidor: `console.log('[N8N] Enviando webhook...')`
3. Probar el webhook con curl:

```bash
curl -X POST https://n8n-n8n.ua4qkv.easypanel.host/webhook-test/messageWEB \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","message":"hola","history":[],"user":{"not_logged":true},"meta":{"source":"web","version":"v1","ts":1234567890}}'
```

## 📈 Próximos pasos

- [ ] Implementar onboarding interactivo si `user.not_logged === true`
- [ ] Agregar componente `<TokenCounter />` estimando tokens
- [ ] Soporte de `/commands` avanzados
- [ ] Rate limiting por sessionId
- [ ] Guardar conversaciones en Supabase
- [ ] Modo offline con localStorage

## 🎓 Créditos

Sistema diseñado con principios de:
- **Alex Hormozi**: Time-to-first-token, oferta simple
- **Franco Pisso**: UI limpia y directa
- **Chris Voss**: Onboarding con preguntas calibradas
- **Brian Tracy**: Cerrar con acción clara
- **Romuald Fons**: Mini-bloques educativos
- **Diego Dreyfus**: Cero fricción

---

**VALKA AI Chat** - Entrenamiento inteligente con streaming real-time 🚀
