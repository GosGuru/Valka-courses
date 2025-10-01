# 🚀 VALKA Chat Premium - Guía de Inicio Rápido

## 📋 Tabla de Contenidos

1. [Instalación](#instalación)
2. [Uso Básico](#uso-básico)
3. [Prueba Rápida](#prueba-rápida)
4. [Ejemplos Completos](#ejemplos-completos)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Instalación

No hay instalación adicional necesaria. Todos los componentes ya están en tu proyecto en:

```
src/components/chat/
```

---

## 🎨 Uso Básico

### 1. Importar el Componente

```tsx
import { ValkaChatExperience } from '@/components/chat';
```

### 2. Usar en tu Página

```tsx
function MiPagina() {
  return (
    <div style={{ height: '80vh' }}>
      <ValkaChatExperience showHeader={true} />
    </div>
  );
}
```

### 3. Con Contexto de Usuario (Recomendado para usuarios logueados)

```tsx
function MiPaginaAutenticada() {
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

---

## 🧪 Prueba Rápida

### Opción 1: Ver la Página Completa

1. Inicia tu servidor de desarrollo:
   ```bash
   npm run dev
   # o
   bun dev
   ```

2. Abre tu navegador en:
   ```
   http://localhost:5173/chat-premium
   ```

3. ¡Ya podés probar el chat!

### Opción 2: Integrar en tu Página Actual

1. Abre el archivo de la página donde querés el chat (ej: `Dashboard.jsx`)

2. Importa el componente:
   ```tsx
   import { ValkaChatExperience } from '@/components/chat';
   ```

3. Agrégalo a tu JSX:
   ```tsx
   <div className="h-[600px] w-full">
     <ValkaChatExperience showHeader={true} />
   </div>
   ```

---

## 📚 Ejemplos Completos

### Ejemplo 1: Chat en Modal

```tsx
import { ValkaChatExperience } from '@/components/chat';
import { useState } from 'react';

function MiComponente() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <button onClick={() => setShowChat(true)}>
        Abrir Chat
      </button>

      {showChat && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh]">
            <button 
              onClick={() => setShowChat(false)}
              className="absolute top-4 right-4 text-white"
            >
              Cerrar ×
            </button>
            <ValkaChatExperience showHeader={true} />
          </div>
        </div>
      )}
    </>
  );
}
```

### Ejemplo 2: Chat en Sidebar

```tsx
import { ValkaChatExperience } from '@/components/chat';

function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <h1>Mi Dashboard</h1>
        {/* Tu contenido aquí */}
      </div>

      {/* Chat Sidebar */}
      <div className="w-[400px] border-l border-gray-700">
        <ValkaChatExperience showHeader={true} />
      </div>
    </div>
  );
}
```

### Ejemplo 3: Chat Fullscreen Móvil

```tsx
import { ValkaChatExperience } from '@/components/chat';

function MobileChatPage() {
  return (
    <div className="h-screen w-screen">
      <ValkaChatExperience 
        showHeader={true}
        className="h-full w-full"
      />
    </div>
  );
}
```

---

## 🎛️ Props del Componente

### ValkaChatExperience

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `showHeader` | `boolean` | `true` | Mostrar el header con título y avatar |
| `userContext` | `object` | `undefined` | Contexto del usuario para respuestas personalizadas |
| `className` | `string` | `''` | Clases CSS adicionales |

### userContext (opcional)

```tsx
{
  name?: string;      // Nombre del usuario
  level?: string;     // Nivel: 'principiante', 'intermedio', 'avanzado'
  goals?: string[];   // Objetivos del usuario
}
```

---

## 🎨 Personalización Rápida

### Cambiar Colores

Edita `src/components/chat/valka-chat-premium.css`:

```css
:root {
  --valka-gold: hsl(45, 68%, 53%);      /* Color primario */
  --valka-gold-hover: hsl(45, 68%, 48%); /* Hover */
  --valka-bg-primary: hsl(0, 0%, 4%);    /* Fondo oscuro */
}
```

### Agregar Más Chips de Inicio

Edita `src/components/chat/StarterChips.tsx`:

```tsx
const STARTER_PROMPTS = [
  {
    icon: TuIcono, // Cualquier ícono de lucide-react
    text: 'Tu pregunta sugerida',
    category: 'técnica'
  },
  // ... más chips
];
```

### Cambiar el Threshold del Scroll

Edita `src/components/chat/ValkaChatExperience.tsx` línea ~40:

```tsx
const { shouldShowScrollButton, scrollToBottom, handleScroll } = useAutoScroll({
  messagesContainerRef,
  messagesEndRef,
  messageCount: messages.length,
  threshold: 200 // Cambiar de 150 a 200 (píxeles desde el fondo)
});
```

---

## 🐛 Troubleshooting

### El chat no aparece

**Solución 1**: Verifica que el contenedor tenga altura definida:
```tsx
<div style={{ height: '600px' }}> {/* ← Importante */}
  <ValkaChatExperience showHeader={true} />
</div>
```

**Solución 2**: Verifica que los estilos CSS se estén cargando:
- El archivo `valka-chat-premium.css` debe estar en `src/components/chat/`
- Verifica la consola del navegador por errores de importación

### El input hace zoom en iOS

**Solución**: Ya está solucionado con `font-size: 16px`. Si sigue pasando, verifica el meta viewport:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
```

### El teclado tapa el input en móvil

**Solución**: El componente ya maneja esto automáticamente con el hook `useAutoScroll`. Si sigue pasando:
1. Verifica que el contenedor tenga `height` definida
2. Prueba agregar `overflow: hidden` al body cuando el input tenga focus

### Mensajes no se envían

**Solución 1**: Verifica que Flowise esté configurado correctamente:
- Archivo `.env` tenga las variables `VITE_FLOWISE_*`
- O que `src/lib/flowise.ts` tenga los valores hardcodeados

**Solución 2**: Abre la consola del navegador y verifica errores de red

### Animaciones lentas en móvil

**Solución**: Ya están optimizadas con GPU acceleration. Si siguen lentas:
1. Verifica que el dispositivo no esté en "modo de ahorro de energía"
2. Reduce la duración de las animaciones en `valka-chat-premium.css`:
   ```css
   :root {
     --valka-transition-fast: 100ms cubic-bezier(0.4, 0, 0.2, 1);
   }
   ```

### TypeScript muestra errores

**Solución**: Los errores de TypeScript son normales durante el desarrollo. Para solucionarlos:
1. Reinicia el servidor TypeScript en VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. O simplemente ignora los errores si el código funciona (TypeScript puede tardar en indexar)

---

## 📱 Testing en Dispositivos Reales

### iOS (Recomendado)

1. Conecta tu iPhone por USB
2. En Safari > Develop > [Tu iPhone] > localhost:5173
3. Prueba escribir, tocar chips, scroll, etc.

### Android

1. Habilita "USB Debugging" en tu Android
2. Conecta por USB
3. En Chrome > `chrome://inspect` > localhost:5173
4. Prueba todas las interacciones

### Dispositivos Virtuales

- **iOS**: Xcode Simulator (Mac only)
- **Android**: Android Studio Emulator
- **Responsive**: Chrome DevTools (F12 > Toggle device toolbar)

---

## 🎯 Checklist de Pruebas Rápidas

Cuando pruebes el chat, verifica:

- [ ] Los chips de inicio se ven y funcionan
- [ ] Al tocar un chip, el texto aparece en el input
- [ ] Puedo escribir sin zoom inesperado (iOS)
- [ ] El teclado no tapa el input (móvil)
- [ ] Puedo enviar mensajes con el botón y con Enter
- [ ] Los mensajes aparecen correctamente (usuario derecha, bot izquierda)
- [ ] El indicador "escribiendo..." se muestra mientras carga
- [ ] El botón "Bajar" aparece cuando hay mensajes nuevos
- [ ] Puedo copiar mensajes del bot
- [ ] Si desconecto internet, aparece error + retry
- [ ] Las animaciones son suaves (no lag)

---

## 📖 Recursos Adicionales

- **Documentación Completa**: `CHAT_PREMIUM_README.md`
- **Plan de Implementación**: `PLAN_IMPLEMENTACION.md`
- **Ejemplos de Uso**: `src/examples/ChatExamples.tsx`
- **Componentes**: `src/components/chat/`

---

## 🚀 Próximos Pasos

1. **Probar en móvil real** (iOS y Android)
2. **Personalizar colores** según tu marca
3. **Agregar chips personalizados** según tus casos de uso
4. **Integrar en todas las páginas** donde necesites chat
5. **Recopilar feedback** de usuarios reales

---

## 💬 Soporte

¿Necesitás ayuda? Revisá:

1. Este documento
2. `CHAT_PREMIUM_README.md` (documentación técnica completa)
3. Los ejemplos en `src/examples/ChatExamples.tsx`
4. El código fuente en `src/components/chat/`

---

**¡Listo! Ya podés empezar a usar el chat premium en tu aplicación.** 🎉

---

**Última actualización**: 30 de septiembre, 2025  
**Versión**: 1.0.0
