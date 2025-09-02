import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { adminGetProgramWithWeeksAndSessions, adminUpdateSession, adminUpdateWeek, adminCreateWeek, adminDeleteWeek, adminCreateSession, adminDeleteSession, adminDuplicateWeek, adminDuplicateSession, adminReorderWeeks, adminReorderSessions } from '@/lib/api/admin';
import { ArrowLeft, GripVertical, Edit, Save, X, Plus, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// Utilidades para pegar tablas desde Excel/Sheets y convertirlas a ejercicios
const parseRestToSeconds = (str) => {
  if (!str) return undefined;
  const s = String(str).toLowerCase().replace(/[,\.]/g, ' ').trim();
  let total = 0;
  const m = s.match(/(\d+)\s*m(in|inutos)?/);
  const sec = s.match(/(\d+)\s*s(ec|eg|egundos)?/);
  if (m) total += parseInt(m[1], 10) * 60;
  if (sec) total += parseInt(sec[1], 10);
  if (!m && !sec && /^\d+$/.test(s)) total = parseInt(s, 10);
  return total || undefined;
};

const parseSpreadsheetToExercises = (input) => {
  if (!input || !String(input).trim()) return [];
  const lines = String(input).replace(/\r/g, '').split('\n');

  const out = [];
  for (const rawLine of lines) {
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line) continue;

    // Soportar tanto tabs (Excel/Sheets) como texto plano con 2+ espacios
    const splitCells = (l) => (l.includes('\t') ? l.split('\t') : l.split(/\s{2,}/));
    let cells = splitCells(rawLine).map((c) => c.trim());

    // Fallback robusto cuando la fila viene con espacios simples (sin tabs ni 2+ espacios)
    if (cells.filter(Boolean).length <= 1) {
      // Intentar capturar descanso al final: "2m", "1m 30s", "90s"
      const restMatch = rawLine.match(/(\d+\s*m(?:in(?:utos)?)?(?:\s*\d+\s*s(?:eg|egundos)?)?|\d+\s*s(?:eg|egundos)?)(\s*)$/i);
      let base = rawLine;
      let descansoCol = '';
      if (restMatch) {
        descansoCol = restMatch[1].trim();
        base = rawLine.slice(0, restMatch.index).trim();
      }

      // name, series, resto
      const seriesMatch = base.match(/^(.+?)\s+(\d+)\s+(.*)$/);
      if (seriesMatch) {
        const nameCol = seriesMatch[1].trim();
        const seriesCol = seriesMatch[2].trim();
        const tail = seriesMatch[3].trim();

        // Separar repeticiones y carga por 2+ espacios si existen
        const tailParts = tail.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
        const repCol = tailParts[0] || tail;
        const cargaCol = tailParts[1] || '';

        cells = [nameCol, seriesCol, repCol, cargaCol, descansoCol].filter((v, i) => v !== '' || i < 3);
      }
    }

    const first = cells[0] || '';

    // Título del día
    if (/^d[ií]a\s*\d+/i.test(first) || /^d[ií]a\s*/i.test(first)) {
      out.push({ type: 'title', text: first });
      continue;
    }

    // Objetivo
    if (/objetivo/i.test(rawLine)) {
      const text = rawLine.replace(/.*objetivo[:\s]*/i, '').trim();
      out.push({ type: 'objective', text });
      continue;
    }

    // Secciones
    if (/^(calentamiento|bloque principal|trabajo principal|ejercicios complementarios)/i.test(first)) {
      out.push({ type: 'section', title: first.toUpperCase() });
      continue;
    }

    // Encabezados (Series/Repeticiones/Carga/Descanso)
    const isHeader =
      cells.some((c) => /^series$/i.test(c)) &&
      cells.some((c) => /^repeticiones$/i.test(c));
    if (isHeader) continue;

    // Fila de ejercicio
    const name = cells[0] || '';
    const seriesRaw = cells[1] || '';
    const repeticiones = cells[2] || '';
    let carga = '';
    let descanso = '';
    if (cells.length >= 5) {
      carga = cells[3] || '';
      descanso = cells[4] || '';
    } else if (cells.length === 4) {
      // Caso sin "Carga": name | series | repeticiones | descanso
      carga = '';
      descanso = cells[3] || '';
    }

    const series = seriesRaw ? Number(seriesRaw.replace(',', '.')) : undefined;
    const rest_sec = parseRestToSeconds(descanso);

    out.push({
      type: 'exercise',
      name,
      series: Number.isFinite(series) ? series : null,
      repeticiones,
      carga,
      descanso,
      // compatibilidad con el front actual
      sets: Number.isFinite(series) ? series : undefined,
      reps: repeticiones || undefined,
      load: carga || undefined,
      rest_sec,
    });
  }

  return out;
};

const AdminProgramSessions = () => {
  const { id: programId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState(null);
  const [editedData, setEditedData] = useState({});
  // Edición de semana
  const [editingWeekId, setEditingWeekId] = useState(null);
  const [weekLabelDraft, setWeekLabelDraft] = useState('');
  // Estado para pegar tabla y vista previa
  const [pasteText, setPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);

  const fetchProgramData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetProgramWithWeeksAndSessions(programId);
      setProgram(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el programa.' });
      navigate('/admin/programs');
    } finally {
      setLoading(false);
    }
  }, [programId, navigate, toast]);

  useEffect(() => {
    fetchProgramData();
  }, [fetchProgramData]);

  const handleEditClick = (session) => {
    setEditingSession(session.id);
    setEditedData({
      title: session.title,
      video_url: session.video_url || '',
      exercises: JSON.stringify(session.exercises || [], null, 2),
    });
    // Inicializamos la vista previa con lo que ya tiene la sesión
    try {
      const current = Array.isArray(session.exercises) ? session.exercises : [];
      setParsedPreview(current);
    } catch {
      setParsedPreview([]);
    }
    setPasteText('');
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditedData({});
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;

    try {
      const parsedExercises = JSON.parse(editedData.exercises);
      const updatedSessionData = {
        title: editedData.title,
        video_url: editedData.video_url,
        exercises: parsedExercises,
      };

      await adminUpdateSession(editingSession, updatedSessionData);
      toast({ title: 'Éxito', description: 'Sesión actualizada correctamente.' });
      handleCancelEdit();
      fetchProgramData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error.message || 'No se pudo actualizar la sesión. Revisa el formato JSON de los ejercicios.',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasteChange = (text) => {
    setPasteText(text);
    try {
      const parsed = parseSpreadsheetToExercises(text);
      setParsedPreview(parsed);
      setEditedData((prev) => ({ ...prev, exercises: JSON.stringify(parsed, null, 2) }));
    } catch {
      // no-op
    }
  };
  
  const handleReorderWeeks = async (newOrder) => {
    const prevWeeks = program.weeks;
    setProgram(p => ({ ...p, weeks: newOrder })); // optimista
    try {
      await adminReorderWeeks(program.id, newOrder.map(w => w.id));
      toast({ title: 'Orden de semanas guardado' });
    } catch (err) {
      setProgram(p => ({ ...p, weeks: prevWeeks }));
      toast({ variant: 'destructive', title: 'Error reordenando semanas', description: err.message });
    }
  };
  
  const handleReorderSessions = async (newOrder, weekId) => {
    const prevWeeks = program.weeks;
    setProgram(prev => ({
      ...prev,
      weeks: prev.weeks.map(week => 
        week.id === weekId ? { ...week, sessions: newOrder } : week
      )
    }));
    try {
      await adminReorderSessions(weekId, newOrder.map(s => s.id));
      toast({ title: 'Orden de sesiones guardado' });
    } catch (err) {
      setProgram(p => ({ ...p, weeks: prevWeeks }));
      toast({ variant: 'destructive', title: 'Error reordenando sesiones', description: err.message });
    }
  };

  // CRUD Weeks & Sessions
  const handleAddWeek = async () => {
    try {
      const newWeek = await adminCreateWeek(program.id);
      setProgram(prev => ({ ...prev, weeks: [...prev.weeks, { ...newWeek, sessions: [] }] }));
      toast({ title: 'Semana creada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDeleteWeek = async (weekId) => {
    if (!window.confirm('¿Eliminar esta semana y todas sus sesiones?')) return;
    try {
      await adminDeleteWeek(weekId);
      setProgram(prev => ({ ...prev, weeks: prev.weeks.filter(w => w.id !== weekId) }));
      toast({ title: 'Semana eliminada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDuplicateWeek = async (weekId) => {
    try {
      await adminDuplicateWeek(weekId);
      await fetchProgramData();
      toast({ title: 'Semana duplicada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleAddSession = async (weekId) => {
    try {
      const newSession = await adminCreateSession(weekId, { title: 'Nueva Sesión' });
      setProgram(prev => ({
        ...prev,
        weeks: prev.weeks.map(w => w.id === weekId ? { ...w, sessions: [...w.sessions, newSession] } : w)
      }));
      toast({ title: 'Sesión creada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDeleteSession = async (sessionId, weekId) => {
    if (!window.confirm('¿Eliminar esta sesión?')) return;
    try {
      await adminDeleteSession(sessionId);
      setProgram(prev => ({
        ...prev,
        weeks: prev.weeks.map(w => w.id === weekId ? { ...w, sessions: w.sessions.filter(s => s.id !== sessionId) } : w)
      }));
      toast({ title: 'Sesión eliminada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDuplicateSession = async (sessionId, weekId) => {
    try {
      const dup = await adminDuplicateSession(sessionId);
      setProgram(prev => ({
        ...prev,
        weeks: prev.weeks.map(w => w.id === weekId ? { ...w, sessions: [...w.sessions, dup] } : w)
      }));
      toast({ title: 'Sesión duplicada' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };


  if (loading) {
    return <div className="p-6 text-center">Cargando sesiones del programa...</div>;
  }

  if (!program) {
    return <div className="p-6 text-center">No se encontró el programa.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/programs')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-wider">{program.name}</h1>
          <p className="text-muted-foreground">Gestionar Semanas y Sesiones</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAddWeek}><Plus className="w-4 h-4 mr-2" /> Añadir Semana</Button>
      </div>
      <Reorder.Group axis="y" values={program.weeks} onReorder={handleReorderWeeks} className="space-y-6">
        {program.weeks.map((week) => (
          <Reorder.Item key={week.id} value={week} className="overflow-hidden border rounded-lg bg-card border-border">
            <div className="flex flex-col gap-2 p-4 border-b bg-muted/50 border-border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab shrink-0" />
                  {editingWeekId === week.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        autoFocus
                        value={weekLabelDraft}
                        onChange={(e) => setWeekLabelDraft(e.target.value)}
                        className="h-8 text-base font-semibold"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            if (!weekLabelDraft.trim()) {
                              toast({ variant: 'destructive', title: 'Etiqueta vacía', description: 'Ingresa un nombre para la semana.' });
                              return;
                            }
                            const updated = await adminUpdateWeek(week.id, { label: weekLabelDraft.trim() });
                            setProgram(prev => ({
                              ...prev,
                              weeks: prev.weeks.map(w => w.id === week.id ? { ...w, label: updated.label } : w)
                            }));
                            toast({ title: 'Semana actualizada' });
                            setEditingWeekId(null);
                            setWeekLabelDraft('');
                          } catch (err) {
                            toast({ variant: 'destructive', title: 'Error', description: err.message || 'No se pudo actualizar la semana.' });
                          }
                        }}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingWeekId(null); setWeekLabelDraft(''); }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingWeekId(week.id); setWeekLabelDraft(week.label || ''); }}
                      className="text-left text-xl font-semibold truncate hover:underline"
                    >
                      {week.label}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAddSession(week.id)}>
                    <Plus className="w-4 h-4 mr-2" /> Sesión
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDuplicateWeek(week.id)}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteWeek(week.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {editingWeekId === week.id && (
                <p className="text-xs text-muted-foreground">Pulsa Guardar para actualizar el nombre de la semana.</p>
              )}
            </div>
            
            <Reorder.Group
              axis="y"
              values={week.sessions}
              onReorder={(newOrder) => handleReorderSessions(newOrder, week.id)}
              className="p-4 space-y-3"
            >
              {week.sessions.map((session) => (
                <Reorder.Item key={session.id} value={session}>
                  <AnimatePresence>
                    {editingSession === session.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 space-y-4 border rounded-md bg-background border-primary"
                      >
                        <Input
                          name="title"
                          value={editedData.title}
                          onChange={handleInputChange}
                          className="text-lg font-semibold"
                        />
                        <Input
                          name="video_url"
                          placeholder="URL del video (opcional)"
                          value={editedData.video_url}
                          onChange={handleInputChange}
                        />

                        <div className="space-y-2">
                          <Textarea
                            placeholder="Pega aquí la tabla desde Excel o Google Sheets"
                            value={pasteText}
                            onChange={(e) => handlePasteChange(e.target.value)}
                            rows={6}
                          />
                          <p className="text-xs text-muted-foreground">
                            Pega la tabla con columnas: Ejercicio | Series | Repeticiones | Carga | Descanso. Se convertirá automáticamente a JSON y podrás previsualizarla abajo.
                          </p>

                          {parsedPreview && parsedPreview.length > 0 && (
                            <div className="p-3 border rounded-md border-border">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-border">
                                      <th className="py-2 font-medium text-muted-foreground">Ejercicio</th>
                                      <th className="py-2 font-medium text-muted-foreground">Series</th>
                                      <th className="py-2 font-medium text-muted-foreground">Repeticiones</th>
                                      <th className="py-2 font-medium text-muted-foreground">Carga</th>
                                      <th className="py-2 font-medium text-muted-foreground">Descanso</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {parsedPreview.map((row, idx) =>
                                      row.type === 'section' ? (
                                        <tr key={idx} className="bg-muted/40">
                                          <td className="py-2 font-semibold" colSpan={5}>{row.title}</td>
                                        </tr>
                                      ) : row.type === 'objective' ? (
                                        <tr key={idx} className="bg-muted/20">
                                          <td className="py-2" colSpan={5}>🎯 OBJETIVO: {row.text}</td>
                                        </tr>
                                      ) : row.type === 'title' ? null : (
                                        <tr key={idx} className="border-b border-border last:border-b-0">
                                          <td className="py-2 font-medium">{row.name}</td>
                                          <td className="py-2">{row.series ?? ''}</td>
                                          <td className="py-2">{row.repeticiones ?? ''}</td>
                                          <td className="py-2">{row.carga ?? ''}</td>
                                          <td className="py-2">{row.descanso ?? ''}</td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>

                        <Textarea
                          name="exercises"
                          placeholder="Ejercicios en formato JSON (se autocompleta al pegar la tabla)"
                          value={editedData.exercises}
                          onChange={handleInputChange}
                          rows={10}
                          className="font-mono text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-2" /> Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="w-4 h-4 mr-2" /> Guardar
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 border rounded-md border-border bg-background"
                      >
                         <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                          <p className="font-medium">
                            {session.session_order}: {session.title}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicateSession(session.id, week.id)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session.id, week.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(session)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default AdminProgramSessions;
