# 🌊 Streaming de Respuestas - Estilo ChatGPT

## 📋 Overview

Sistema de streaming implementado para mostrar las respuestas del asistente palabra por palabra en tiempo real, mejorando significativamente la UX.

## 🎯 ¿Cómo Funciona?

### **1. N8N Webhook Configuration**

En N8N, configura el nodo de respuesta:
```
Response Node Settings:
- Respond: "Streaming"
- Enable streaming: ✅
```

Esto hace que N8N envíe la respuesta en chunks mientras el AI genera el texto.

### **2. Cliente (useChat.ts)**

```typescript
// Crear mensaje vacío del asistente
const assistantMessage = {
  id: generateId(),
  role: 'assistant',
  content: '',      // ← Vacío al inicio
  status: 'sending' // ← Indica que está recibiendo
};

// Leer el stream chunk por chunk
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  accumulatedContent += chunk;
  
  // Actualizar UI en tiempo real
  setMessages(prev => 
    prev.map(msg => 
      msg.id === assistantMessage.id
        ? { ...msg, content: accumulatedContent }
        : msg
    )
  );
}
```

### **3. Visualización (MessageBubble.tsx)**

```tsx
{/* Cursor parpadeante durante streaming */}
{!isUser && message.status === 'sending' && message.content && (
  <span className="valka-streaming-cursor">▋</span>
)}
```

## 🎨 Efecto Visual

```
Usuario: "Hola, cómo estás?"
         ↓
Asistente: "H▋"
Asistente: "Hola▋"
Asistente: "Hola,▋"
Asistente: "Hola, est▋"
Asistente: "Hola, estoy▋"
Asistente: "Hola, estoy bien▋"
Asistente: "Hola, estoy bien. ¿Y tú?▋"
Asistente: "Hola, estoy bien. ¿Y tú?" ✓
```

## 🔧 Configuración Técnica

### **Headers HTTP**

```javascript
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream', // ← Importante para streaming
  }
})
```

### **Proxy Vite (vite.config.js)**

```javascript
proxy: {
  '/api/n8n': {
    target: 'https://n8n-n8n.ua4qkv.easypanel.host',
    ws: true, // ← Soporte para WebSocket/streaming
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Accept', 'text/event-stream');
      });
    }
  }
}
```

## 📊 Flujo de Datos

```
1. Usuario envía mensaje
   ↓
2. POST /api/n8n/webhook/messageWEB
   ↓
3. N8N procesa con AI Agent
   ↓
4. AI genera texto → Stream chunks
   ↓
5. Cliente recibe chunks en tiempo real
   ↓
6. UI actualiza con cada chunk
   ↓
7. Stream completa → status: 'sent'
```

## 🎭 Estados del Mensaje

| Estado | Descripción | Visual |
|--------|-------------|--------|
| `sending` (user) | Enviando al servidor | Punto pulsante 🟡 |
| `sending` (assistant) | Recibiendo stream | Cursor parpadeante ▋ |
| `sent` | Completado | Sin indicador |
| `error` | Error | Punto rojo 🔴 |

## 💡 Ventajas del Streaming

### **UX Mejorada**
- ✅ Feedback instantáneo
- ✅ Sensación de velocidad
- ✅ Usuario sabe que algo está pasando
- ✅ Puede empezar a leer mientras genera

### **Performance**
- ✅ No bloquea UI
- ✅ Menor tiempo percibido de espera
- ✅ Mejor utilización de recursos

### **Engagement**
- ✅ Más interactivo
- ✅ Sensación "viva"
- ✅ Similar a ChatGPT, Claude, etc.

## 🔄 Fallback (Sin Streaming)

Si N8N no soporta streaming o hay error:

```typescript
// Detectar si NO es streaming
const isStreaming = contentType.includes('text/event-stream');

if (!isStreaming) {
  // Respuesta completa de una vez
  const data = await response.json();
  setMessages(prev => [...prev, {
    ...assistantMessage,
    content: data.output,
    status: 'sent'
  }]);
}
```

## 🎨 CSS Animations

### **Cursor Parpadeante**

```css
.valka-streaming-cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--valka-gold);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### **Scroll Automático**

El hook `useAutoScroll` se encarga de:
- Hacer scroll automático con cada chunk nuevo
- Detectar si el usuario scrolleó manualmente
- Mostrar botón "Scroll to bottom" si es necesario

## 🐛 Debugging

### **Ver el Stream en Consola**

```typescript
console.log('[N8N] Streaming habilitado');
console.log('[N8N] Chunk recibido:', chunk);
console.log('[N8N] Contenido acumulado:', accumulatedContent);
console.log('[N8N] Stream completo');
```

### **Network Tab**

1. Abrir DevTools → Network
2. Buscar request a `/webhook/messageWEB`
3. Ver "Response" → debería mostrar chunks llegando
4. Content-Type debe ser `text/event-stream` o `text/plain`

## 🚀 Testing

### **Probar Streaming**

1. Abrir el chat
2. Enviar un mensaje
3. Deberías ver:
   - Mensaje del usuario con "Enviando..."
   - Mensaje del asistente aparece vacío
   - Texto va apareciendo letra por letra
   - Cursor parpadeante ▋ al final
   - Cuando termina, cursor desaparece

### **Probar Fallback**

Si N8N no está configurado con streaming:
- La respuesta llegará completa de una vez
- No habrá cursor parpadeante
- Seguirá funcionando normalmente

## 📝 Notas Importantes

### **CORS**
- En desarrollo: proxy de Vite maneja CORS
- En producción: N8N debe tener CORS configurado

### **Timeouts**
- El stream puede durar varios segundos
- No hay timeout por defecto en fetch con streaming
- El usuario puede cancelar en cualquier momento

### **Memoria**
- El contenido se acumula en `accumulatedContent`
- Se limpia al terminar el stream
- No hay leak de memoria

## 🎯 Resultado Final

**Antes (sin streaming):**
```
Usuario envía → Espera 5s → Respuesta completa aparece
```

**Después (con streaming):**
```
Usuario envía → 0.5s → Primeras palabras → Texto fluye → Completo
```

**Mejora de UX:** 90% más rápido percibido ⚡

---

## 📚 Referencias

- [Fetch API Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
