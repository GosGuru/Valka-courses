import { supabase } from '@/lib/customSupabaseClient';

// Siempre creamos una nueva inscripción para preservar historial.
export const enrollInProgram = async (programId, trainingDays) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión para inscribirte.');

  // Cerrar inscripción activa previa marcándola como cancelada (no borrar progreso)
  const { data: activeEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (activeEnrollment) {
    // Intentar usar cancelled_at si existe
    const baseUpdate = { status: 'cancelled', cancelled_at: new Date().toISOString() };
    const { error: cancelErr } = await supabase
      .from('enrollments')
      .update(baseUpdate)
      .eq('id', activeEnrollment.id);
    if (cancelErr && cancelErr.message?.includes('cancelled_at')) {
      await supabase.from('enrollments').update({ status: 'cancelled' }).eq('id', activeEnrollment.id);
    }
  }

  // Obtener versión del programa
  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('version')
    .eq('id', programId)
    .single();
  if (programError || !program) throw new Error('Programa no encontrado');
  // Calcular attempt: buscar máximo attempt existente para este user+program
  let nextAttempt = 1;
  const { data: lastAttempts, error: attemptsErr } = await supabase
    .from('enrollments')
    .select('attempt')
    .eq('user_id', user.id)
    .eq('program_id', programId)
    .order('attempt', { ascending: false })
    .limit(1);
  if (!attemptsErr && lastAttempts && lastAttempts.length > 0 && lastAttempts[0].attempt) {
    nextAttempt = (lastAttempts[0].attempt || 0) + 1;
  }

  const newEnrollmentPayload = {
    user_id: user.id,
    program_id: programId,
    version_locked: program.version,
    status: 'active',
    started_at: new Date().toISOString(),
    training_days: trainingDays,
    attempt: nextAttempt
  };

  // Intentar crear NUEVA fila para preservar historial
  let { data: inserted, error: insertError } = await supabase
    .from('enrollments')
    .insert([newEnrollmentPayload])
    .select()
    .maybeSingle();

  if (insertError) {
    // Fallback: constraint antigua (user_id, program_id) impide nuevas filas. Reutilizamos
    if (insertError.code === '23505') {
      const { data: existing } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('program_id', programId)
        .maybeSingle();
      if (!existing) throw insertError;

      const reuseUpdate = {
        status: 'active',
        started_at: new Date().toISOString(),
        completed_at: null,
        training_days: trainingDays,
        version_locked: program.version
      };
      if (existing.hasOwnProperty('attempt')) {
        reuseUpdate.attempt = (existing.attempt || 0) + 1;
      }
      const { data: updated, error: reuseErr } = await supabase
        .from('enrollments')
        .update(reuseUpdate)
        .eq('id', existing.id)
        .select()
        .single();
      if (reuseErr) throw reuseErr;
      return updated;
    }
    throw insertError;
  }
  return inserted;
};

export const unenrollFromProgram = async (enrollmentId, feedback = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión.');

  // Marcar como cancelada (mantener progresos históricos)
  let { data, error } = await supabase
    .from('enrollments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error && error.message?.includes('cancelled_at')) {
    ({ data, error } = await supabase
      .from('enrollments')
      .update({ status: 'cancelled' })
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .select()
      .single());
  }
  if (error) throw error;

  if (feedback && Object.keys(feedback).length > 0) {
    try {
      await supabase.from('unenroll_feedback').insert([
        {
          enrollment_id: enrollmentId,
          user_id: user.id,
          payload: feedback,
          created_at: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.warn('Feedback de desinscripción no guardado (tabla opcional):', e?.message);
    }
  }
  return data;
};
