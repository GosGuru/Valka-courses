/**
 * VALKA Chat Premium - Ejemplo de Uso Rápido
 * 
 * Este archivo muestra diferentes formas de usar el componente ValkaChatExperience
 */

import React from 'react';
import { ValkaChatExperience } from '../components/chat';

// ========================================
// EJEMPLO 1: Uso Básico (Mínimo)
// ========================================

export function BasicChatExample() {
  return (
    <div style={{ height: '600px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <ValkaChatExperience showHeader={true} />
    </div>
  );
}

// ========================================
// EJEMPLO 2: Con Contexto de Usuario
// ========================================

export function AuthenticatedChatExample() {
  // Estos datos vendrían de tu sistema de autenticación
  const userContext = {
    name: 'Juan Pérez',
    level: 'intermedio',
    goals: ['muscle-up', 'front-lever', 'handstand']
  };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ValkaChatExperience 
        showHeader={true}
        userContext={userContext}
      />
    </div>
  );
}

// ========================================
// EJEMPLO 3: Sin Header (Minimalista)
// ========================================

export function MinimalChatExample() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="h-full max-w-4xl mx-auto">
        <ValkaChatExperience showHeader={false} />
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 4: En un Modal/Dialog
// ========================================

export function ModalChatExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition-colors"
      >
        Abrir Chat
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[80vh] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 text-sm"
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

// ========================================
// EJEMPLO 5: Sidebar Chat
// ========================================

export function SidebarChatExample() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Mi Dashboard</h1>
        <p className="text-gray-400">Contenido de tu aplicación...</p>
      </div>

      {/* Chat Sidebar */}
      <div className="w-[400px] border-l border-gray-700">
        <ValkaChatExperience showHeader={true} />
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 6: Fullscreen Mobile
// ========================================

export function FullscreenMobileChatExample() {
  return (
    <div className="h-screen w-screen bg-black">
      <ValkaChatExperience 
        showHeader={true}
        className="h-full w-full"
      />
    </div>
  );
}

// ========================================
// EJEMPLO 7: Con Navegación Custom
// ========================================

export function CustomNavigationChatExample() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header custom */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">VALKA</h1>
          <nav className="flex gap-4">
            <a href="/programs" className="text-gray-400 hover:text-white transition-colors">Programas</a>
            <a href="/library" className="text-gray-400 hover:text-white transition-colors">Biblioteca</a>
            <a href="/profile" className="text-gray-400 hover:text-white transition-colors">Perfil</a>
          </nav>
        </div>
      </header>

      {/* Chat content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto h-[calc(100vh-120px)]">
          <ValkaChatExperience showHeader={false} />
        </div>
      </main>
    </div>
  );
}

// ========================================
// EJEMPLO 8: Grid Layout con Chat
// ========================================

export function GridLayoutChatExample() {
  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_500px] gap-6">
          {/* Panel izquierdo */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Tu Progreso</h2>
              <p className="text-gray-400">Estadísticas y métricas...</p>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Rutina del Día</h2>
              <p className="text-gray-400">Ejercicios programados...</p>
            </div>
          </div>

          {/* Chat panel derecho */}
          <div className="h-[calc(100vh-4rem)] sticky top-4">
            <ValkaChatExperience showHeader={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 9: Tabs con Chat
// ========================================

export function TabsChatExample() {
  const [activeTab, setActiveTab] = React.useState('chat');

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['chat', 'history', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-amber-500 text-black' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-180px)]">
          {activeTab === 'chat' && (
            <ValkaChatExperience showHeader={false} />
          )}
          {activeTab === 'history' && (
            <div className="bg-gray-800 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white">Historial</h2>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-2xl p-6 h-full">
              <h2 className="text-xl font-bold text-white">Configuración</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// EXPORTAR TODOS LOS EJEMPLOS
// ========================================

export default {
  BasicChatExample,
  AuthenticatedChatExample,
  MinimalChatExample,
  ModalChatExample,
  SidebarChatExample,
  FullscreenMobileChatExample,
  CustomNavigationChatExample,
  GridLayoutChatExample,
  TabsChatExample
};
