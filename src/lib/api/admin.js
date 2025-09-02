import { supabase } from '@/lib/customSupabaseClient';

export const getEnrolledStudents = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile.role !== 'admin') throw new Error('Acción no autorizada');
  }

  const { data, error } = await supabase.rpc('get_enrolled_students', { p_admin_id: user.id });

  if (error) throw error;
  return data;
};

export const adminGetAllPrograms = async () => {
  const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const adminCreateProgram = async (programData) => {
  const { data, error } = await supabase.from('programs').insert([programData]).select();
  if (error) throw error;
  return data;
};

export const adminUpdateProgram = async (id, programData) => {
  const { data, error } = await supabase.from('programs').update(programData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const adminDeleteProgram = async (id) => {
  const { error } = await supabase.from('programs').delete().eq('id', id);
  if (error) throw error;
};

export const adminGetProgramWithWeeksAndSessions = async (programId) => {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      weeks:program_weeks (
        *,
        sessions:program_sessions (
          *
        )
      )
    `)
    .eq('id', programId)
    .order('week_order', { foreignTable: 'weeks', ascending: true })
    .order('session_order', { foreignTable: 'weeks.sessions', ascending: true })
    .single();

  if (error) throw error;
  return data;
};

export const adminUpdateSession = async (sessionId, sessionData) => {
  const { data, error } = await supabase
    .from('program_sessions')
    .update(sessionData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualiza una semana del programa (por ahora solo label, pero acepta objeto genérico)
export const adminUpdateWeek = async (weekId, weekData) => {
  const { data, error } = await supabase
    .from('program_weeks')
    .update(weekData)
    .eq('id', weekId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const adminCreateWeek = async (programId, label = null) => {
  // Obtener siguiente week_order
  const { data: existing, error: fetchErr } = await supabase
    .from('program_weeks')
    .select('week_order')
    .eq('program_id', programId)
    .order('week_order', { ascending: false })
    .limit(1);
  if (fetchErr) throw fetchErr;
  const nextOrder = existing && existing.length > 0 ? (existing[0].week_order || 0) + 1 : 1;
  const { data, error } = await supabase
    .from('program_weeks')
    .insert([{ program_id: programId, week_order: nextOrder, label: label || `Semana ${nextOrder}` }])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const adminDeleteWeek = async (weekId) => {
  // Borramos primero sesiones (si no hay ON DELETE CASCADE)
  await supabase.from('program_sessions').delete().eq('week_id', weekId);
  const { error } = await supabase.from('program_weeks').delete().eq('id', weekId);
  if (error) throw error;
};

export const adminCreateSession = async (weekId, sessionData = {}) => {
  // Obtener siguiente session_order dentro de la semana
  const { data: existing, error: fetchErr } = await supabase
    .from('program_sessions')
    .select('session_order')
    .eq('week_id', weekId)
    .order('session_order', { ascending: false })
    .limit(1);
  if (fetchErr) throw fetchErr;
  const nextOrder = existing && existing.length > 0 ? (existing[0].session_order || 0) + 1 : 1;
  const base = {
    title: sessionData.title || `Sesión ${nextOrder}`,
    week_id: weekId,
    session_order: nextOrder,
    exercises: sessionData.exercises || [],
    video_url: sessionData.video_url || null,
  };
  const { data, error } = await supabase
    .from('program_sessions')
    .insert([base])
    .select('*')
    .single();
  if (error) throw error;
  return data;
};

export const adminDeleteSession = async (sessionId) => {
  const { error } = await supabase.from('program_sessions').delete().eq('id', sessionId);
  if (error) throw error;
};

export const adminDuplicateWeek = async (weekId) => {
  // Obtener semana y sus sesiones
  const { data: week, error: weekErr } = await supabase
    .from('program_weeks')
    .select('*, sessions:program_sessions(*)')
    .eq('id', weekId)
    .single();
  if (weekErr) throw weekErr;
  const newWeek = await adminCreateWeek(week.program_id, `${week.label || 'Semana'} (Copia)`);
  // Duplicar sesiones
  for (const s of week.sessions || []) {
    await adminCreateSession(newWeek.id, {
      title: `${s.title} (Copia)` ,
      exercises: s.exercises || [],
      video_url: s.video_url || null,
    });
  }
  return newWeek;
};

export const adminDuplicateSession = async (sessionId) => {
  const { data: session, error: sessErr } = await supabase
    .from('program_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (sessErr) throw sessErr;
  const duplicated = await adminCreateSession(session.week_id, {
    title: `${session.title} (Copia)`,
    exercises: session.exercises || [],
    video_url: session.video_url || null,
  });
  return duplicated;
};

// Reordenar semanas (intenta RPC transaccional, fallback a múltiples updates)
export const adminReorderWeeks = async (programId, orderedWeekIds) => {
  if (!Array.isArray(orderedWeekIds)) throw new Error('orderedWeekIds debe ser un array');
  // Intentar función RPC (crear en SQL):
  // CREATE OR REPLACE FUNCTION reorder_program_weeks(p_program_id uuid, p_week_ids uuid[])
  // RETURNS void AS $$
  // DECLARE i int; v_id uuid; BEGIN
  //   FOREACH v_id WITH ORDINALITY IN ARRAY p_week_ids LOOP
  //     UPDATE program_weeks SET week_order = (SELECT ordinality FROM unnest(p_week_ids) WITH ORDINALITY u(id, ordinality) WHERE id = v_id)
  //     WHERE id = v_id AND program_id = p_program_id;
  //   END LOOP; END; $$ LANGUAGE plpgsql VOLATILE;
  const { error } = await supabase.rpc('reorder_program_weeks', { p_program_id: programId, p_week_ids: orderedWeekIds });
  if (error) {
    // Fallback en dos fases para evitar colisiones del unique (program_id, week_order)
    // 1) Asignar valores temporales altos
    for (let i = 0; i < orderedWeekIds.length; i++) {
      const id = orderedWeekIds[i];
      const { error: tmpErr } = await supabase
        .from('program_weeks')
        .update({ week_order: 1000 + i + 1 })
        .eq('id', id);
      if (tmpErr) throw tmpErr;
    }
    // 2) Asignar valores definitivos
    for (let i = 0; i < orderedWeekIds.length; i++) {
      const id = orderedWeekIds[i];
      const { error: updErr } = await supabase
        .from('program_weeks')
        .update({ week_order: i + 1 })
        .eq('id', id);
      if (updErr) throw updErr;
    }
  }
};

// Reordenar sesiones dentro de una semana
export const adminReorderSessions = async (weekId, orderedSessionIds) => {
  if (!Array.isArray(orderedSessionIds)) throw new Error('orderedSessionIds debe ser un array');
  // RPC opcional (crear): reorder_week_sessions(p_week_id uuid, p_session_ids uuid[])
  const { error } = await supabase.rpc('reorder_week_sessions', { p_week_id: weekId, p_session_ids: orderedSessionIds });
  if (error) {
    // Fallback en dos fases para evitar violar unique (posiblemente week_id/session_order o step_id/session_order)
    for (let i = 0; i < orderedSessionIds.length; i++) {
      const id = orderedSessionIds[i];
      const { error: tmpErr } = await supabase
        .from('program_sessions')
        .update({ session_order: 1000 + i + 1 })
        .eq('id', id);
      if (tmpErr) throw tmpErr;
    }
    for (let i = 0; i < orderedSessionIds.length; i++) {
      const id = orderedSessionIds[i];
      const { error: updErr } = await supabase
        .from('program_sessions')
        .update({ session_order: i + 1 })
        .eq('id', id);
      if (updErr) throw updErr;
    }
  }
};

export const adminGetAllLessonCategories = async () => {
  const { data, error } = await supabase
    .from('lesson_categories')
    .select('*, lessons(*)')
    .order('order', { ascending: true });
  if (error) throw error;
  return data;
};

export const adminCreateLessonCategory = async (categoryData) => {
  const { data, error } = await supabase.from('lesson_categories').insert([categoryData]).select();
  if (error) throw error;
  return data;
};

export const adminUpdateLessonCategory = async (id, categoryData) => {
  const { data, error } = await supabase.from('lesson_categories').update(categoryData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const adminDeleteLessonCategory = async (id) => {
  await supabase.from('lessons').delete().eq('category_id', id);
  const { error } = await supabase.from('lesson_categories').delete().eq('id', id);
  if (error) throw error;
};

export const adminCreateLesson = async (lessonData) => {
  const { data, error } = await supabase.from('lessons').insert([lessonData]).select();
  if (error) throw error;
  return data;
};

export const adminUpdateLesson = async (id, lessonData) => {
  const { data, error } = await supabase.from('lessons').update(lessonData).eq('id', id).select();
  if (error) throw error;
  return data;
};

export const adminDeleteLesson = async (id) => {
  const { data, error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw error;
};

export const getProgramEnrollments = async () => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      started_at,
      profiles:user_id(display_name, photo_url),
      program:program_id(name)
    `)
    .order('started_at', { ascending: false });
  if (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
  return data;
};

export const getSessionProgress = async () => {
  const { data, error } = await supabase
    .from('session_progress')
    .select(`
      id,
      completed_at,
      real_rpe,
      notes,
      profiles:user_id(display_name, photo_url),
      session:session_id(title, week:week_id(program:program_id(name)))
    `)
    .order('completed_at', { ascending: false });
  if (error) {
    console.error("Error fetching session progress:", error);
    throw error;
  }
  return data;
};