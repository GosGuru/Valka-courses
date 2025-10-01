/**
 * ChatWidget - Wrapper del nuevo ValkaChatExperience
 * Este componente ahora usa el chat premium por defecto
 */
import React from 'react';
import { ValkaChatExperience } from './chat';

export default function ChatWidget() {
  return <ValkaChatExperience showHeader={false} />;
}
