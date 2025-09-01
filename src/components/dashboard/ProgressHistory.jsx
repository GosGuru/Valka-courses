
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
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Historial de Progreso y PRs
        </h2>
        <Button variant="outline" size="sm" onClick={handleViewHistory}>
          Ver Historial Completo
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
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aún no tienes PRs registrados</p>
          <p className="text-sm text-muted-foreground">¡Completa sesiones para comenzar a registrar tu progreso!</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressHistory;
