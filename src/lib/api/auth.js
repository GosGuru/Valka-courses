import { supabase } from '@/lib/customSupabaseClient';

export const enrollInProgram = async (programId, trainingDays) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para inscribirte.');

  const { data: existing } = await supabase.from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('program_id', programId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('Ya estás inscrito en este programa.');
    } else {
      const { data: updatedData, error: updateError } = await supabase.from('enrollments')
        .update({ 
          status: 'active', 
          started_at: new Date().toISOString(), 
          start_date: new Date().toISOString().split('T')[0],
          completed_at: null,
          training_days: trainingDays
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) throw updateError;
      return updatedData;
    }
  }

  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('version')
    .eq('id', programId)
    .single();

  if (programError || !program) throw new Error('Programa no encontrado');

  const { data, error } = await supabase.from('enrollments').insert([
    {
      user_id: user.id,
      program_id: programId,
      version_locked: program.version,
      status: 'active',
      started_at: new Date().toISOString(),
      start_date: new Date().toISOString().split('T')[0],
      training_days: trainingDays,
    },
  ]).select().single();

  if (error) throw error;
  return data;
};

export const unenrollFromProgram = async (enrollmentId, feedback = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión.');

  // Desinscribir cambiando el estado a 'cancelled'
  const { data, error } = await supabase
    .from('enrollments')
    .update({
      status: 'cancelled'
    })
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  // Si existe una tabla para feedback podríamos guardarlo aquí.
  // Este bloque es seguro (ignora si no existe la tabla).
  if (feedback && Object.keys(feedback).length > 0) {
    try {
      await supabase.from('unenroll_feedback').insert([{
        enrollment_id: enrollmentId,
        user_id: user.id,
        payload: feedback,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      // Silencioso: si no existe la tabla, no interrumpimos el flujo
      console.warn('Feedback de desinscripción no guardado (tabla opcional):', e?.message);
    }
  }

  return data;
};
