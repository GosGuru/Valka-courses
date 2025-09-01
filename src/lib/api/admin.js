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