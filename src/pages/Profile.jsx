
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  User, 
  Trophy, 
  Settings,
  Award,
  TrendingUp,
  LogOut,
  Users2,
  UserPlus,
  Search,
  Check,
  X,
  Calendar,
  CheckCircle,
  MessageSquare,
  UserX,
  Plus,
  Pencil,
  Trash2,
  Target,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserProfile, getUserBadges, getUserPRs, getFriends, searchUsers, addFriend, removeFriend, respondToFriendRequest, getUserAchievements, getUserAchievementStats, createPR, updatePR, deletePR, getUserObjectives, createObjective, updateObjective, deleteObjective } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { isValid, format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const OBJECTIVE_FORM_DEFAULT = {
  id: null,
  title: '',
  description: '',
  status: 'in_progress',
  due_date: '',
};

const OBJECTIVE_STATUS_OPTIONS = [
  { value: 'in_progress', label: 'En progreso' },
  { value: 'paused', label: 'En pausa' },
  { value: 'completed', label: 'Completado' },
];

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

const OBJECTIVES_TABLE_SQL = `CREATE TABLE public.profile_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'in_progress',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profile_objectives_user_idx ON public.profile_objectives (user_id);
CREATE INDEX profile_objectives_status_idx ON public.profile_objectives (status);`;

const Profile = () => {
  const { toast } = useToast();
  const { user, signOut, session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [prs, setPRs] = useState([]);
  const [prForm, setPrForm] = useState({ id: null, type: '', value: '', unit: 'kg', date: '' });
  const [prSaving, setPrSaving] = useState(false);
  const [showBestOnly, setShowBestOnly] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState(new Set());
  const allowedUnits = ['kg','reps','seg','m','cm'];
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({ totalPrograms: 0, totalSessions: 0 });
  const [objectives, setObjectives] = useState([]);
  const [objectiveDialogOpen, setObjectiveDialogOpen] = useState(false);
  const [objectiveForm, setObjectiveForm] = useState({ ...OBJECTIVE_FORM_DEFAULT });
  const [objectiveSaving, setObjectiveSaving] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState(null);
  const [objectiveDeleting, setObjectiveDeleting] = useState(false);
  const [objectivesTableMissing, setObjectivesTableMissing] = useState(false);
  useEffect(()=> { console.log('[PR UI] Versión 1.1 cargada'); }, []);

  const loadData = useCallback(async () => {
    if (!session) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const [userProfile, userBadges, userPRs, friendsData, userAchievements, stats, userObjectives] = await Promise.all([
        getUserProfile(),
        getUserBadges(),
        getUserPRs(),
        getFriends(),
        getUserAchievements(),
        getUserAchievementStats(),
        getUserObjectives()
      ]);
      setProfile(userProfile);
      setBadges(userBadges);
      setPRs(userPRs);
      setFriends(friendsData.friends);
      setFriendRequests(friendsData.requests);
  setAchievements(userAchievements);
  setAchievementStats(stats);
  setObjectivesTableMissing(Boolean(userObjectives?.missingTable));
  setObjectives(Array.isArray(userObjectives) ? [...userObjectives] : []);
    } catch (error) {
      toast({
        title: "Error al cargar perfil",
        description: "No se pudo cargar tu información. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, session]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        return;
      }
      const results = await searchUsers(searchTerm);
      const friendsAndRequestsIds = [...friends.map(f => f.id), ...friendRequests.map(r => r.id)];
      const filteredResults = results.filter(r => r.id !== user.id && !friendsAndRequestsIds.includes(r.id));
      setSearchResults(filteredResults);
    };
    
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, friends, friendRequests, user]);

  const handleAddFriend = async (friendId) => {
    try {
      await addFriend(friendId);
      toast({ title: 'Solicitud enviada', description: 'Tu solicitud de amistad ha sido enviada.' });
      setSearchTerm(''); // Clear search
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // --- Helpers PRs ---
  const normalizeType = (t) => t.trim().toLowerCase().replace(/\s+/g,' ').split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');

  const prsByType = useMemo(() => {
    const map = {};
    prs.forEach(pr => {
      const type = pr.type || 'General';
      if(!map[type]) map[type] = [];
      map[type].push(pr);
    });
    // sort each list by date asc for sparkline; value desc for display order
    Object.keys(map).forEach(k => {
      map[k].sort((a,b)=> new Date(a.date||'1970-01-01') - new Date(b.date||'1970-01-01'));
    });
    return map;
  }, [prs]);

  const bestPRs = useMemo(() => {
    const result = [];
    Object.entries(prsByType).forEach(([type,list]) => {
      // best = max by value; if tie most recent
      const best = [...list].sort((a,b)=> b.value - a.value || new Date(b.date||'1970-01-01') - new Date(a.date||'1970-01-01'))[0];
      if (best) result.push(best);
    });
    // order by type alpha
    result.sort((a,b)=> a.type.localeCompare(b.type));
    return result;
  }, [prsByType]);

  const objectivesSorted = useMemo(() => {
    return [...objectives].sort((a, b) => {
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
  }, [objectives]);

  const objectiveStats = useMemo(() => {
    const summary = { total: objectives.length, active: 0, completed: 0, paused: 0 };
    objectives.forEach((obj) => {
      if (obj.status === 'completed') summary.completed += 1;
      else if (obj.status === 'paused') summary.paused += 1;
      else summary.active += 1;
    });
    return summary;
  }, [objectives]);

  const buildSparkline = (list, w=100, h=30) => {
    if (!list || list.length < 2) return null;
    const values = list.map(p=>p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = w / (values.length -1);
    let d = '';
    values.forEach((v,i)=>{
      const x = +(i*stepX).toFixed(2);
      const y = +((1 - (v - min)/span) * (h-4) + 2).toFixed(2);
      d += (i===0? 'M':'L') + x + ' ' + y + ' ';
    });
    return <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-6 text-green-400"><path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle r="3" cx={w} cy={+((1 - (values[values.length-1]-min)/span)*(h-4)+2).toFixed(2)} fill="currentColor" /></svg>;
  };
  
  const handleFriendRequest = async (friendId, accept) => {
    try {
      await respondToFriendRequest(friendId, accept);
      toast({ title: 'Solicitud respondida', description: `Has ${accept ? 'aceptado' : 'rechazado'} la solicitud.` });
      loadData(); // Reload data
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await removeFriend(friendId);
      toast({ title: 'Amigo eliminado', description: 'Se ha eliminado de tu lista de amigos.' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = (friend) => {
    toast({ title: 'Función en desarrollo', description: `Pronto podrás enviar mensajes a ${friend.display_name}.` });
  };

  const openObjectiveDialog = (objective = null) => {
    if (objectivesTableMissing) {
      toast({
        title: 'Configurar objetivos',
        description: 'Antes de crear objetivos, crea la tabla en Supabase usando las instrucciones inferiores.',
      });
      return;
    }
    if (objective) {
      setObjectiveForm({
        id: objective.id,
        title: objective.title || '',
        description: objective.description || '',
        status: objective.status || 'in_progress',
        due_date: objective.due_date ? objective.due_date.slice(0, 10) : '',
      });
    } else {
      setObjectiveForm({ ...OBJECTIVE_FORM_DEFAULT });
    }
    setObjectiveDialogOpen(true);
  };

  const closeObjectiveDialog = () => {
    setObjectiveDialogOpen(false);
    setObjectiveForm({ ...OBJECTIVE_FORM_DEFAULT });
  };

  const handleObjectiveSubmit = async (event) => {
    event.preventDefault();
    const title = objectiveForm.title.trim();
    if (!title) {
      toast({ title: 'Título requerido', description: 'Dale un nombre a tu objetivo.', variant: 'destructive' });
      return;
    }

    const cleanedDescription = objectiveForm.description?.trim();
    const payload = {
      title,
      description: cleanedDescription || null,
      status: objectiveForm.status,
      due_date: objectiveForm.due_date || null,
    };

    setObjectiveSaving(true);
    try {
      if (objectiveForm.id) {
        const updated = await updateObjective(objectiveForm.id, payload);
        setObjectives((prev) => prev.map((obj) => (obj.id === updated.id ? updated : obj)));
        toast({ title: 'Objetivo actualizado', description: 'Guardamos los cambios en tu objetivo.' });
      } else {
        const created = await createObjective(payload);
        setObjectives((prev) => [created, ...prev]);
        toast({ title: 'Objetivo creado', description: 'Nuevo objetivo agregado a tu perfil.' });
      }
      setObjectivesTableMissing(false);
      closeObjectiveDialog();
    } catch (error) {
      if (error.code === 'OBJECTIVES_TABLE_MISSING') {
        setObjectivesTableMissing(true);
      }
      toast({ title: 'No se pudo guardar', description: error.message || 'Intentá de nuevo más tarde.', variant: 'destructive' });
    } finally {
      setObjectiveSaving(false);
    }
  };

  const handleConfirmDeleteObjective = async () => {
    if (!objectiveToDelete) return;
    const title = objectiveToDelete.title;
    setObjectiveDeleting(true);
    try {
      await deleteObjective(objectiveToDelete.id);
      setObjectives((prev) => prev.filter((obj) => obj.id !== objectiveToDelete.id));
      toast({ title: 'Objetivo eliminado', description: `"${title}" ya no aparece en tu perfil.` });
    } catch (error) {
      if (error.code === 'OBJECTIVES_TABLE_MISSING') {
        setObjectivesTableMissing(true);
      }
      toast({ title: 'No se pudo eliminar', description: error.message || 'Intentá de nuevo más tarde.', variant: 'destructive' });
    } finally {
      setObjectiveDeleting(false);
      setObjectiveToDelete(null);
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading || authLoading) {
    return <div className="flex items-center justify-center h-full"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 rounded-full border-t-transparent border-primary" /></div>;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={cardVariants} className="space-y-6 lg:col-span-1">
          <div className="p-6 text-center border bg-card border-border rounded-xl">
            <Avatar className="w-24 h-24 mx-auto mb-4"><AvatarImage src={profile?.photo_url} alt={profile?.display_name} /><AvatarFallback className="text-3xl font-bold ">{profile?.display_name?.charAt(0)?.toUpperCase() || 'V'}</AvatarFallback></Avatar>
            <h2 className="mb-1 text-2xl font-bold">{profile?.display_name || user?.email}</h2>
            <p className="mb-4 capitalize text-muted-foreground">Rol: {profile?.role || 'Usuario'}</p>
            <Link to="/profile/edit" className="block w-full"><Button className="w-full bg-primary text-primary-foreground"><Settings className="w-4 h-4 mr-2" />Editar Perfil</Button></Link>
            <Button onClick={signOut} variant="outline" className="w-full mt-2"><LogOut className="w-4 h-4 mr-2" />Cerrar Sesión</Button>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="objectives">Objetivos</TabsTrigger>
              <TabsTrigger value="achievements">Logros</TabsTrigger>
              <TabsTrigger value="prs">PRs</TabsTrigger>
              <TabsTrigger value="friends">Amigos</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="p-6 mt-4 border bg-card border-border rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 font-bold"><Award className="w-5 h-5 text-yellow-400" />Logros Recientes</h3>
                <div className="space-y-3">
                  {badges.slice(0, 3).map((badge, index) => <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent"><div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20"><Trophy className="w-5 h-5 text-yellow-400" /></div><div className="flex-1"><p className="text-sm font-medium">{badge.name}</p></div><span className="text-xs font-bold text-yellow-400">+{badge.points}</span></div>)}
                  {badges.length === 0 && <p className="py-4 text-sm text-center text-muted-foreground">Aún no has ganado logros.</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="objectives">
              <div className="p-6 mt-4 border bg-card border-border rounded-xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold"><Target className="w-5 h-5 text-primary" />Objetivos personales</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-prose">Define metas claras para tu entrenamiento y mantenelas visibles para hacer seguimiento de tu progreso.</p>
                  </div>
                  <Button onClick={() => openObjectiveDialog()} className="inline-flex items-center gap-2" disabled={objectivesTableMissing}>
                    <Plus className="w-4 h-4" />
                    Nuevo objetivo
                  </Button>
                </div>

                {objectivesTableMissing && (
                  <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 text-amber-100">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-200">
                      <Target className="w-4 h-4" /> Configurá la tabla de objetivos
                    </h4>
                    <p className="mt-2 text-sm text-amber-100/90">
                      Necesitás crear la tabla <code className="px-1 py-0.5 rounded bg-amber-500/20">profile_objectives</code> en Supabase. Ejecutá este script en el SQL editor y luego recargá la página:
                    </p>
                    <div className="mt-3 rounded-xl border border-amber-400/30 bg-black/30">
                      <pre className="overflow-x-auto whitespace-pre-wrap p-4 text-xs text-amber-100/90">{OBJECTIVES_TABLE_SQL}</pre>
                      <div className="flex justify-end border-t border-amber-400/30 bg-black/40 px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-amber-100 hover:bg-amber-500/20"
                          onClick={() => navigator.clipboard.writeText(OBJECTIVES_TABLE_SQL)}
                        >
                          <Copy className="h-4 w-4" /> Copiar SQL
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-amber-100/80">
                      El disparador de actualización es opcional; el backend actual ya actualiza <code>updated_at</code> automáticamente.
                    </p>
                  </div>
                )}

                {!objectivesTableMissing && objectivesSorted.length > 0 ? (
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
                        <div key={objective.id} className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] via-white/[0.02] to-transparent p-5 shadow-lg">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusMeta.badgeClass}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusMeta.label}
                              </span>
                              <h4 className="mt-3 text-lg font-semibold text-white">{objective.title}</h4>
                              {objective.description && (
                                <p className="mt-2 text-sm leading-relaxed text-white/70">{objective.description}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="text-white/70 hover:text-white" onClick={() => openObjectiveDialog(objective)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setObjectiveToDelete(objective)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
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
                ) : !objectivesTableMissing ? (
                  <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
                    <Target className="w-10 h-10 text-white/40" />
                    <div>
                      <p className="text-base font-semibold text-white">Todavía no registraste objetivos</p>
                      <p className="mt-2 text-sm text-white/60">Creá tu primer objetivo para que la comunidad conozca en qué estás trabajando.</p>
                    </div>
                    <Button variant="outline" onClick={() => openObjectiveDialog()} className="border-white/30 text-white hover:bg-white/10">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear objetivo
                    </Button>
                  </div>
                ) : null}

                {!objectivesTableMissing && (
                  <div className="flex flex-wrap gap-3 mt-6 text-xs text-white/50">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"><TrendingUp className="w-3.5 h-3.5" /> {objectiveStats.active} activos</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"><PauseCircle className="w-3.5 h-3.5" /> {objectiveStats.paused} en pausa</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1"><CheckCircle2 className="w-3.5 h-3.5" /> {objectiveStats.completed} completados</span>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="achievements">
              <div className="p-6 mt-4 border bg-card border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <Award className="w-5 h-5 text-primary" />
                    Programas Completados
                  </h3>
                  <div className="text-sm text-right text-muted-foreground">
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
                          className="p-4 border rounded-lg bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20">
                                <Trophy className="w-6 h-6 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="flex items-center gap-2 font-bold text-green-400">
                                  <CheckCircle className="w-4 h-4" />
                                  {achievement.program.name}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
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
                  <div className="py-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aún no has completado ningún programa.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ¡Inscríbete en un programa y comienza tu transformación!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="prs">
              <div className="p-6 mt-4 space-y-6 border bg-card border-border rounded-xl">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold"><Trophy className="w-5 h-5 text-green-400" />Récords Personales <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-300 tracking-wide">v1.1</span></h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-prose">Registra y comparte tus mejores marcas. Puedes alternar entre ver tu mejor marca por ejercicio o el historial completo.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={showBestOnly? 'default':'outline'} size="sm" onClick={()=> setShowBestOnly(true)}>Mejores</Button>
                    <Button variant={!showBestOnly? 'default':'outline'} size="sm" onClick={()=> setShowBestOnly(false)}>Historial</Button>
                  </div>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  // Validaciones
                  const rawType = prForm.type.trim();
                  if (!rawType) { toast({ title:'Tipo requerido', description:'Ingresa el ejercicio.', variant:'destructive'}); return; }
                  const normType = normalizeType(rawType);
                  const numVal = parseFloat(prForm.value);
                  if (isNaN(numVal) || numVal <= 0) { toast({ title:'Valor inválido', description:'Debe ser un número > 0.', variant:'destructive'}); return; }
                  if (prForm.unit && !allowedUnits.includes(prForm.unit)) { toast({ title:'Unidad no permitida', description:`Usa: ${allowedUnits.join(', ')}`, variant:'destructive'}); return; }
                  setPrSaving(true);
                  try {
                    if (prForm.id) {
                      const updated = await updatePR(prForm.id, { type: normType, value: numVal, unit: prForm.unit, date: prForm.date });
                      setPRs(prev => prev.map(p => p.id === updated.id ? updated : p));
                      toast({ title:'PR actualizado', description:`${updated.type}: ${updated.value} ${updated.unit||''}` });
                    } else {
                      const created = await createPR({ type: normType, value: numVal, unit: prForm.unit, date: prForm.date });
                      setPRs(prev => [created, ...prev]);
                      toast({ title:'PR registrado', description:`${created.type}: ${created.value} ${created.unit||''}` });
                    }
                    setPrForm({ id: null, type: '', value: '', unit: 'kg', date: '' });
                  } catch (err) {
                    toast({ title:'Error', description: err.message, variant:'destructive'});
                  } finally { setPrSaving(false); }
                }} className="grid items-end gap-3 md:grid-cols-6">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold tracking-wide uppercase">Ejercicio</label>
                    <Input value={prForm.type} onChange={e => setPrForm(f => ({ ...f, type: e.target.value }))} placeholder="Dominadas, Sentadilla..." required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide uppercase">Valor</label>
                    <Input type="number" min="0" step="0.5" value={prForm.value} onChange={e => setPrForm(f => ({ ...f, value: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide uppercase">Unidad</label>
                    <Select value={prForm.unit} onValueChange={(v)=> setPrForm(f=> ({...f, unit:v}))}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {allowedUnits.map(u=> <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-wide uppercase">Fecha</label>
                    <Input type="date" value={prForm.date} onChange={e => setPrForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <Button type="submit" disabled={prSaving} className="min-w-[140px]">{prForm.id ? 'Actualizar PR' : 'Guardar PR'}</Button>
                    {prForm.id && <Button type="button" variant="outline" onClick={() => setPrForm({ id: null, type: '', value: '', unit: 'kg', date: '' })}>Cancelar</Button>}
                  </div>
                </form>
                <div className="space-y-3">
                  {showBestOnly ? (
                    bestPRs.length > 0 ? bestPRs.map(pr => {
                      const historyList = prsByType[pr.type] || [];
                      return (
                        <div key={pr.id} className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-accent" onClick={()=> setExpandedTypes(prev => { const n = new Set(prev); n.has(pr.type)? n.delete(pr.type): n.add(pr.type); return n; })}>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20"><Trophy className="w-5 h-5 text-green-400" /></div>
                            <div>
                              <p className="font-medium">{pr.type}</p>
                              {pr.date && isValid(new Date(pr.date)) && <p className="text-xs text-muted-foreground">{new Date(pr.date).toLocaleDateString()}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {buildSparkline(historyList)}
                            <p className="text-lg font-bold text-green-400 whitespace-nowrap">{pr.value} {pr.unit}</p>
                          </div>
                        </div>
                      );
                    }) : <p className="py-4 text-sm text-center text-muted-foreground">Aún no has registrado Récords Personales.</p>
                  ) : (
                    prs.length > 0 ? prs.map(pr => (
                      <div key={pr.id} className="flex items-center justify-between p-4 rounded-lg bg-accent group">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20"><Trophy className="w-5 h-5 text-green-400" /></div>
                          <div>
                            <p className="font-medium">{pr.type}</p>
                            {pr.date && isValid(new Date(pr.date)) && <p className="text-xs text-muted-foreground">{new Date(pr.date).toLocaleDateString()}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-green-400 whitespace-nowrap">{pr.value} {pr.unit}</p>
                          <div className="flex gap-2 transition opacity-0 group-hover:opacity-100">
                            <Button size="sm" variant="outline" onClick={() => setPrForm({ id: pr.id, type: pr.type, value: pr.value, unit: pr.unit || 'kg', date: pr.date || '' })}>Editar</Button>
                            <Button size="sm" variant="destructive" onClick={async () => { if (window.confirm('¿Eliminar PR?')) { await deletePR(pr.id); setPRs(prev => prev.filter(p => p.id !== pr.id)); toast({ title:'PR eliminado'}); } }}>Borrar</Button>
                          </div>
                        </div>
                      </div>
                    )) : <p className="py-4 text-sm text-center text-muted-foreground">Aún no has registrado Récords Personales.</p>
                  )}
                  {/* Historial expandido para tipos cuando estamos en modo Mejores */}
                  {showBestOnly && Array.from(expandedTypes).map(type => {
                    const list = prsByType[type];
                    if (!list) return null;
                    return (
                      <div key={type} className="p-4 border rounded-lg bg-accent/70 border-border">
                        <p className="mb-2 text-sm font-semibold">Historial {type}</p>
                        <div className="space-y-1">
                          {[...list].sort((a,b)=> new Date(b.date||'1970-01-01') - new Date(a.date||'1970-01-01')).map(item => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span>{item.value} {item.unit}</span>
                              <span className="text-muted-foreground">{item.date ? new Date(item.date).toLocaleDateString(): ''}</span>
                              <div className="flex gap-2 transition opacity-0 hover:opacity-100">
                                <Button size="xs" variant="outline" className="h-6 px-2" onClick={()=> setPrForm({ id:item.id, type:item.type, value:item.value, unit:item.unit||'kg', date:item.date||'' })}>Editar</Button>
                                <Button size="xs" variant="destructive" className="h-6 px-2" onClick={async()=> { if(window.confirm('¿Eliminar PR?')) { await deletePR(item.id); setPRs(prev=> prev.filter(p=> p.id !== item.id)); toast({ title:'PR eliminado'}); } }}>X</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="friends">
              <div className="p-6 mt-4 space-y-6 border bg-card border-border rounded-xl">
                <div>
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold"><UserPlus className="w-5 h-5 text-primary" />Buscar Amigos</h3>
                  <div className="relative"><Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" /><Input placeholder="Buscar por nombre..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                  <div className="mt-4 space-y-2">
                    {searchResults.map(res => (
                      <div key={res.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-accent/80 hover:bg-accent transition-colors">
                        <Link to={`/profile/${res.id}`} className="flex items-center flex-1 min-w-0 gap-2 text-left hover:underline">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={res.photo_url} />
                            <AvatarFallback>{res.display_name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">{res.display_name}</span>
                        </Link>
                        <Button size="sm" onClick={() => handleAddFriend(res.id)}>Agregar</Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold">Solicitudes Pendientes ({friendRequests.length})</h3>
                  <div className="space-y-2">
                    {friendRequests.length > 0 ? friendRequests.map(req => <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-accent"><div className="flex items-center gap-2"><Avatar className="w-8 h-8"><AvatarImage src={req.photo_url} /><AvatarFallback>{req.display_name.charAt(0)}</AvatarFallback></Avatar><span>{req.display_name}</span></div><div className="flex gap-2"><Button size="icon" className="w-8 h-8 bg-green-500 hover:bg-green-600" onClick={() => handleFriendRequest(req.id, true)}><Check className="w-4 h-4" /></Button><Button size="icon" variant="destructive" className="w-8 h-8" onClick={() => handleFriendRequest(req.id, false)}><X className="w-4 h-4" /></Button></div></div>) : <p className="text-sm text-center text-muted-foreground">No tienes solicitudes pendientes.</p>}
                  </div>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold"><Users2 className="w-5 h-5 text-primary" />Mis Amigos ({friends.length})</h3>
                  <div className="space-y-2">
                    {friends.length > 0 ? friends.map(friend => (
                      <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg bg-accent">
                        <Link to={`/profile/${friend.id}`} className="flex items-center flex-1 min-w-0 gap-2 hover:underline">
                          <Avatar className="w-8 h-8"><AvatarImage src={friend.photo_url} /><AvatarFallback>{friend.display_name.charAt(0)}</AvatarFallback></Avatar>
                          <span className="truncate">{friend.display_name}</span>
                        </Link>
                        <div className="flex items-center gap-2 ml-2">
                          <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => handleSendMessage(friend)} title="Enviar mensaje">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="destructive" className="w-8 h-8" onClick={() => handleRemoveFriend(friend.id)} title="Eliminar amigo">
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )) : <p className="text-sm text-center text-muted-foreground">Aún no tienes amigos.</p>}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog
            open={objectiveDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                closeObjectiveDialog();
              } else {
                setObjectiveDialogOpen(true);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{objectiveForm.id ? 'Editar objetivo' : 'Nuevo objetivo'}</DialogTitle>
                <DialogDescription>
                  Fijá un objetivo concreto para guiar tus entrenamientos. Podés actualizarlo o marcarlo como completado cuando lo logres.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleObjectiveSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide">Título</label>
                  <Input
                    value={objectiveForm.title}
                    onChange={(e) => setObjectiveForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Lograr 5 dominadas estrictas"
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide">Descripción</label>
                  <Textarea
                    value={objectiveForm.description}
                    onChange={(e) => setObjectiveForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Agregá detalles que te ayuden a seguir el plan: frecuencia, métricas, recordatorios..."
                    rows={4}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide">Estado</label>
                    <Select
                      value={objectiveForm.status}
                      onValueChange={(value) => setObjectiveForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {OBJECTIVE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide">Fecha objetivo</label>
                    <Input
                      type="date"
                      value={objectiveForm.due_date}
                      onChange={(e) => setObjectiveForm((prev) => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={closeObjectiveDialog} disabled={objectiveSaving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={objectiveSaving}>
                    {objectiveForm.id ? 'Guardar cambios' : 'Crear objetivo'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog
            open={!!objectiveToDelete}
            onOpenChange={(open) => {
              if (!open && !objectiveDeleting) {
                setObjectiveToDelete(null);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer y el objetivo desaparecerá para toda la comunidad.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={objectiveDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmDeleteObjective}
                  disabled={objectiveDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
  