import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ValkaAchievements = ({ badges }) => {
  const { toast } = useToast();

  const handleViewAll = () => {
    toast({
      title: "🚧 Función en construcción",
      description: "Pronto podrás ver todos tus logros.",
    });
  };

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 leading-snug">
          <Award className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <span>Logros VALKA</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewAll}
          className="w-full sm:w-auto justify-center text-xs sm:text-sm whitespace-nowrap"
        >
          <span className="sm:hidden">Ver</span>
          <span className="hidden sm:inline">Ver Todos</span>
        </Button>
      </div>

      {badges.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge, index) => (
            <div key={index} className="text-center p-3 bg-accent rounded-lg">
              <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <p className="text-xs font-medium">{badge.name}</p>
              <p className="text-xs text-muted-foreground">{badge.points} pts</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Award className="w-10 h-10 mx-auto text-muted-foreground mb-3 sm:w-12 sm:h-12" />
          <p className="text-xs sm:text-sm text-muted-foreground">¡Completa sesiones para desbloquear logros!</p>
        </div>
      )}
    </motion.div>
  );
};

export default ValkaAchievements;