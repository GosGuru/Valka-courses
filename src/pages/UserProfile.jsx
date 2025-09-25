
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Trophy, 
  Target, 
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  Award,
  Calendar,
  CheckCircle,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPublicUserProfile, addFriend, respondToFriendRequest, getUserAchievements, getUserAchievementStats } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const OBJECTIVE_STATUS_VARIANTS = {
  in_progress: {
    label: 'En progreso',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    icon: TrendingUp,
  },
  paused: {
    label: 'En pausa',
    badgeClass: 'border-slate-400/40 bg-slate-500/10 text-slate-200',
    icon: PauseCircle,
  },
  completed: {
    label: 'Completado',
    badgeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    icon: CheckCircle2,
  },
};

const OBJECTIVE_STATUS_ORDER = {
  in_progress: 0,
  paused: 1,
  completed: 2,
};

const UserProfile = () => {
  const { id: userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({ totalPrograms: 0, totalSessions: 0 });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [data, userAchievements, stats] = await Promise.all([
        getPublicUserProfile(userId),
        getUserAchievements(userId),
        getUserAchievementStats(userId)
      ]);
      setProfileData(data);
      setAchievements(userAchievements);
      setAchievementStats(stats);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo cargar el perfil del usuario.', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [userId, toast, navigate]);

  useEffect(() => {
    if (userId === user?.id) {
      navigate('/profile');
    } else {
      loadProfile();
    }
  }, [userId, user, navigate, loadProfile]);
  
  const handleAddFriend = async () => {
    try {
      await addFriend(userId);
      toast({ title: 'Solicitud enviada', description: 'Tu solicitud de amistad ha sido enviada.' });
      loadProfile();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = () => {
    toast({
      title: '🚧 Función en desarrollo',
      description: 'La mensajería directa estará disponible pronto.',
    });
  };

  const renderFriendshipButton = () => {
    if (!profileData?.friendship) {
      return (
        <Button onClick={handleAddFriend}>
          <UserPlus className="mr-2 h-4 w-4" /> Agregar Amigo
        </Button>
      );
    }
    switch (profileData.friendship.status) {
      case 'pending':
        return <Button disabled variant="outline"><UserCheck className="mr-2 h-4 w-4" /> Solicitud Pendiente</Button>;
      case 'accepted':
        return <Button variant="secondary"><UserCheck className="mr-2 h-4 w-4" /> Amigos</Button>;
      case 'blocked':
        return <Button disabled variant="destructive"><UserX className="mr-2 h-4 w-4" /> Bloqueado</Button>;
      default:
        return null;
    }
  };

  const objectivesRaw = profileData?.objectives ?? [];
  const objectivesMissing = Boolean(profileData?.objectivesMissing);

  const objectivesSorted = useMemo(() => {
    return [...objectivesRaw].sort((a, b) => {
      const statusDiff = (OBJECTIVE_STATUS_ORDER[a?.status] ?? 99) - (OBJECTIVE_STATUS_ORDER[b?.status] ?? 99);
      if (statusDiff !== 0) return statusDiff;

      if (a?.due_date && b?.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (a?.due_date) return -1;
      if (b?.due_date) return 1;

      const aCreated = a?.created_at ? new Date(a.created_at) : new Date(0);
      const bCreated = b?.created_at ? new Date(b.created_at) : new Date(0);
      return aCreated - bCreated;
    });
  }, [objectivesRaw]);

  const objectiveStats = useMemo(() => {
    const summary = { total: objectivesRaw.length, active: 0, paused: 0, completed: 0 };
    objectivesRaw.forEach((obj) => {
      if (obj.status === 'completed') summary.completed += 1;
      else if (obj.status === 'paused') summary.paused += 1;
      else summary.active += 1;
    });
    return summary;
  }, [objectivesRaw]);

  if (loading || !profileData) {
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

  const { profile, activeEnrollment, recentProgress, prs } = profileData;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6">
      <div className="relative">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="absolute top-0 left-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <motion.div variants={cardVariants} className="bg-card border border-border rounded-xl p-6 pt-16">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 text-4xl">
              <AvatarImage src={profile.photo_url} alt={profile.display_name} />
              <AvatarFallback>{profile.display_name?.charAt(0)?.toUpperCase() || 'V'}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">{profile.display_name}</h1>
              {profile.created_at && isValid(new Date(profile.created_at)) &&
                <p className="text-muted-foreground">Miembro desde {format(new Date(profile.created_at), 'MMMM yyyy', { locale: es })}</p>
              }
            </div>
            <div className="md:ml-auto flex gap-2 pt-4 md:pt-0">
              {renderFriendshipButton()}
              <Button variant="outline" onClick={handleSendMessage}>
                <MessageSquare className="mr-2 h-4 w-4" /> Mensaje
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={cardVariants} className="mt-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Programa Actual</TabsTrigger>
            <TabsTrigger value="objectives">Objetivos</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="progress">Historial</TabsTrigger>
            <TabsTrigger value="prs">PRs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              {activeEnrollment ? (
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Programa Activo</h3>
                  <div className="mt-4 p-4 bg-accent rounded-lg">
                    <p className="text-lg font-semibold text-primary">{activeEnrollment.program.name}</p>
                    {activeEnrollment.started_at && isValid(new Date(activeEnrollment.started_at)) &&
                      <p className="text-sm text-muted-foreground">Inscrito el {format(new Date(activeEnrollment.started_at), 'dd MMM, yyyy', { locale: es })}</p>
                    }
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Este usuario no está inscrito en ningún programa actualmente.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="objectives" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Objetivos publicados
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.display_name?.split(' ')[0] || 'El usuario'} comparte estas metas para mantenerse enfocado.
                  </p>
                </div>
                {!objectivesMissing && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {objectiveStats.active} activos
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                      <PauseCircle className="w-3.5 h-3.5" /> {objectiveStats.paused} en pausa
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {objectiveStats.completed} completados
                    </span>
                  </div>
                )}
              </div>

              {objectivesMissing ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-accent/20 px-6 py-10 text-center text-sm text-muted-foreground">
                  <Target className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  Este perfil todavía no tiene la tabla de objetivos configurada.
                </div>
              ) : objectivesSorted.length > 0 ? (
                <div className="grid gap-4 mt-6 md:grid-cols-2 xl:grid-cols-3">
                  {objectivesSorted.map((objective) => {
                    const statusMeta = OBJECTIVE_STATUS_VARIANTS[objective.status] || OBJECTIVE_STATUS_VARIANTS.in_progress;
                    const StatusIcon = statusMeta.icon;
                    const dueDateLabel = objective.due_date && isValid(new Date(objective.due_date))
                      ? format(new Date(objective.due_date), 'dd MMM yyyy', { locale: es })
                      : null;
                    const updatedLabel = objective.updated_at && isValid(new Date(objective.updated_at))
                      ? format(new Date(objective.updated_at), 'dd MMM yyyy', { locale: es })
                      : null;

                    return (
                      <div key={objective.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-white/[0.02] p-5">
                        <div>
                          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta.badgeClass}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusMeta.label}
                          </span>
                          <h4 className="mt-3 text-lg font-semibold">{objective.title}</h4>
                          {objective.description && (
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{objective.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <CalendarClock className="w-4 h-4" />
                            {dueDateLabel ? `Meta para ${dueDateLabel}` : 'Sin fecha objetivo'}
                          </span>
                          {updatedLabel && (
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Actualizado {updatedLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-accent/20 px-6 py-12 text-center">
                  <Target className="w-10 h-10 text-muted-foreground" />
                  <div>
                    <p className="text-base font-semibold text-foreground">Sin objetivos publicados por ahora</p>
                    <p className="mt-2 text-sm text-muted-foreground">Cuando comparta sus metas, aparecerán aquí para inspirar a la comunidad.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Logros Completados
                </h3>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{achievementStats.totalPrograms} programas completados</p>
                  <p>{achievementStats.totalSessions} sesiones totales</p>
                </div>
              </div>
              
              {achievements.length > 0 ? (
                <div className="space-y-4">
                  {achievements.map((achievement) => {
                    const duration = achievement.started_at && achievement.completed_at
                      ? differenceInDays(new Date(achievement.completed_at), new Date(achievement.started_at))
                      : 0;

                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gradient-to-r from-green-500/10 to-primary/10 border border-green-500/20 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {achievement.program.name}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {achievement.program.description || 'Programa de entrenamiento completado'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {achievement.completed_at && isValid(new Date(achievement.completed_at))
                                    ? `Completado el ${format(new Date(achievement.completed_at), 'dd MMM, yyyy', { locale: es })}`
                                    : 'Fecha no disponible'
                                  }
                                </span>
                                {duration > 0 && (
                                  <span>• Duración: {duration} días</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">
                              {achievement.completed_sessions} sesiones
                            </p>
                            <p className="text-xs text-muted-foreground">completadas</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Este usuario aún no ha completado ningún programa.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Los logros aparecerán aquí cuando complete sus primeros programas.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Progreso Reciente</h3>
              <div className="space-y-3">
                {recentProgress.length > 0 ? (
                  recentProgress.map(item => (
                    <div key={item.id} className="p-3 bg-accent rounded-lg">
                      <p>Completó <span className="font-semibold text-primary">{item.session.title}</span></p>
                      {item.completed_at && isValid(new Date(item.completed_at)) &&
                        <p className="text-xs text-muted-foreground">{format(new Date(item.completed_at), "dd MMM, yyyy 'a las' HH:mm", { locale: es })}</p>
                      }
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No hay registros de progreso recientes.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prs" className="mt-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Récords Personales</h3>
              <div className="space-y-4">
                {prs.length > 0 ? (
                  prs.map((pr, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="font-medium">{pr.type}</p>
                          {pr.date && isValid(new Date(pr.date)) &&
                            <p className="text-sm text-muted-foreground">{format(new Date(pr.date), 'dd MMM, yyyy', { locale: es })}</p>
                          }
                        </div>
                      </div>
                      <p className="font-bold text-lg text-green-400">{pr.value} {pr.unit}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">Este usuario no ha registrado PRs.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default UserProfile;
  