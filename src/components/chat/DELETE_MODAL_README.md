# 🗑️ Delete Chat Modal - Estilo Apple

## Características

### 🎨 Modal con Blur (Estilo Apple)
- **Backdrop blur**: Efecto de desenfoque de 20px con oscurecimiento
- **Animación de entrada**: Scale + translateY con cubic-bezier bounce
- **Animación de salida**: Suave fade out con blur
- **Glassmorphism**: Fondo semi-transparente con blur de 40px
- **Dark mode**: Soporte automático para tema oscuro

### 🎭 Icono de Basura Animado
- **Tapa interactiva**: Se abre al hacer hover/click
- **Animación de apertura**: Rotación + translación con bounce
- **Color rojo progresivo**: Cambia a rojo (#ff3b30) al activarse
- **Shake effect**: Temblor sutil al hacer click
- **Líneas internas**: Se desvanecen durante la interacción

### 🔘 Botón de Acción
- **Tamaño compacto**: 36x36px (40x40px en mobile)
- **Border radius**: 10px (esquinas redondeadas, estilo iOS)
- **Hover rojo suave**: rgba(255, 59, 48, 0.08)
- **Shake al hover**: Pequeño temblor horizontal
- **Estado deshabilitado**: Opacidad 25% cuando no hay mensajes

## Animaciones Principales

### 1. **Modal Entrance** (0.3s)
```
backdrop: blur(0px) → blur(20px)
modal: scale(0.9) translateY(20px) → scale(1) translateY(0)
cubic-bezier(0.34, 1.56, 0.64, 1) // Bounce effect
```

### 2. **Trash Lid Opening** (0.4s)
```
hover: rotate(-10deg) translateY(-2px)
active: rotate(-25deg) translateY(-4px)
cubic-bezier(0.34, 1.56, 0.64, 1) // Spring effect
```

### 3. **Icon Pulse** (2s loop)
```
0%, 100%: scale(1) shadow(20px, 0.3)
50%: scale(1.05) shadow(30px, 0.5)
```

### 4. **Content Stagger** (0.05s delays)
```
Icon: 0.05s delay
Title: 0.1s delay
Description: 0.15s delay
Warning: 0.2s delay
Buttons: 0.25s delay
```

## Colores

### Light Mode
- **Fondo modal**: rgba(255, 255, 255, 0.95)
- **Texto primario**: #1d1d1f
- **Texto secundario**: #6e6e73
- **Rojo principal**: #ff3b30
- **Azul sistema**: #007aff

### Dark Mode
- **Fondo modal**: rgba(28, 28, 30, 0.95)
- **Texto primario**: #f5f5f7
- **Texto secundario**: #a1a1a6
- **Rojo principal**: #ff6b6b
- **Azul sistema**: #0a84ff

## Inspiración

- **Apple iOS Alerts**: Sistema de confirmación nativo
- **macOS Big Sur**: Efectos de blur y glassmorphism
- **SF Symbols**: Iconografía minimalista y funcional
- **Apple Design Guidelines**: Animaciones con propósito

## Tecnologías

- React + TypeScript
- CSS3 Animations
- Backdrop Filter
- SVG Animations
- Cubic Bezier Easing
