
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getActiveEnrollment, getTodaySession, getUserBadges, getUserPRs, getUserProfile, getAllSessionsForProgram, getSessionById, getEnrolledStudents } from '@/lib/api';
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
      }

      if (activeEnrollment) {
        const [todaySessionData, allSessionsData, userBadges, userPRs] = await Promise.all([
          getTodaySession(activeEnrollment),
          getAllSessionsForProgram(activeEnrollment.program_id),
          getUserBadges(),
          getUserPRs(),
        ]);

        setAllProgramSessions(allSessionsData);
        setBadges(userBadges.slice(0, 4));
        setPRs(userPRs.slice(0, 5));

        if (todaySessionData && !todaySessionData.error) {
          setActiveSession(todaySessionData);
        } else if (todaySessionData?.error) {
          console.error("Error fetching today's session:", todaySessionData.error);
          setActiveSession({ error: "Could not load session." });
        } else if (allSessionsData.length > 0 && allSessionsData[0].sessions.length > 0) {
          const firstSession = await getSessionById(allSessionsData[0].sessions[0].id);
          setActiveSession(firstSession);
        } else {
          setActiveSession({ noSessions: true });
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
      <div className="h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full"
        />
      </div>
    );
  }
  
  if (errorState) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-destructive mb-4">¡Ups! Algo salió mal.</h2>
          <p className="text-muted-foreground mb-6">No pudimos cargar los datos de tu dashboard.</p>
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
        className="h-full flex items-center justify-center p-4"
      >
        <div className="text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
            <Target className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">¡Comienza tu Transformación!</h2>
          <p className="text-muted-foreground max-w-md">
            Selecciona un programa de entrenamiento y comienza tu viaje hacia una versión más fuerte de ti mismo.
          </p>
          <Link to="/programs">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground transition-transform px-8 py-3 text-lg">
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
      className="space-y-6 p-4"
    >
      <DashboardHeader profile={profile} user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {enrollment && <CurrentBlock enrollment={enrollment} />}
          {enrollment && <TodaySession 
            activeSession={activeSession}
            allSessions={allProgramSessions}
            onSessionSelect={handleSessionSelect}
            onCompleteSession={handleCompleteSession} 
          />}
          {enrollment && <ProgressHistory prs={prs} />}
          {profile?.role === 'admin' && !enrollment && (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold">Modo Administrador</h3>
              <p className="text-muted-foreground mt-2">No estás inscrito en ningún programa. Puedes ver la actividad de los alumnos a la derecha.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
           {profile?.role === 'admin' && students && students.length > 0 && (
             <EnrolledStudents students={students} />
           )}
           {profile?.role !== 'admin' && (
            <>
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
