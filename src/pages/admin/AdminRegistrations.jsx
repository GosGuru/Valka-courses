import React, { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getProgramEnrollments, getSessionProgress } from '@/lib/api/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

const MotionDiv = motion.div;

const TabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const ListVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const ItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const AdminRegistrations = () => {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState({ enrollments: true, progress: true });
  const [activeTab, setActiveTab] = useState("enrollments");

  const loadEnrollments = useCallback(async () => {
    setLoading(prev => ({ ...prev, enrollments: true }));
    try {
      const data = await getProgramEnrollments();
      setEnrollments(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las inscripciones." });
    } finally {
      setLoading(prev => ({ ...prev, enrollments: false }));
    }
  }, [toast]);

  const loadProgress = useCallback(async () => {
    setLoading(prev => ({ ...prev, progress: true }));
    try {
      const data = await getSessionProgress();
      setProgress(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el progreso de las sesiones." });
    } finally {
      setLoading(prev => ({ ...prev, progress: false }));
    }
  }, [toast]);

  useEffect(() => {
    loadEnrollments();
    loadProgress();
  }, [loadEnrollments, loadProgress]);

  const renderEnrollments = () => {
    if (loading.enrollments) return <div className="text-center p-8">Cargando inscripciones...</div>;
    if (enrollments.length === 0) return <div className="text-center p-8 text-muted-foreground">No hay inscripciones a programas.</div>;

    return (
      <MotionDiv variants={ListVariants} initial="hidden" animate="visible" className="space-y-3">
        {enrollments.map(enroll => (
          <MotionDiv variants={ItemVariants} key={enroll.id} className="bg-card p-4 rounded-lg border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={enroll.profiles?.photo_url} alt={enroll.profiles?.display_name} />
                <AvatarFallback>{enroll.profiles?.display_name?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{enroll.profiles?.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  Inscrito en <span className="font-medium text-primary">{enroll.program?.name}</span>
                </p>
              </div>
            </div>
            {enroll.started_at && isValid(parseISO(enroll.started_at)) &&
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {format(parseISO(enroll.started_at), "dd MMM, yyyy", { locale: es })}
              </p>
            }
          </MotionDiv>
        ))}
      </MotionDiv>
    );
  };

  const renderProgress = () => {
    if (loading.progress) return <div className="text-center p-8">Cargando progreso...</div>;
    if (progress.length === 0) return <div className="text-center p-8 text-muted-foreground">No hay registros de progreso.</div>;
    
    return (
      <MotionDiv variants={ListVariants} initial="hidden" animate="visible" className="space-y-3">
        {progress.map(item => (
          <MotionDiv variants={ItemVariants} key={item.id} className="bg-card p-4 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={item.profiles?.photo_url} alt={item.profiles?.display_name} />
                  <AvatarFallback>{item.profiles?.display_name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.profiles?.display_name}</p>
                   <p className="text-sm text-muted-foreground">
                    Completó: <span className="font-medium text-primary">{item.session?.title}</span> de {item.session?.week?.program?.name || 'un programa'}
                  </p>
                </div>
              </div>
              {item.completed_at && isValid(parseISO(item.completed_at)) &&
                <p className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(parseISO(item.completed_at), "dd MMM, yyyy - HH:mm", { locale: es })}
                </p>
              }
            </div>
            { (item.notes || item.real_rpe) &&
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                {item.real_rpe && <p><span className="font-semibold">RPE:</span> {item.real_rpe}</p>}
                {item.notes && <p><span className="font-semibold">Notas:</span> <span className="text-muted-foreground">{item.notes}</span></p>}
              </div>
            }
          </MotionDiv>
        ))}
      </MotionDiv>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-wider">Registros de Actividad</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="enrollments">Inscripciones a Programas</TabsTrigger>
          <TabsTrigger value="progress">Sesiones Completadas</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="enrollments" asChild>
            <MotionDiv
              key="enrollments"
              variants={TabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4"
            >
              {renderEnrollments()}
            </MotionDiv>
          </TabsContent>
          <TabsContent value="progress" asChild>
            <MotionDiv
              key="progress"
              variants={TabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4"
            >
              {renderProgress()}
            </MotionDiv>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default AdminRegistrations;