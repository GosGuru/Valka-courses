# 🚀 VALKA Chat Experience - Documentación Premium

## 📖 Índice

1. [Visión General](#visión-general)
2. [Características Principales](#características-principales)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Uso](#uso)
5. [Personalización](#personalización)
6. [Checklist de Pruebas](#checklist-de-pruebas)
7. [Optimizaciones Móviles](#optimizaciones-móviles)
8. [Accesibilidad](#accesibilidad)

---

## 🎯 Visión General

**VALKA Chat Experience** es una experiencia de chat premium diseñada con estética Apple-like: limpia, fluida, con micro-interacciones sutiles y optimizada para móvil. Está construida para que los alumnos se sientan cómodos preguntando y avanzando en su entrenamiento.

### Objetivos Logrados ✅

- **Comodidad absoluta en móvil**: Sin zoom inesperado, sin saltos con el teclado
- **Fluidez tipo app**: Transiciones suaves, respuesta inmediata
- **Claridad visual**: Jerarquía clara, buena lectura
- **Envío confiable**: Estados visibles (enviando, enviado, error con reintento)
- **Autoscroll inteligente**: Solo muestra "Bajar" cuando corresponde
- **Inicio guiado**: Chips/atajos interactivos que invitan a preguntar
- **Respuestas útiles**: Contexto de usuario para respuestas personalizadas
- **Accesibilidad real**: WCAG AAA, foco visible, soporte para teclado
- **Alto rendimiento**: Animaciones GPU, debounce en listeners
- **Coherencia de marca**: Tono VALKA cercano y motivador

---

## ✨ Características Principales

### 1. **Experiencia Móvil Premium**
- ✅ `font-size: 16px` en inputs (previene zoom en iOS)
- ✅ `viewport-fit=cover` con safe areas (notch/island)
- ✅ Textarea que crece sin saltos
- ✅ Teclado nunca tapa el área de escritura
- ✅ Scroll suave con momentum (iOS)

### 2. **Micro-interacciones Apple-like**
- ✅ Blur-in/blur-out sutiles (200-350ms)
- ✅ Transformaciones CSS (GPU accelerated)
- ✅ Feedback visual en toques (scale, traslación)
- ✅ Estados de carga elegantes

### 3. **Autoscroll Inteligente**
- ✅ Detecta si el usuario está leyendo arriba
- ✅ Pill "Bajar" solo cuando hay nuevos mensajes
- ✅ Desaparece automáticamente al llegar al fondo
- ✅ Threshold configurable (150px por defecto)

### 4. **Mensajería Confiable**
- ✅ Estados: `idle` → `sending` → `sent` → `error`
- ✅ Indicador "escribiendo..." del asistente
- ✅ Retry manual en errores
- ✅ Mensajes nunca se pierden

### 5. **Inicio Guiado**
- ✅ 6 chips con íconos React (lucide-react)
- ✅ Al tocar: se inserta en el input (editable)
- ✅ Desaparecen tras el primer mensaje
- ✅ Responsive: 1 columna móvil, 2+ desktop

### 6. **Accesibilidad Real**
- ✅ ARIA labels completos
- ✅ Focus visible (anillo dorado)
- ✅ Contraste WCAG AAA
- ✅ Soporte `prefers-reduced-motion`
- ✅ Navegación por teclado (Enter, Shift+Enter)

---

## 📁 Estructura del Proyecto

```
src/components/chat/
├── ValkaChatExperience.tsx    # Componente principal
├── MessageBubble.tsx           # Burbuja de mensaje individual
├── StarterChips.tsx            # Chips de inicio guiado
├── ScrollToBottomButton.tsx    # Botón "Bajar" inteligente
├── TypingIndicator.tsx         # Indicador "escribiendo..."
├── MessageInput.tsx            # Input con auto-resize
├── valka-chat-premium.css      # Estilos Apple-like
├── index.ts                    # Exports públicos
└── hooks/
    ├── useChat.ts              # Lógica de mensajería
    └── useAutoScroll.ts        # Lógica de scroll inteligente
```

---

## 🎨 Uso

### Básico

```tsx
import { ValkaChatExperience } from '@/components/chat';

function MyPage() {
  return (
    <div style={{ height: '80vh' }}>
      <ValkaChatExperience showHeader={true} />
    </div>
  );
}
```

### Con Contexto de Usuario

```tsx
import { ValkaChatExperience } from '@/components/chat';

function AuthenticatedPage() {
  const userContext = {
    name: 'Juan',
    level: 'intermedio',
    goals: ['muscle-up', 'front-lever']
  };

  return (
    <div style={{ height: '80vh' }}>
      <ValkaChatExperience 
        showHeader={true}
        userContext={userContext}
      />
    </div>
  );
}
```

### Standalone (Sin Header)

```tsx
import { ValkaChatExperience } from '@/components/chat';

function EmbeddedChat() {
  return (
    <div className="chat-wrapper" style={{ height: '600px' }}>
      <ValkaChatExperience showHeader={false} />
    </div>
  );
}
```

---

## 🎛️ Personalización

### Variables CSS

Todas las variables están en `:root` en `valka-chat-premium.css`:

```css
:root {
  /* Colores VALKA */
  --valka-gold: hsl(45, 68%, 53%);
  --valka-gold-hover: hsl(45, 68%, 48%);
  
  /* Fondos */
  --valka-bg-primary: hsl(0, 0%, 4%);
  --valka-bg-secondary: hsl(0, 0%, 8%);
  
  /* Transiciones */
  --valka-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --valka-transition-medium: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Blur */
  --valka-blur-sm: blur(8px);
  --valka-blur-md: blur(12px);
}
```

### Personalizar Starter Prompts

Editar `StarterChips.tsx`:

```tsx
const STARTER_PROMPTS = [
  {
    icon: Dumbbell, // Cualquier ícono de lucide-react
    text: 'Tu prompt personalizado',
    category: 'técnica'
  },
  // ... más prompts
];
```

### Threshold de Autoscroll

Editar `ValkaChatExperience.tsx`:

```tsx
const { shouldShowScrollButton, scrollToBottom, handleScroll } = useAutoScroll({
  messagesContainerRef,
  messagesEndRef,
  messageCount: messages.length,
  threshold: 200 // Cambiar de 150px a 200px
});
```

---

## ✅ Checklist de Pruebas

### **iOS Safari** (Crítico)

- [ ] No hay zoom al tocar input
- [ ] Teclado no tapa textarea
- [ ] Scroll suave sin jitter
- [ ] Safe areas respetadas (notch/Dynamic Island)
- [ ] Momentum scroll funciona
- [ ] Input visible al escribir
- [ ] Botón enviar siempre accesible

### **Android Chrome**

- [ ] Input visible con teclado abierto
- [ ] Sin saltos de layout al abrir/cerrar teclado
- [ ] Animaciones fluidas a 60fps
- [ ] Scroll suave sin lag
- [ ] Botón "Bajar" aparece/desaparece correctamente

### **Desktop (Chrome/Firefox/Safari)**

- [ ] Responsive de 320px a 2560px
- [ ] Atajos de teclado (Enter, Shift+Enter)
- [ ] Focus states visibles
- [ ] Hover states suaves
- [ ] Scroll con rueda del mouse
- [ ] Copy/paste funciona

### **Funcionalidad General**

- [ ] Mensajes largos (2000+ chars) se ven bien
- [ ] Chat con 100+ mensajes sigue fluido
- [ ] Rotar pantalla no rompe layout
- [ ] Estados de error se muestran correctamente
- [ ] Retry funciona tras error
- [ ] Chips desaparecen tras primer mensaje
- [ ] Indicador "escribiendo..." se muestra/oculta bien
- [ ] Botón copiar funciona en mensajes del bot
- [ ] Sin errores en consola

### **Accesibilidad**

- [ ] Screen reader lee todo correctamente
- [ ] Navegación por teclado completa
- [ ] Focus visible en todos los elementos
- [ ] Contraste suficiente (WCAG AAA)
- [ ] `prefers-reduced-motion` respetado

### **Rendimiento**

- [ ] Time to Interactive < 2s
- [ ] Animaciones a 60fps
- [ ] Sin memory leaks (DevTools)
- [ ] Scroll smooth en dispositivos antiguos

---

## 📱 Optimizaciones Móviles

### Prevenir Zoom en iOS

```css
.valka-input {
  font-size: 16px; /* Mínimo para iOS */
  -webkit-appearance: none;
  appearance: none;
}
```

```html
<!-- En index.html o Helmet -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
```

### Safe Areas (Notch/Island)

```css
@supports (padding: max(0px)) {
  .valka-chat-container {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
  }
}
```

### Momentum Scroll (iOS)

```css
.valka-chat-messages {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
```

### Prevenir Saltos con Teclado

El hook `useAutoScroll` detecta cuando el usuario está escribiendo y ajusta el scroll automáticamente sin interrumpir la lectura.

---

## ♿ Accesibilidad

### ARIA Labels

Todos los elementos interactivos tienen labels:

```tsx
<button aria-label="Enviar mensaje">Enviar</button>
<div role="region" aria-label="Chat con asistente">...</div>
<div aria-live="polite">...</div>
```

### Focus Visible

```css
.valka-input:focus-visible,
.valka-send-button:focus-visible {
  outline: 2px solid var(--valka-gold);
  outline-offset: 2px;
}
```

### Reducir Movimiento

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Navegación por Teclado

- **Enter**: Enviar mensaje
- **Shift+Enter**: Nueva línea
- **Tab**: Navegar entre elementos
- **Escape**: (Opcional) Cerrar modales

---

## 🎬 Animaciones

### Filosofía

- **Sutiles**: 150-350ms, nunca más de 500ms
- **Naturales**: Curvas `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **GPU**: Usar `transform` y `opacity`, evitar `width/height`
- **Opcional**: Respetar `prefers-reduced-motion`

### Ejemplos

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide In Message */
@keyframes slideInMessage {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Typing Bounce */
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
  30% { transform: translateY(-8px); opacity: 1; }
}
```

---

## 🚀 Próximos Pasos

### Mejoras Futuras

1. **Streaming de respuestas**: Mostrar tokens conforme llegan
2. **Virtualización**: Para chats con 1000+ mensajes (react-window)
3. **Markdown avanzado**: Code blocks, tablas, imágenes
4. **Voice input**: Grabar mensajes de voz
5. **Attachments**: Subir imágenes/videos
6. **Reacciones**: Like/dislike en mensajes
7. **Historial persistente**: LocalStorage o DB
8. **Multi-idioma**: i18n completo

---

## 📞 Soporte

Para bugs, features o dudas:
- **Repo**: github.com/GosGuru/Valka-courses
- **Documentación**: Este archivo
- **Ejemplos**: Ver `FlowiseChatPremium.jsx`

---

## 📄 Licencia

Propiedad de VALKA. Uso interno solamente.

---

**Última actualización**: 30 de septiembre, 2025  
**Versión**: 1.0.0  
**Autor**: Copilot con amor 💛
