import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const QuickActions = () => {
  const { toast } = useToast();

  const handleUploadVideo = () => {
    toast({
      title: "🎥 Subida de Video",
      description: "🚧 Esta función estará disponible pronto con la integración de Supabase Storage! 🚀"
    });
  };

  return (
    <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        <Button 
          onClick={handleUploadVideo}
          className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir Video para Feedback
        </Button>
        <Link to="/library" className="block">
          <Button className="w-full justify-start" variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            Acceso a Biblioteca
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default QuickActions;