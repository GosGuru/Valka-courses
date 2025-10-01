import React from 'react';
import { Dumbbell, Target, TrendingUp, Zap } from 'lucide-react';

const STARTER_PROMPTS = [
  {
    icon: Dumbbell,
    text: 'Cómo empezar dominadas',
    category: 'técnica'
  },
  {
    icon: Target,
    text: 'Rutina 3 días: fuerza + movilidad',
    category: 'programación'
  },
  {
    icon: TrendingUp,
    text: 'Progresión para primera bandera',
    category: 'habilidad'
  },
  {
    icon: Zap,
    text: 'Plan para flexiones a pino',
    category: 'habilidad'
  },
  {
    icon: Dumbbell,
    text: 'Ejercicios para core fuerte',
    category: 'técnica'
  },
  {
    icon: Target,
    text: 'Cómo evitar lesiones en calistenia',
    category: 'prevención'
  }
];

interface StarterChipsProps {
  onChipClick: (prompt: string) => void;
}

export default function StarterChips({ onChipClick }: StarterChipsProps) {
  return (
    <div className="valka-starter-chips-container">
      <div className="valka-starter-chips-header">
        <h3 className="valka-starter-chips-title">
          ¿En qué puedo ayudarte hoy?
        </h3>
        <p className="valka-starter-chips-subtitle">
          Elegí un tema o escribí tu pregunta
        </p>
      </div>

      <div className="valka-starter-chips-grid">
        {STARTER_PROMPTS.map((prompt, index) => {
          const Icon = prompt.icon;
          return (
            <button
              key={index}
              onClick={() => onChipClick(prompt.text)}
              className="valka-starter-chip"
              type="button"
            >
              <div className="valka-starter-chip-icon">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="valka-starter-chip-text">{prompt.text}</span>
            </button>
          );
        })}
      </div>

      <div className="valka-starter-chips-footer">
        <p className="valka-starter-chips-hint">
          💡 Tip: Contame con qué equipamiento contás para darte recomendaciones más precisas
        </p>
      </div>
    </div>
  );
}
