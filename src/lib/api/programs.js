import { supabase } from '@/lib/customSupabaseClient';

export const getPrograms = async () => {
  const { data, error } = await supabase.rpc('get_programs_with_details');
  if (error) throw error;
  return data;
};

export const getProgramById = async (id) => {
  const { data: programData, error: programError } = await supabase
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
    .eq('id', id)
    .single();
  if (programError) throw programError;

  const { data: reviews, error: reviewsError } = await supabase
    .from('program_reviews')
    .select('*, user:profiles(display_name, photo_url)')
    .eq('program_id', id);
  if (reviewsError) throw reviewsError;

  const { count, error: countError } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('program_id', id);
  if (countError) throw countError;

  return { ...programData, reviews, enrollment_count: count };
};

export const getAllSessionsForProgram = async (programId) => {
  const { data: weeks, error } = await supabase
    .from('program_weeks')
    .select('id, week_order, label, sessions:program_sessions(*)')
    .eq('program_id', programId)
    .order('week_order', { ascending: true })
    .order('session_order', { foreignTable: 'sessions', ascending: true });

  if (error) {
    console.error("Error fetching all sessions for program:", error);
    throw error;
  }
  return weeks || [];
};

export const getSessionById = async (sessionId) => {
  const { data, error } = await supabase
    .from('program_sessions')
    .select('*, week:program_weeks(week_order)')
    .eq('id', sessionId)
    .single();
  
  if (error) throw error;
  return data;
};