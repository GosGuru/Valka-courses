import { supabase } from '@/lib/customSupabaseClient';

export const getActiveEnrollment = async (userId = null) => {
  let userToFetch = userId;
  if (!userToFetch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    userToFetch = user.id;
  }

  const { data: enrollment, error } = await supabase
    .from('enrollments')
    .select('*, program:programs(*)')
    .eq('user_id', userToFetch)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error("Error fetching active enrollment:", error);
    throw error;
  }
  if (!enrollment) return null;

  const { count, error: countError } = await supabase
    .from('session_progress')
  .select('*', { count: 'exact', head: true })
  .eq('enrollment_id', enrollment.id)
  .eq('completed', true)
  .gte('completed_at', enrollment.started_at); // solo progreso de este intento
  
  if (countError) {
    console.error("Error fetching completed sessions count:", countError);
    return { ...enrollment, completed_sessions_count: 0, total_sessions_count: 0, is_completed: false };
  }

  const completed_sessions_count = count || 0;
  const total_sessions_count = (enrollment.program.weeks || 0) * (enrollment.program.sessions_per_week || 0);
  const is_completed = total_sessions_count > 0 && completed_sessions_count >= total_sessions_count;

  if (is_completed && enrollment.status !== 'completed' && !userId) { // Only update for the logged-in user
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('enrollments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', enrollment.id)
      .select('*, program:programs(*)')
      .single();
    
    if (updateError) {
      console.error("Error updating enrollment status to completed:", updateError);
    } else {
      return { 
        ...updatedEnrollment, 
        completed_sessions_count,
        total_sessions_count,
        is_completed: true
      };
    }
  }

  return { 
    ...enrollment, 
    completed_sessions_count,
    total_sessions_count,
    is_completed
  };
};

export const getTodaySession = async (enrollment) => {
  if (!enrollment) return { error: new Error("No active enrollment found.") };

  try {
    const { data: programWeeks, error: weeksError } = await supabase
      .from('program_weeks')
      .select('id, week_order')
      .eq('program_id', enrollment.program_id)
      .order('week_order', { ascending: true });

    if (weeksError) throw weeksError;
    if (!programWeeks || programWeeks.length === 0) return { noSessions: true };

    const today = new Date();
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // training_days seems to store ['Sun', 'Mon', 'Tue', ...]. Let's adapt.
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = weekDays[today.getDay()];
    
    if (!enrollment.training_days?.includes(dayOfWeek)) {
      return { isRestDay: true };
    }

    const { data: completedSessions, error: completedError } = await supabase
      .from('session_progress')
      .select('session_id')
      .eq('enrollment_id', enrollment.id)
  .eq('completed', true)
  .gte('completed_at', enrollment.started_at);

    if (completedError) throw completedError;
    const completedSessionIds = completedSessions.map(s => s.session_id);

    const weekIds = programWeeks.map(w => w.id);

    let query = supabase
      .from('program_sessions')
      .select('*, week:program_weeks!inner(week_order)')
      .in('week_id', weekIds);

    if (completedSessionIds.length > 0) {
      query = query.not('id', 'in', `(${completedSessionIds.join(',')})`);
    }
    
    const { data: nextSession, error: nextSessionError } = await query
      .order('week_order', { foreignTable: 'week', ascending: true })
      .order('session_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextSessionError) {
      console.error("Error fetching next session:", nextSessionError);
      throw nextSessionError;
    }
    
    if (!nextSession) {
      return { completedProgram: true };
    }
    
    if (!nextSession.exercises || nextSession.exercises.length === 0) {
      return { ...nextSession, noExercises: true };
    }

    return { ...nextSession };
  } catch (error) {
    console.error("Error in getTodaySession:", error);
    return { error };
  }
};

export const completeSession = async (sessionId, enrollmentId, realRpe, notes) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase.from('session_progress').upsert({
    enrollment_id: enrollmentId,
    session_id: sessionId,
    user_id: user.id,
    completed: true,
    completed_at: new Date().toISOString(),
    real_rpe: realRpe,
    notes: notes,
  }, { onConflict: 'enrollment_id, session_id' }).select().single();

  if (error) throw error;

  await supabase.from('points_ledger').insert([{ user_id: user.id, source: 'complete_session', points: 50 }]);
  return data;
};

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (profileData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const uploadAvatar = async (file) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const BUCKET_NAME = 'avatars';
  // Nota: La creación del bucket debe hacerse en el panel / con service key. Aquí solo intentamos subir.

  const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const filePath = `${user.id}/avatar.${fileExt}`; // ruta estable por usuario

  // Validaciones básicas
  if (!['png','jpg','jpeg'].includes(fileExt)) {
    throw new Error('Formato no soportado. Usa PNG o JPG.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen excede 5MB.');
  }

  // Subir con upsert
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '0',
      upsert: true,
      contentType: file.type
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    if (uploadError.message?.includes('does not exist')) {
      throw new Error('El bucket de avatars no existe o no es público. Crea "avatars" en el panel de Storage y márcalo como público.');
    }
    throw new Error(uploadError.message || 'No se pudo subir el avatar.');
  }

  const { data: pub } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  // Cache bust param para que el navegador recargue
  const finalUrl = pub.publicUrl + `?v=${Date.now()}`;
  return finalUrl;
};

export const getUserBadges = async (userId = null) => {
  let userToFetch = userId;
  if(!userToFetch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    userToFetch = user.id;
  }

  const { data, error } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userToFetch);
  
  if (error) throw error;
  return data.map(ub => ub.badge);
};

export const getUserPRs = async (userId = null) => {
  let userToFetch = userId;
  if (!userToFetch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    userToFetch = user.id;
  }

  const { data, error } = await supabase
    .from('prs')
    .select('*')
    .eq('user_id', userToFetch)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Crear un nuevo PR
export const createPR = async ({ type, value, unit, date }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');
  if (!type || !value) throw new Error('Tipo y valor son requeridos');
  const payload = {
    user_id: user.id,
    type: type.trim(),
    value: Number(value),
    unit: unit?.trim() || null,
    date: date || new Date().toISOString().slice(0,10)
  };
  const { data, error } = await supabase.from('prs').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const updatePR = async (id, { type, value, unit, date }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');
  const updates = {};
  if (type) updates.type = type.trim();
  if (value != null) updates.value = Number(value);
  if (unit !== undefined) updates.unit = unit ? unit.trim() : null;
  if (date) updates.date = date;
  const { data, error } = await supabase.from('prs').update(updates).eq('id', id).eq('user_id', user.id).select().single();
  if (error) throw error;
  return data;
};

export const deletePR = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');
  const { error } = await supabase.from('prs').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
};

export const getPublicUserProfile = async (profileId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('*').eq('id', profileId).single();
  if (profileError) throw profileError;
  
  const [activeEnrollment, recentProgress, prs, friendship] = await Promise.all([
    getActiveEnrollment(profileId),
    supabase.from('session_progress').select('*, session:program_sessions(title)').eq('user_id', profileId).order('completed_at', { ascending: false }).limit(5),
    getUserPRs(profileId),
    supabase.from('friends').select('*').or(`and(user_id_1.eq.${user.id},user_id_2.eq.${profileId}),and(user_id_1.eq.${profileId},user_id_2.eq.${user.id})`).maybeSingle()
  ]);

  if(recentProgress.error) throw recentProgress.error;
  if(friendship.error) {
    console.error("Friendship fetch error:", friendship.error);
  }

  return {
    profile,
    activeEnrollment,
    recentProgress: recentProgress.data,
    prs,
    friendship: friendship.data
  };
};

export const searchUsers = async (searchTerm) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, photo_url')
    .ilike('display_name', `%${searchTerm}%`)
    .neq('id', user.id)
    .limit(10);
  
  if (error) throw error;
  return data;
};

export const getFriends = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { friends: [], requests: [] };

  const { data, error } = await supabase
    .from('friends')
    .select('*, user1:profiles!user_id_1(id, display_name, photo_url), user2:profiles!user_id_2(id, display_name, photo_url)')
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

  if (error) throw error;
  
  const friends = data
    .filter(f => f.status === 'accepted')
    .map(f => (f.user_id_1 === user.id ? f.user2 : f.user1));

  const requests = data
    .filter(f => f.status === 'pending' && f.action_user_id !== user.id)
    .map(f => (f.user_id_1 === user.id ? f.user2 : f.user1));

  return { friends, requests };
};

export const addFriend = async (friendId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const [user_id_1, user_id_2] = [user.id, friendId].sort();

  const { error } = await supabase
    .from('friends')
    .insert({
      user_id_1,
      user_id_2,
      status: 'pending',
      action_user_id: user.id
    });

  if (error) {
    if (error.code === '23505') { // unique_violation
      throw new Error('Ya existe una solicitud de amistad con este usuario.');
    }
    throw error;
  }
};

export const respondToFriendRequest = async (friendId, accept) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const [user_id_1, user_id_2] = [user.id, friendId].sort();

  if (accept) {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted', action_user_id: user.id })
      .eq('user_id_1', user_id_1)
      .eq('user_id_2', user_id_2);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id_1', user_id_1)
      .eq('user_id_2', user_id_2);
    if (error) throw error;
  }
};

// Eliminar a un amigo existente (status aceptado)
export const removeFriend = async (friendId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const [user_id_1, user_id_2] = [user.id, friendId].sort();

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('user_id_1', user_id_1)
    .eq('user_id_2', user_id_2);
  if (error) throw error;
};

// Nueva función para obtener logros de programas (inscripciones completadas)
export const getUserAchievements = async (userId = null) => {
  let userToFetch = userId;
  if (!userToFetch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    userToFetch = user.id;
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      started_at,
      completed_at,
      program:programs(
        id,
        name,
        description,
        level,
        cover_url
      )
    `)
    .eq('user_id', userToFetch)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }

  // Para cada logro, obtener el conteo de sesiones completadas
  const achievementsWithProgress = await Promise.all(
    data.map(async (achievement) => {
      const { count: completedSessions } = await supabase
        .from('session_progress')
        .select('*', { count: 'exact', head: true })
        .eq('enrollment_id', achievement.id)
        .eq('completed', true);

      return {
        ...achievement,
        completed_sessions: completedSessions || 0
      };
    })
  );

  return achievementsWithProgress;
};

// Nueva función para obtener estadísticas de logros del usuario
export const getUserAchievementStats = async (userId = null) => {
  let userToFetch = userId;
  if (!userToFetch) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalPrograms: 0, totalSessions: 0 };
    userToFetch = user.id;
  }

  // Contar programas completados
  const { count: totalPrograms } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userToFetch)
    .eq('status', 'completed');

  // Contar sesiones completadas totales de todas las inscripciones
  const { count: totalSessions } = await supabase
    .from('session_progress')
    .select(`
      id,
      enrollment:enrollments!inner(user_id)
    `, { count: 'exact', head: true })
    .eq('completed', true)
    .eq('enrollment.user_id', userToFetch);

  return {
    totalPrograms: totalPrograms || 0,
    totalSessions: totalSessions || 0
  };
};

// Obtener alumnos inscritos activamente a un programa específico (para vista de usuarios regulares)
export const getProgramEnrolledStudents = async (programId) => {
  if (!programId) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      user_id,
      program_id,
      profiles:user_id(display_name, photo_url),
      program:program_id(name)
    `)
    .eq('program_id', programId)
    .eq('status', 'active');
  if (error) {
    console.error('Error fetching program enrolled students:', error);
    return [];
  }
  return (data || [])
    .filter(e => e.user_id !== user.id) // excluir al propio usuario
    .map(e => ({
      id: e.user_id,
      display_name: e.profiles?.display_name,
      photo_url: e.profiles?.photo_url,
      program_id: e.program_id,
      program_name: e.program?.name
    }));
};
