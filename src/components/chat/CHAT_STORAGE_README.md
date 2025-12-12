# 💾 Sistema de Almacenamiento de Chat - Estilo ChatGPT

## 📋 Overview

Sistema completo de gestión y persistencia de conversaciones del chat, con protección contra pérdida de datos similar a ChatGPT.

## 🎯 Características Principales

### 1. **Almacenamiento Local (localStorage)**
- ✅ Auto-guardado automático de mensajes
- ✅ Persistencia entre recargas de página
- ✅ Expiración después de 7 días
- ✅ Separación por usuario (logueado vs guest)
- ✅ Gestión de timestamps

### 2. **Protección contra Pérdida de Datos**
- ✅ Detección de navegación (beforeunload)
- ✅ Modal personalizado estilo Apple
- ✅ Solo para usuarios NO logueados con mensajes
- ✅ 3 opciones claras: Cancelar, Iniciar Sesión, Salir

### 3. **UX/UI Optimizada**
- ✅ Modal con blur backdrop (estilo iOS)
- ✅ Animaciones suaves (blur-in/blur-out)
- ✅ Icono naranja para "unsaved" (vs rojo para "delete")
- ✅ Sugerencia destacada para iniciar sesión
- ✅ Responsive y accesible

## 📁 Archivos Creados

```
src/components/chat/
├── hooks/
│   ├── useChatStorage.ts          # Hook de almacenamiento
│   ├── useBeforeUnload.ts         # Protección navegación
│   └── useChat.ts                 # (actualizado con storage)
├── UnsavedChangesModal.tsx        # Modal de advertencia
├── UnsavedChangesModal.css        # Estilos del modal
└── DELETE_MODAL_README.md         # Documentación anterior
```

## 🔧 Cómo Funciona

### **Para Usuarios NO Logueados**

1. **Guardado Automático**
   ```typescript
   // Auto-save en localStorage después de cada mensaje
   localStorage: 'valka_chat_messages_guest'
   localStorage: 'valka_chat_timestamp_guest'
   ```

2. **Protección al Salir**
   ```
   Usuario intenta salir → beforeunload detecta
   ↓
   ¿Hay mensajes sin guardar?
   ↓
   SÍ → Mostrar modal personalizado
   │     ├─ Cancelar (volver al chat)
   │     ├─ Iniciar Sesión (ir a /auth)
   │     └─ Salir de todos modos (perder datos)
   ↓
   NO → Permitir navegación normal
   ```

3. **Carga al Volver**
   ```typescript
   // Al abrir el chat nuevamente
   const savedMessages = loadMessages();
   if (!expired && savedMessages.length > 0) {
     restaurar conversación
   }
   ```

### **Para Usuarios Logueados**

> 🚧 **Próxima Fase**: Integración con Supabase
> 
> - Tabla `chat_conversations`
> - Tabla `chat_messages`
> - Sincronización en tiempo real
> - Historial completo
> - Búsqueda y filtros

## 🎨 Diseño del Modal

### Colores
- **Icono**: Naranja (#ff9500) - indica "advertencia" no destructivo
- **Botón Principal**: Azul (#007aff) - "Iniciar Sesión"
- **Botón Secundario**: Gris - "Salir de todos modos"
- **Botón Terciario**: Transparente - "Cancelar"

### Animaciones
```css
/* Entrada */
backdrop: blur(0→20px) + opacity(0→1)
modal: scale(0.9→1) + translateY(20px→0)
timing: cubic-bezier(0.34, 1.56, 0.64, 1) // bounce

/* Salida */
backdrop: blur(20px→0) + opacity(1→0)
modal: scale(1→0.9) + translateY(0→20px)
timing: ease-out
```

## 🔒 Seguridad y Privacidad

### LocalStorage Keys
```typescript
// Usuario logueado
valka_chat_messages_user_{userId}
valka_chat_timestamp_user_{userId}

// Usuario guest
valka_chat_messages_guest
valka_chat_timestamp_guest
```

### Expiración
- Mensajes expiran después de **7 días**
- Se verifica en cada carga
- Se limpian automáticamente si expiraron

### Limpieza
```typescript
// Al cerrar sesión (en SupabaseAuthContext.jsx)
localStorage.clear(); // Limpia TODO incluyendo chats

// Al eliminar conversación
chatStorage.clearMessages(); // Solo los mensajes del chat
```

## 📊 Estados del Chat

| Estado | Descripción | Acción |
|--------|-------------|--------|
| `storageReady` | LocalStorage inicializado | Cargar mensajes |
| `hasUnsavedChanges` | Hay mensajes sin persistir | Activar protección |
| `isProtected` | beforeunload activo | Mostrar modal nativo |
| `showUnsavedModal` | Modal personalizado visible | Esperar decisión |

## 🚀 Uso

### En un Componente

```tsx
import { useChat } from './hooks/useChat';
import { useBeforeUnload } from './hooks/useBeforeUnload';

function MyChat() {
  const {
    messages,
    hasUnsavedChanges,
    chatStorage
  } = useChat({
    userContext,
    autoSave: true,      // Auto-guardar
    loadFromStorage: true // Cargar al inicio
  });

  const isLoggedIn = userContext?.id !== undefined;
  const shouldProtect = !isLoggedIn && messages.length > 0;

  useBeforeUnload({
    enabled: shouldProtect,
    onBeforeUnload: () => {
      // Callback opcional antes de salir
    }
  });

  // ... resto del componente
}
```

## 📱 Responsive

- **Desktop**: Modal 420px ancho máximo
- **Mobile**: Modal 100% ancho menos padding
- **Botones**: Stack vertical en mobile
- **Touch targets**: 44px mínimo

## ♿ Accesibilidad

- ✅ `role="dialog"` y `aria-modal="true"`
- ✅ `aria-labelledby` para título
- ✅ Escape key para cerrar
- ✅ Focus trap dentro del modal
- ✅ Backdrop click para cerrar

## 🔄 Próximos Pasos

### Fase 2: Integración Supabase (Para Usuarios Logueados)

```sql
-- Tabla de conversaciones
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Tabla de mensajes
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
```

### Funcionalidades Planeadas
- [ ] Historial de conversaciones
- [ ] Búsqueda en conversaciones
- [ ] Títulos automáticos (con AI)
- [ ] Archivar/Eliminar conversaciones
- [ ] Exportar conversaciones (JSON/MD)
- [ ] Sincronización multi-dispositivo
- [ ] Compartir conversaciones (enlaces públicos)

## 🎓 Inspiración

- **ChatGPT**: Sistema de advertencia y persistencia
- **Apple iOS**: Diseño de modales y animaciones
- **Linear**: Gestión de estados y UX
- **Notion**: Auto-save y feedback visual

## 📝 Notas Técnicas

### beforeunload Limitations
- No funciona en mobile al cambiar de app
- El navegador muestra su propio mensaje genérico
- Mejor usarlo con modal personalizado cuando sea posible

### localStorage Limits
- ~5-10MB por dominio
- Sincrónico (puede bloquear UI)
- Solo strings (JSON.stringify/parse)

### Best Practices Aplicadas
- ✅ Debounce para auto-save
- ✅ Timestamps para expiración
- ✅ Manejo de errores graceful
- ✅ Console logs para debugging
- ✅ TypeScript strict mode
