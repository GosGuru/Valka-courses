
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getActiveEnrollment, getTodaySession, getUserBadges, getUserPRs, getUserProfile, getAllSessionsForProgram, getSessionById, getEnrolledStudents, getProgramEnrolledStudents } from '@/lib/api';
import { supabase } from '@/lib/customSupabaseClient';
import SessionCompleteModal from '@/components/SessionCompleteModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CurrentBlock from '@/components/dashboard/CurrentBlock';
import TodaySession from '@/components/dashboard/TodaySession';
import ProgressHistory from '@/components/dashboard/ProgressHistory';
import QuickActions from '@/components/dashboard/QuickActions';
import ValkaAchievements from '@/components/dashboard/ValkaAchievements';
import QuickStats from '@/components/dashboard/QuickStats';
import EnrolledStudents from '@/components/dashboard/EnrolledStudents';

const Dashboard = () => {
  const { toast } = useToast();
  const { user, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [allProgramSessions, setAllProgramSessions] = useState([]);
  const [completedSessionIds, setCompletedSessionIds] = useState([]);
  const [badges, setBadges] = useState([]);
  const [prs, setPRs] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorState(false);

    try {
      const userProfile = await getUserProfile();
      setProfile(userProfile);

      const activeEnrollment = await getActiveEnrollment();
      setEnrollment(activeEnrollment);

      if (userProfile?.role === 'admin') {
        const enrolledStudents = await getEnrolledStudents();
        setStudents(enrolledStudents);
      } else if (activeEnrollment) {
        const sameProgramStudents = await getProgramEnrolledStudents(activeEnrollment.program_id);
        setStudents(sameProgramStudents);
      } else {
        setStudents([]);
      }

      if (activeEnrollment) {
        const [todaySessionData, allSessionsData, userBadges, userPRs] = await Promise.all([
          getTodaySession(activeEnrollment),
          getAllSessionsForProgram(activeEnrollment.program_id),
          getUserBadges(),
          getUserPRs(),
        ]);

        // Obtener sesiones completadas para esta inscripción (solo del attempt actual: completed_at >= started_at)
        const { data: completedRows } = await supabase
          .from('session_progress')
          .select('session_id, completed_at')
          .eq('enrollment_id', activeEnrollment.id)
          .eq('completed', true)
          .gte('completed_at', activeEnrollment.started_at);
        const completedIds = (completedRows || []).map(r => r.session_id);
        setCompletedSessionIds(completedIds);

        setAllProgramSessions(allSessionsData);
        setBadges(userBadges.slice(0, 4));
        setPRs(userPRs.slice(0, 5));

        if (todaySessionData && !todaySessionData.error) {
          setActiveSession(todaySessionData);
        } else {
          // Elegir primera sesión NO completada en orden de semanas/sesiones
            const nextSession = allSessionsData
              .flatMap(w => (w.sessions || []))
              .find(s => !completedIds.includes(s.id));
            if (nextSession) {
              const sData = await getSessionById(nextSession.id);
              setActiveSession(sData);
            } else if (todaySessionData?.error) {
              console.error("Error fetching today's session:", todaySessionData.error);
              setActiveSession({ error: "Could not load session." });
            } else if (allSessionsData.length > 0) {
              // Todo completado
              setActiveSession({ completedProgram: true });
            } else {
              setActiveSession({ noSessions: true });
            }
        }
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setErrorState(true);
      toast({
        title: "Error al cargar datos",
        description: "No se pudo cargar la información del dashboard. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, session]);

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData();
    }
  }, [authLoading, loadDashboardData]);

  const handleSessionSelect = async (sessionId) => {
    if (!sessionId) return;
    try {
      const sessionData = await getSessionById(sessionId);
      setActiveSession(sessionData);
    } catch (error) {
      console.error("Error fetching selected session:", error);
      toast({
        title: "Error al cargar sesión",
        description: "No se pudo obtener la información de la sesión seleccionada.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteSession = () => {
    if (activeSession && activeSession.exercises) {
      setShowCompleteModal(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 rounded-full border-t-transparent border-primary"
        />
      </div>
    );
  }
  
  if (errorState) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-destructive">¡Ups! Algo salió mal.</h2>
          <p className="mb-6 text-muted-foreground">No pudimos cargar los datos de tu dashboard.</p>
          <Button onClick={loadDashboardData}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!enrollment && profile?.role !== 'admin') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center h-full p-4"
      >
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center w-32 h-32 mx-auto rounded-full shadow-lg bg-gradient-to-br from-primary to-secondary shadow-primary/30">
            <Target className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">¡Comienza tu Transformación!</h2>
          <p className="max-w-md text-muted-foreground">
            Selecciona un programa de entrenamiento y comienza tu viaje hacia una versión más fuerte de ti mismo.
          </p>
          <Link to="/programs">
            <Button size="lg" className="px-8 py-3 text-lg transition-transform bg-primary hover:bg-primary/90 text-primary-foreground">
              <Target className="w-5 h-5 mr-2" />
              Elegir un Programa
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-6"
    >
      <DashboardHeader profile={profile} user={user} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {enrollment && <CurrentBlock enrollment={enrollment} />}
          {enrollment && <TodaySession 
            activeSession={activeSession}
            allSessions={allProgramSessions}
            completedSessionIds={completedSessionIds}
            onSessionSelect={handleSessionSelect}
            onCompleteSession={handleCompleteSession} 
          />}
          {enrollment && <ProgressHistory prs={prs} />}
          {profile?.role === 'admin' && !enrollment && (
            <div className="p-6 text-center border bg-card border-border rounded-xl">
              <h3 className="text-xl font-semibold">Modo Administrador</h3>
              <p className="mt-2 text-muted-foreground">No estás inscrito en ningún programa. Puedes ver la actividad de los alumnos a la derecha.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {profile?.role === 'admin' && students && students.length > 0 && (
            <EnrolledStudents students={students} isAdmin />
          )}
          {profile?.role !== 'admin' && (
            <>
              {enrollment && students && students.length > 0 && (
                <EnrolledStudents students={students} programId={enrollment.program_id} isAdmin={false} />
              )}
              <QuickActions />
              <ValkaAchievements badges={badges} />
              <QuickStats />
            </>
          )}
        </div>
      </div>

      {showCompleteModal && (
        <SessionCompleteModal
          session={activeSession}
          enrollment={enrollment}
          onClose={() => setShowCompleteModal(false)}
          onComplete={() => {
            setShowCompleteModal(false);
            loadDashboardData();
          }}
        />
      )}
    </motion.div>
  );
};

export default Dashboard;
