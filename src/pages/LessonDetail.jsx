
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Reemplazado ReactPlayer por VideoPlayer propio multi-plataforma
import VideoPlayer from '@/components/VideoPlayer';
import { getLessonById } from '@/lib/api/library';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';

const LessonDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLessonData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLessonById(id);
      setLesson(data);
    } catch (error) {
      toast({
        title: "Error al cargar la lección",
        description: "No se pudo encontrar la lección solicitada.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 rounded-full border-t-transparent border-primary"
        />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold">Lección no encontrada</h2>
        <p className="mb-6 text-muted-foreground">Lo sentimos, no pudimos encontrar la lección que estás buscando.</p>
        <Link to="/library">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Biblioteca
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${lesson.title} | VALKA`}</title>
        <meta name="description" content={`Aprende sobre ${lesson.title} en la biblioteca de VALKA.`} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl p-4 mx-auto md:p-6"
      >
        <div className="mb-6">
          <Link to="/library">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la Biblioteca
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">{lesson.title}</h1>
            <div className="text-sm text-muted-foreground">
              {lesson.category?.name}
              {lesson.read_time_min ? <> • {lesson.read_time_min} min</> : null}
            </div>
          </div>

          <div className="overflow-hidden border rounded-lg bg-card border-border">
            {lesson.video_url ? (
              <div className="aspect-video">
                <VideoPlayer url={lesson.video_url} className="rounded" />
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-video bg-muted/10 text-muted-foreground">
                Video Placeholder (VIDEO_ID)
              </div>
            )}
          </div>

          {lesson.bullets && lesson.bullets.length > 0 && (
            <div className="p-5 border rounded-lg bg-card border-border">
              <h2 className="mb-3 text-lg font-semibold">3 Ideas Clave</h2>
              <ul className="space-y-2">
                {(lesson.bullets.slice(0, 3)).map((bullet, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary" />
                    <span className="text-sm text-muted-foreground">{bullet}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {lesson.errors && lesson.errors.length > 0 && (
            <div className="p-5 border rounded-lg bg-card border-border">
              <h2 className="mb-3 text-lg font-semibold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" />Errores Comunes</h2>
              <ul className="space-y-2">
                {lesson.errors.map((err, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <XCircle className="flex-shrink-0 w-4 h-4 mt-0.5 text-red-400" />
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.task && (
            <div className="p-5 border rounded-lg bg-card border-border">
              <h3 className="flex items-center gap-2 mb-2 text-base font-semibold text-green-400">
                <CheckCircle className="w-5 h-5" />
                Tarea / Ejecución Correcta
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{lesson.task}</p>
            </div>
          )}

          {lesson.applicable_task && (
            <div className="p-5 border rounded-lg border-primary/60 bg-primary/5">
              <h3 className="mb-1 text-base font-semibold">Tarea Aplicable Hoy</h3>
              <p className="text-sm text-muted-foreground">{lesson.applicable_task}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default LessonDetail;
