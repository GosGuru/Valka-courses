import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Play, CheckCircle, Star, BookOpen, AlertTriangle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TodaySession = ({ activeSession, allSessions, completedSessionIds = [], onSessionSelect, onCompleteSession }) => {
  const renderContent = () => {
    if (!activeSession) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
      );
    }

    if (activeSession.error) {
      return (
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Error al cargar la sesión</h3>
          <p className="text-muted-foreground">
            No pudimos obtener los datos de esta sesión. Por favor, intenta de nuevo.
          </p>
        </div>
      );
    }

    if (activeSession.isRestDay) {
      return (
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20">
            <Star className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">¡Día de Descanso Activo!</h3>
          <p className="mb-4 text-muted-foreground">
            Hoy es tu día de recuperación. Aprovecha para hacer movilidad.
          </p>
          <Link to="/library" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full text-sm sm:w-auto sm:text-base">
              <BookOpen className="w-4 h-4 mr-2" />
              Ver Rutinas de Movilidad
            </Button>
          </Link>
        </div>
      );
    }

    if (activeSession.completedProgram) {
      return (
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">¡Programa Completado!</h3>
          <p className="mb-4 text-muted-foreground">
            ¡Felicitaciones! Has completado todas las sesiones de este programa.
          </p>
          <Link to="/programs" className="w-full sm:w-auto">
            <Button className="w-full text-sm sm:w-auto sm:text-base">
              Explorar Nuevos Programas
            </Button>
          </Link>
        </div>
      );
    }

    if (activeSession.noExercises || activeSession.noSessions) {
      return (
        <div className="py-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Sesión en Preparación</h3>
          <p className="text-muted-foreground">
            Esta sesión aún no tiene ejercicios cargados. ¡Vuelve pronto!
          </p>
        </div>
      );
    }

    if (activeSession.exercises) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-tight sm:text-lg md:text-xl text-primary">
              {activeSession.title}
            </h3>
            {activeSession.video_url && (
              <a href={activeSession.video_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Play className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Video Guía</span>
                  <span className="sm:hidden">Video</span>
                </Button>
              </a>
            )}
          </div>

          {activeSession.objective && (
            <div className="p-3 text-sm border rounded-md bg-primary/5 border-primary/40">
              <span className="font-semibold">🎯 Objetivo:</span> {activeSession.objective}
            </div>
          )}

          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[600px] text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pl-4 font-medium sm:pl-0 text-muted-foreground">Ejercicio</th>
                  <th className="py-2 font-medium text-muted-foreground">Series</th>
                  <th className="py-2 font-medium text-muted-foreground">Reps</th>
                  <th className="py-2 font-medium text-muted-foreground">Carga</th>
                  <th className="py-2 pr-4 font-medium sm:pr-0 text-muted-foreground">Descanso</th>
                </tr>
              </thead>
              <tbody>
                {activeSession.exercises.map((row, index) => {
                  if (row.type === 'section') {
                    return (
                      <tr key={index} className="bg-muted/40">
                        <td className="py-2 font-semibold" colSpan={5}>{row.title}</td>
                      </tr>
                    );
                  }
                  if (row.type === 'objective') {
                    return (
                      <tr key={index} className="bg-muted/20">
                        <td className="py-2" colSpan={5}>🎯 OBJETIVO: {row.text}</td>
                      </tr>
                    );
                  }
                  if (row.type === 'title') return null;

                  const series = row.series ?? row.sets ?? '';
                  const reps = row.repeticiones ?? row.reps ?? (row.target_rpe ? `RPE ${row.target_rpe}` : '');
                  const carga = row.carga ?? row.load ?? '';
                  const descanso = row.descanso ?? (row.rest_sec ? `${row.rest_sec}s` : '');

                  return (
                    <tr key={index} className="border-b border-border last:border-b-0">
                      <td className="py-3 pl-4 font-medium sm:pl-0">{row.name}</td>
                      <td className="py-3">{series}</td>
                      <td className="py-3">{reps}</td>
                      <td className="py-3">{carga}</td>
                      <td className="py-3 pr-4 sm:pr-0">{descanso}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
       <div className="py-8 text-center">
        <p className="text-muted-foreground">Selecciona una sesión para ver los detalles.</p>
      </div>
    );
  };
  
  return (
    <motion.div variants={cardVariants} className="p-4 border sm:p-6 bg-card border-border rounded-xl">
      <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:gap-4 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-bold leading-tight sm:text-2xl">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
          <span>Mi Sesión de Hoy</span>
        </h2>
        <div className="flex items-center w-full gap-2 sm:gap-4 sm:w-auto">
          <Select onValueChange={onSessionSelect} defaultValue={activeSession?.id}>
            <SelectTrigger className="w-full text-sm sm:text-base sm:w-[220px]">
              <SelectValue placeholder="Elige una sesión" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh] overflow-y-auto">
              {allSessions && allSessions.map(week => (
                <SelectGroup key={week.id}>
                  <SelectLabel>{week.label}</SelectLabel>
                  {week.sessions && week.sessions.map(session => (
                    <SelectItem key={session.id} value={session.id} className="flex items-center gap-2">
                      <span className="flex-1 flex items-center gap-2">
                        {completedSessionIds.includes(session.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {session.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          {activeSession && activeSession.exercises && (
            <Button
              onClick={onCompleteSession}
              className="flex-shrink-0 px-3 text-sm bg-primary hover:bg-primary/90 text-primary-foreground sm:px-4 sm:text-base"
              disabled={activeSession.completed}
              size="sm"
            >
              {activeSession.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {renderContent()}
    </motion.div>
  );
};

export default TodaySession;
