
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getActiveEnrollment, getTodaySession, getUserBadges, getUserPRs, getUserProfile, getAllSessionsForProgram, getSessionById, getEnrolledStudents, getProgramEnrolledStudents, getAllEnrolledStudents } from '@/lib/api';
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
  
  // Caché para estudiantes
  const [studentsCache, setStudentsCache] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Función para obtener estudiantes con caché
  const fetchStudents = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const CACHE_DURATION = 60000; // 60 segundos
    
    // Usar caché si existe y no ha expirado
    if (!forceRefresh && studentsCache && (now - lastFetchTime < CACHE_DURATION)) {
      console.log('Using cached students data');
      setStudents(studentsCache);
      return studentsCache;
    }
    
    try {
      let fetchedStudents = [];
      
      // Tanto admin como usuarios normales ven TODOS los estudiantes inscritos
      if (profile?.role === 'admin') {
        console.log('Fetching all enrolled students (admin with RPC)');
        fetchedStudents = await getEnrolledStudents();
      } else {
        // Usuarios normales también ven TODOS los estudiantes (sin filtrar por programa)
        console.log('Fetching all enrolled students (public)');
        fetchedStudents = await getAllEnrolledStudents(); // Sin pasar programId
      }
      
      console.log('Fetched students:', fetchedStudents.length);
      
      // Cargar roles de todos los usuarios
      if (fetchedStudents.length > 0) {
        const userIds = fetchedStudents.map(s => s.id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, role')
          .in('id', userIds);
        
        if (profiles) {
          // Añadir el rol a cada estudiante
          fetchedStudents = fetchedStudents.map(student => {
            const profileData = profiles.find(p => p.id === student.id);
            return {
              ...student,
              role: profileData?.role || 'user'
            };
          });
        }
      }
      
      setStudents(fetchedStudents);
      setStudentsCache(fetchedStudents);
      setLastFetchTime(now);
      return fetchedStudents;
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      return [];
    }
  }, [profile?.role, enrollment?.program_id]);

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

      // Fetch students después de tener profile y enrollment
      // Se ejecutará automáticamente por el useEffect de abajo

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
  }, [toast, session, fetchStudents]);

  // useEffect optimizado con debounce para fetch de estudiantes
  useEffect(() => {
    if (!profile && !enrollment) return;
    
    // Invalidar caché cuando cambia el enrollment para forzar refresh
    setStudentsCache(null);
    setLastFetchTime(0);
    
    const timeoutId = setTimeout(() => {
      fetchStudents(true); // Forzar refresh cuando cambia enrollment
    }, 100); // Pequeño debounce para evitar llamadas múltiples
    
    return () => clearTimeout(timeoutId);
  }, [enrollment?.id, enrollment?.program_id, profile?.role]);

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

  // Memoizar el programa name (DEBE estar antes de cualquier return)
  const programName = useMemo(() => {
    if (profile?.role === 'admin') return 'Todos los programas';
    return enrollment?.program?.name || enrollment?.program_name || 'Mi Programa';
  }, [profile?.role, enrollment?.program?.name, enrollment?.program_name]);

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
      className="p-3 space-y-4 sm:p-4 sm:space-y-6"
    >
      <DashboardHeader profile={profile} user={user} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
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

        <div className="space-y-4 sm:space-y-6">
          {profile?.role === 'admin' && (
            <EnrolledStudents 
              students={students || []} 
              studentsCount={students?.length || 0}
              isAdmin 
              programName={programName}
              onRefresh={() => fetchStudents(true)}
            />
          )}
          {profile?.role !== 'admin' && (
            <>
              {enrollment && (
                <EnrolledStudents 
                  students={students || []} 
                  studentsCount={students?.length || 0}
                  programName={programName}
                  isAdmin={false}
                  onRefresh={() => fetchStudents(true)}
                />
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
