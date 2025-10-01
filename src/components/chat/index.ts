// Exportar el componente principal
export { default as ValkaChatExperience } from './ValkaChatExperience';

// Exportar componentes individuales si se necesitan
export { default as MessageBubble } from './MessageBubble';
export { default as StarterChips } from './StarterChips';
export { default as ScrollToBottomButton } from './ScrollToBottomButton';
export { default as TypingIndicator } from './TypingIndicator';
export { default as MessageInput } from './MessageInput';

// Exportar hooks
export { useChat } from './hooks/useChat';
export { useAutoScroll } from './hooks/useAutoScroll';

// Exportar tipos
export type { Message } from './hooks/useChat';
