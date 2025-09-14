
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getLessonCategoriesWithLessons } from '@/lib/api';
import { buildIdSlug } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const Library = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLibraryData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonCategoriesWithLessons();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error al cargar la biblioteca",
        description: "No se pudo cargar el contenido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLibraryData();
  }, [loadLibraryData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-8 md:p-6"
    >
      <motion.div variants={categoryVariants} className="text-center">
        <h1 className="mb-2 text-5xl tracking-wider font-logo md:text-6xl text-primary">
          Biblioteca Educativa
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
          El conocimiento es poder. Aquí tenés todo lo que necesitás para entender el porqué de tu entrenamiento.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full border-t-transparent border-primary"
          />
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <motion.section 
              key={category.id}
              variants={categoryVariants}
            >
              <h2 className="pb-2 mb-6 text-2xl font-bold border-b text-primary md:text-3xl border-border">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.lessons.map((lesson) => (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ y: -5 }}
                    className="flex flex-col overflow-hidden border rounded-lg bg-card border-border group"
                  >
                    <div className="flex flex-col flex-grow p-6">
                      <h3 className="mb-2 text-xl font-semibold text-foreground h-14">
                        {lesson.title}
                      </h3>
                      {lesson.bullets && (
                        <p className="flex-grow h-20 mb-4 overflow-hidden text-base text-muted-foreground">
                          {lesson.bullets[0]}
                        </p>
                      )}
                      <Link to={`/library/${buildIdSlug(lesson.id, lesson.title)}`}>
                        <Button 
                          variant="link" 
                          className="p-0 text-base font-medium transition-colors text-primary hover:text-primary/80"
                        >
                          VER LECCIÓN
                          <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <motion.div 
          variants={categoryVariants}
          className="py-20 text-center"
        >
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-muted">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-2xl font-bold tracking-wider">
            Biblioteca en construcción
          </h3>
          <p className="text-muted-foreground">
            Estamos preparando el mejor contenido para vos. ¡Volvé pronto!
          </p>
        </motion.div>
      )}

  
    </motion.div>
  );
};

export default Library;
