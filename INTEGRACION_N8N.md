# 🔗 Integración con N8N - VALKA Chat

## ✅ Cambios Implementados

### 1. Mejoras de Scroll para iOS 18
- **Threshold aumentado**: De 150px a 200px para mejor detección de "cerca del fondo"
- **Detección de scroll manual hacia arriba**: El chat ya NO te empuja automáticamente al fondo si scrolleaste hacia arriba para leer mensajes antiguos
- **Flag `userHasScrolledUp`**: Rastrea si el usuario intencionalmente scrolleó hacia arriba
- **Timeout aumentado**: De 150ms a 300ms para mejor compatibilidad con iOS momentum scroll
- **CSS mejorado para iOS**:
  - `padding-top: max(20px, env(safe-area-inset-top))` - Respeta Dynamic Island
  - `scroll-behavior: auto` - Mejor control manual (sin smooth automático)
  - `overscroll-behavior: none` - Evita bounce excesivo
  - `touch-action: pan-y` - Mejor manejo táctil

### 2. Integración Flexible con N8N

El código ahora soporta **dos backends** sin necesidad de cambiar código:

#### **Flowise** (actual)
```env
VITE_USE_N8N=false
```

#### **N8N** (preparado)
```env
VITE_USE_N8N=true
VITE_N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/tu-id
```

---

## 🚀 Cómo Cambiar a N8N

### Paso 1: Crear el Workflow en N8N

Tu workflow de N8N debe:

1. **Recibir el webhook POST** con este formato:
```json
{
  "message": "Hola, necesito ayuda con flexiones",
  "chatHistory": [
    { "role": "user", "content": "mensaje anterior del usuario" },
    { "role": "assistant", "content": "respuesta anterior del bot" }
  ],
  "timestamp": "2025-09-30T12:34:56.789Z"
}
```

2. **Procesar con tu agente de IA** (OpenAI, Anthropic, etc.)

3. **Retornar JSON** con uno de estos formatos:
```json
// Opción 1 (preferida)
{
  "response": "¡Hola! Puedo ayudarte con las flexiones..."
}

// Opción 2
{
  "message": "¡Hola! Puedo ayudarte con las flexiones..."
}

// Opción 3
{
  "text": "¡Hola! Puedo ayudarte con las flexiones..."
}
```

### Paso 2: Configurar Variables de Entorno

1. Abre tu archivo `.env` (o crea uno copiando `.env.example`)
2. Actualiza estas líneas:

```env
# Activar N8N
VITE_USE_N8N=true

# Pegar tu webhook URL
VITE_N8N_WEBHOOK_URL=https://n8n.valka.com/webhook/chat-assistant-v2
```

### Paso 3: Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
bun dev
```

---

## 🧪 Probar la Integración

1. Abre el chat en `http://localhost:5173/chat`
2. Envía un mensaje de prueba
3. **Verifica en N8N**:
   - ¿Se recibió el webhook?
   - ¿El workflow se ejecutó?
   - ¿Se retornó la respuesta correctamente?

### Debugging

Si algo falla, abre la consola del navegador (F12) y busca:
```
Chat API HTTP 500
// o
Error: ...
```

También puedes verificar en tu N8N:
- **Executions** → Ver si el workflow se ejecutó
- **Webhook logs** → Ver qué recibió N8N

---

## 📋 Ejemplo de Workflow N8N Básico

```
[Webhook] 
  ↓
[Set Variables]
  - message = {{ $json.message }}
  - history = {{ $json.chatHistory }}
  ↓
[OpenAI Chat Model]
  - Model: gpt-4
  - Prompt: Sistema: Eres el asistente de VALKA...
  - Messages: {{ $node["Set Variables"].json.history }}
  - New message: {{ $node["Set Variables"].json.message }}
  ↓
[Respond to Webhook]
  - Body: 
    {
      "response": "{{ $json.choices[0].message.content }}"
    }
```

---

## 🔄 Volver a Flowise

Si quieres volver a usar Flowise:

```env
VITE_USE_N8N=false
```

Y reinicia el servidor.

---

## 🎨 Personalización Avanzada

Si tu N8N retorna un formato diferente, edita `src/lib/flowise.ts`:

```typescript
// Línea ~45
if (USE_N8N) {
  return {
    text: data.tu_campo_personalizado || data.response || ...
  };
}
```

---

## ✅ Checklist de Validación

- [ ] El chat no hace auto-scroll cuando scrolleo hacia arriba
- [ ] El Dynamic Island de iOS no tapa el header
- [ ] Los mensajes se envían correctamente a N8N
- [ ] Las respuestas de N8N se muestran en el chat
- [ ] El historial de chat se mantiene en la conversación
- [ ] Los starter chips siguen funcionando

---

## 📞 Próximos Pasos

1. **Prueba en tu iPhone 13** con iOS 18
2. **Verifica el scroll** - ¿Ya no te empuja al fondo?
3. **Envíame los URLs de N8N** cuando estés listo para conectar
4. **Prueba mensajes de ida y vuelta** para validar historial

---

¿Necesitas ayuda con el workflow de N8N o algún ajuste adicional? ¡Avísame! 🚀
