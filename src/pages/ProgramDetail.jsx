
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  Users, 
  Star,
  Play,
  CheckCircle,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProgramById, enrollInProgram, getActiveEnrollment, unenrollFromProgram } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const weekDays = [
  { id: 'Mon', label: 'Lunes' },
  { id: 'Tue', label: 'Martes' },
  { id: 'Wed', label: 'Miércoles' },
  { id: 'Thu', label: 'Jueves' },
  { id: 'Fri', label: 'Viernes' },
  { id: 'Sat', label: 'Sábado' },
  { id: 'Sun', label: 'Domingo' },
];

const ProgramDetail = ({ onEnrollClick }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [program, setProgram] = useState(null);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  // Modal para salir del programa (desinscripción)
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [unenrollFeedback, setUnenrollFeedback] = useState({
    reason: '',
    goal: '',
    recommend: false,
    comments: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const programData = await getProgramById(id);
      setProgram(programData);
      if (session) {
        const currentEnrollment = await getActiveEnrollment();
        setActiveEnrollment(currentEnrollment);
      }
    } catch (error) {
      toast({
        title: "Error al cargar programa",
        description: "No se pudo cargar la información del programa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast, session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDayToggle = (dayId) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const setPresetDays = (sessionsPerWeek) => {
    if (sessionsPerWeek <= 2) setSelectedDays(['Mon', 'Thu']);
    else if (sessionsPerWeek === 3) setSelectedDays(['Mon', 'Wed', 'Fri']);
    else if (sessionsPerWeek === 4) setSelectedDays(['Mon', 'Tue', 'Thu', 'Fri']);
    else setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  const handleOpenEnrollModal = () => {
    if (!session) {
      onEnrollClick();
      return;
    }
    setPresetDays(program.sessions_per_week);
    setIsEnrollModalOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (selectedDays.length === 0) {
      toast({ title: "Selecciona al menos un día", variant: "destructive" });
      return;
    }
    try {
      await enrollInProgram(id, selectedDays);
      toast({
        title: "🎉 ¡Inscripción Exitosa!",
        description: "Te has inscrito al programa. ¡Comienza tu transformación ahora!"
      });
      setIsEnrollModalOpen(false);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error de Inscripción",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Abrir modal de desinscripción
  const handleOpenUnenrollModal = () => {
    setUnenrollFeedback({ reason: '', goal: '', recommend: false, comments: '' });
    setIsUnenrollModalOpen(true);
  };

  // Confirmar desinscripción
  const handleConfirmUnenroll = async () => {
    if (!activeEnrollment?.id) {
      toast({ variant: 'destructive', title: 'No se encontró inscripción activa' });
      return;
    }
    setUnenrolling(true);
    try {
      await unenrollFromProgram(activeEnrollment.id, unenrollFeedback);
      toast({ title: 'Has salido del programa', description: 'Tu inscripción ha sido cancelada. ¡Te esperamos de vuelta en Valka cuando quieras!' });
      setIsUnenrollModalOpen(false);
      await loadData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al salir', description: error.message });
    } finally {
      setUnenrolling(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-500/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20';
      case 'advanced': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level;
    }
  };

  if (loading) {
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

  if (!program) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Programa no encontrado</h2>
          <p className="mb-4 text-muted-foreground">El programa que buscas no existe o ha sido eliminado.</p>
          <Link to="/programs">
            <Button>Volver a Programas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isEnrolledInThis = activeEnrollment?.program_id === program.id;
  const canEnroll = true; // Ahora siempre se puede inscribir, la lógica del backend manejará el cambio de programa
  const averageRating = program.reviews?.length > 0
    ? (program.reviews.reduce((acc, r) => acc + r.rating, 0) / program.reviews.length).toFixed(1)
    : 'N/A';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6 md:p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <Link to="/programs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold gradient-text">{program.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="p-6 glass-card">
            <div className="relative mb-6 overflow-hidden rounded-xl">
              <img  
                alt={`Programa ${program.name}`}
                className="object-cover w-full h-64"
               src={program.cover_url || "https://images.unsplash.com/photo-1578229353624-a4007142da75"} />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(program.level)}`}>
                  {getLevelText(program.level)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center text-sm gap-x-6 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{Array.isArray(program.weeks) ? program.weeks.length : (program.weeks || 'N/A')} semanas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{program.sessions_per_week || 0} sesiones/semana</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{program.enrollment_count || 0} alumnos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current text-primary" />
                  <span>{averageRating} ({program.reviews?.length || 0} reseñas)</span>
                </div>
              </div>

              <div>
                <h3 className="mt-4 mb-3 text-xl font-bold">Descripción del Programa</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 glass-card">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-bold">
              <Calendar className="w-5 h-5 text-secondary" />
              Estructura del Programa
            </h3>
            
            <div className="space-y-3">
              {program.weeks?.slice(0, 6).map((week) => (
                <div key={week.id} className="flex items-center justify-between p-4 rounded-lg bg-accent">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20">
                      <span className="text-sm font-bold text-secondary">{week.week_order}</span>
                    </div>
                    <div>
                      <p className="font-medium">{week.label}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {week.sessions?.length || 0} sesiones
                  </div>
                </div>
              )) || (
                <div className="py-6 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Estructura del programa en desarrollo</p>
                </div>
              )}
              
              {program.weeks?.length > 6 && (
                <div className="pt-4 text-center">
                  <p className="text-muted-foreground">
                    Y {program.weeks.length - 6} semanas más...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 glass-card">
            <div className="space-y-4 text-center">
              <div className="text-3xl font-bold gradient-text">
                Gratis
              </div>
              <p className="text-muted-foreground">
                Acceso completo al programa
              </p>
              
              {isEnrolledInThis ? (
                <div className="space-y-3">
                  <Button disabled className="w-full text-green-400 bg-green-600/20">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ya Inscrito
                  </Button>
                  <Link to="/dashboard">
                    <Button className="w-full bg-primary text-primary-foreground">
                      Ir al Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleOpenUnenrollModal}>
                    Salir del programa
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleOpenEnrollModal}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={false}
                >
                  <Target className="w-4 h-4 mr-2" />
                  {activeEnrollment && !isEnrolledInThis ? 'Cambiar a Este Programa' : 'Inscribirse Ahora'}
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 glass-card">
            <h4 className="mb-4 font-bold">Incluye:</h4>
            <div className="space-y-3">
              {[
                "Videos explicativos de cada ejercicio",
                "Seguimiento de progreso personalizado",
                "Comunidad de apoyo",
                "Feedback de entrenadores",
                "Acceso de por vida",
                "Actualizaciones gratuitas"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="flex-shrink-0 w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configura tu Semana</DialogTitle>
            <DialogDescription>
              Elige los días que quieres entrenar. Este programa recomienda {program.sessions_per_week} sesiones por semana.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => setPresetDays(2)}>2 días/sem</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetDays(3)}>3 días/sem</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetDays(4)}>4 días/sem</Button>
              <Button variant="outline" size="sm" onClick={() => setPresetDays(5)}>5+ días/sem</Button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {weekDays.map(day => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <label htmlFor={day.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-center text-muted-foreground">Has seleccionado {selectedDays.length} días.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmEnroll}>
              Confirmar e Inscribirse <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnenrollModalOpen} onOpenChange={setIsUnenrollModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salir del programa</DialogTitle>
            <DialogDescription>
              Antes de irte, cuéntanos un poco para mejorar Valka y recomendarte algo mejor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">¿Por qué quieres salir?</label>
              <Select value={unenrollFeedback.reason} onValueChange={(v) => setUnenrollFeedback(prev => ({ ...prev, reason: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Motivo</SelectLabel>
                    <SelectItem value="no_tiempo">Me falta tiempo</SelectItem>
                    <SelectItem value="muy_dificil">Es muy difícil</SelectItem>
                    <SelectItem value="muy_facil">Es muy fácil</SelectItem>
                    <SelectItem value="lesion">Me lesioné</SelectItem>
                    <SelectItem value="sin_equipo">No tengo el equipo necesario</SelectItem>
                    <SelectItem value="no_me_gusta">No me gustó el enfoque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">¿Cuál es tu objetivo principal ahora mismo?</label>
              <Select value={unenrollFeedback.goal} onValueChange={(v) => setUnenrollFeedback(prev => ({ ...prev, goal: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Objetivo</SelectLabel>
                    <SelectItem value="fuerza">Fuerza</SelectItem>
                    <SelectItem value="hipertrofia">Hipertrofia</SelectItem>
                    <SelectItem value="bajar_grasa">Pérdida de grasa</SelectItem>
                    <SelectItem value="movilidad">Movilidad</SelectItem>
                    <SelectItem value="rendimiento">Rendimiento</SelectItem>
                    <SelectItem value="salud_general">Salud general</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recommend-alt-detail"
                checked={unenrollFeedback.recommend}
                onCheckedChange={(v) => setUnenrollFeedback(prev => ({ ...prev, recommend: Boolean(v) }))}
              />
              <label htmlFor="recommend-alt-detail" className="text-sm">
                Me gustaría que Valka me recomiende un plan alternativo
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Comentarios para el equipo de Valka (opcional)</label>
              <textarea
                className="w-full p-2 border rounded-md bg-background border-border"
                rows={4}
                placeholder="Cuéntanos qué mejorarías o qué te gustaría ver..."
                value={unenrollFeedback.comments}
                onChange={(e) => setUnenrollFeedback(prev => ({ ...prev, comments: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnenrollModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmUnenroll} disabled={unenrolling}>
              {unenrolling ? 'Procesando...' : 'Confirmar salida'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProgramDetail;
