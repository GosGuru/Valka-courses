
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const CurrentBlock = ({ enrollment }) => {
  if (!enrollment || !enrollment.program) {
    return null;
  }

  const { program, completed_sessions_count, total_sessions_count, is_completed } = enrollment;
  
  const progress = total_sessions_count > 0 ? Math.round((completed_sessions_count / total_sessions_count) * 100) : 0;
  const currentWeek = program.sessions_per_week > 0 ? Math.min(program.weeks, Math.floor(completed_sessions_count / program.sessions_per_week) + 1) : 1;

  if (is_completed) {
    return (
      <motion.div variants={cardVariants} className="bg-gradient-to-br from-primary/80 to-secondary/80 border border-yellow-400 rounded-xl p-6 text-white">
        <div className="flex items-center justify-center text-center flex-col">
          <Trophy className="w-12 h-12 text-yellow-300 mb-4" />
          <h2 className="text-2xl font-bold">¡Programa Completado!</h2>
          <p className="text-lg mt-1">¡Felicitaciones por terminar {program.name}!</p>
          <p className="text-yellow-200 mt-4">{completed_sessions_count} de {total_sessions_count} sesiones completadas</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Mi Bloque Actual
        </h2>
        <span className="text-sm text-muted-foreground">
          Semana {currentWeek} de {program.weeks}
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            {program.name}
          </h3>
          <p className="text-muted-foreground">
            Progreso actual – {completed_sessions_count} de {total_sessions_count} sesiones
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso del Programa</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-accent rounded-full h-3">
            <motion.div 
              className="bg-gradient-to-r from-primary to-secondary rounded-full h-3"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CurrentBlock;
