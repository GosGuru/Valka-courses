
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  Users,
  Star,
  Play,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPrograms, enrollInProgram, getActiveEnrollment, unenrollFromProgram } from '@/lib/api';
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
];

const Programs = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [activeEnrollment, setActiveEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
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
      const allPrograms = await getPrograms();
      setPrograms(allPrograms);
      if (session) {
        const currentEnrollment = await getActiveEnrollment();
        setActiveEnrollment(currentEnrollment);
      }
    } catch (error) {
      toast({
        title: "Error al cargar programas",
        description: "No se pudieron cargar los programas. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, session]);

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

  const handleOpenEnrollModal = (program) => {
    if (!session) {
      toast({
        title: "Inicia Sesión",
        description: "Debes iniciar sesión para inscribirte a un programa.",
        action: <Button onClick={() => navigate('/')}>Iniciar Sesión</Button>
      });
      return;
    }
    setSelectedProgram(program);
    setPresetDays(program.sessions_per_week);
    setIsEnrollModalOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (selectedDays.length === 0) {
      toast({ title: "Selecciona al menos un día", variant: "destructive" });
      return;
    }
    try {
      await enrollInProgram(selectedProgram.id, selectedDays);
      toast({
        title: "🎉 ¡Inscripción Exitosa!",
        description: "Te has inscrito al programa. ¡Comienza tu transformación ahora!"
      });
      setIsEnrollModalOpen(false);
      loadData();
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 space-y-6 md:p-6"
    >
      <motion.div variants={cardVariants} className="mb-8 text-center">
        <h1 className="mb-2 text-5xl tracking-wider font-logo md:text-6xl text-primary">
          Programas de Entrenamiento
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
          Descubre programas diseñados por expertos para llevarte al siguiente nivel.
        </p>
      </motion.div>

      {session && activeEnrollment && (
        <motion.div variants={cardVariants} className="p-6 glass-card border-primary/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-primary">Programa Activo</h3>
              <p className="text-foreground">
                Actualmente estás inscrito en: <strong>{activeEnrollment.program.name}</strong>
              </p>
            </div>
            <Link to="/dashboard">
              <Button className="bg-primary text-primary-foreground">
                Ir al Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={handleOpenUnenrollModal}>
              Salir del programa
            </Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 rounded-full border-t-transparent border-primary"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const isEnrolledInThis = activeEnrollment?.program_id === program.id;
            const canEnroll = !activeEnrollment || isEnrolledInThis;

            return (
              <motion.div
                key={program.id}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                className="flex flex-col transition-all duration-300 glass-card hover:border-primary/50"
              >
                <div className="relative">
                  <Link to={`/programs/${program.id}`}>
                    <img  
                      alt={`Programa ${program.name}`}
                      className="object-cover w-full h-48 rounded-t-xl"
                     src={program.cover_url || "https://images.unsplash.com/photo-1553795654-a3af8d0b37f2"} />
                  </Link>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(program.level)}`}>
                      {getLevelText(program.level)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col flex-grow p-6">
                  <div className="flex-grow space-y-4">
                    <div>
                      <h3 className="mb-2 text-xl font-bold">{program.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {program.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{Array.isArray(program.weeks) ? program.weeks.length : (typeof program.weeks === 'number' ? program.weeks : (program.weeks ? 1 : 'N/A'))} semanas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{program.enrollment_count || 0} alumnos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 mt-4 border-t border-border">
                    <Link to={`/programs/${program.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </Link>
                    
                    {isEnrolledInThis ? (
                      <Button disabled className="flex-1 text-green-400 bg-green-600/20">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Inscrito
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleOpenEnrollModal(program)}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!canEnroll && !isEnrolledInThis}
                      >
                        {canEnroll ? (
                          <Target className="w-4 h-4 mr-2" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {canEnroll ? 'Inscribirse' : 'Programa Activo'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && programs.length === 0 && (
        <motion.div 
          variants={cardVariants}
          className="py-12 text-center"
        >
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-muted">
            <Target className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-bold">No hay programas disponibles</h3>
          <p className="text-muted-foreground">
            Los programas se cargarán pronto. ¡Mantente atento!
          </p>
        </motion.div>
      )}

      {selectedProgram && (
        <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configura tu Semana</DialogTitle>
              <DialogDescription>
                Elige los días que quieres entrenar. Este programa recomienda {selectedProgram.sessions_per_week} sesiones por semana.
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
                      id={`modal-${day.id}`}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <label htmlFor={`modal-${day.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground">Has seleccionado {selectedDays.length} días.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEnrollModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirmEnroll}>Confirmar e Inscribirse</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                id="recommend-alt"
                checked={unenrollFeedback.recommend}
                onCheckedChange={(v) => setUnenrollFeedback(prev => ({ ...prev, recommend: Boolean(v) }))}
              />
              <label htmlFor="recommend-alt" className="text-sm">
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

export default Programs;
