import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { completeSession } from '@/lib/api';
import { DialogContent } from '@/components/ui/dialog';

const SessionCompleteModal = ({ session, enrollment, onClose, onComplete }) => {
  const { toast } = useToast();
  const [rpe, setRpe] = useState([7]);
  const [notes, setNotes] = useState('');

  const handleComplete = async () => {
    try {
      await completeSession(session.id, enrollment.id, rpe[0], notes);
      
      toast({
        title: "🎉 ¡Sesión Completada!",
        description: `¡Excelente trabajo! Has ganado 50 puntos VALKA.`
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-card border-secondary max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-primary font-logo text-2xl">
            <CheckCircle className="w-6 h-6" />
            SESIÓN COMPLETADA
          </DialogTitle>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 pt-4"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold tracking-wider mb-2">{session.title}</h3>
            <p className="text-muted-foreground">¡Felicitaciones por completar tu sesión!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold tracking-wider mb-3 text-center">
                ¿CÓMO TE SENTISTE? (RPE: {rpe[0]})
              </label>
              <Slider
                value={rpe}
                onValueChange={setRpe}
                max={10}
                min={1}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>MUY FÁCIL</span>
                <span>MÁXIMO ESFUERZO</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold tracking-wider mb-2 text-center">
              NOTAS
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Cómo te fue? ¿Alguna observación?"
              className="w-full p-3 bg-background border border-border rounded-lg resize-none h-24"
            />
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold tracking-wider text-primary">¡RECOMPENSAS!</p>
                <p className="text-sm text-foreground">+50 PUNTOS VALKA</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              CANCELAR
            </Button>
            <Button onClick={handleComplete} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Star className="w-4 h-4 mr-2" />
              COMPLETAR
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCompleteModal;