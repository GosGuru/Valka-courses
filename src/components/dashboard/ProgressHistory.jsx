
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ProgressHistory = ({ prs }) => {
  const { toast } = useToast();

  const handleViewHistory = () => {
    toast({
      title: "🚧 Función en construcción",
      description: "Pronto podrás ver tu historial completo de progreso y PRs.",
    });
  };

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl leading-snug font-bold flex items-center gap-2 break-words sm:text-2xl">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <span className="flex-1">Historial de Progreso y PRs</span>
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewHistory}
          className="w-full sm:w-auto justify-center text-xs sm:text-sm whitespace-nowrap"
          aria-label="Ver historial completo de progreso y PRs"
        >
          <span className="sm:hidden">Historial</span>
          <span className="hidden sm:inline">Ver Historial Completo</span>
        </Button>
      </div>

      {prs && prs.length > 0 ? (
        <div className="space-y-3">
          {prs.map((pr, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{pr.type}</p>
                  <p className="text-sm text-muted-foreground">{new Date(pr.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{pr.value} {pr.unit}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 px-2">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-3 sm:w-12 sm:h-12" />
          <p className="text-sm sm:text-base text-muted-foreground">Aún no tienes PRs registrados</p>
          <p className="text-xs sm:text-sm text-muted-foreground">¡Completa sesiones para comenzar a registrar tu progreso!</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressHistory;
