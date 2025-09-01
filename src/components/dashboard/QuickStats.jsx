import React from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle, Clock } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const QuickStats = () => {
  // These are placeholder values. In a real app, this would come from state or API.
  const stats = [
    { icon: Flame, value: '7 días', label: 'Racha Actual', color: 'text-orange-400' },
    { icon: CheckCircle, value: '24', label: 'Sesiones Completadas', color: 'text-green-400' },
    { icon: Clock, value: '18h 30m', label: 'Tiempo Total', color: 'text-blue-400' },
  ];

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Estadísticas</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className={`font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickStats;