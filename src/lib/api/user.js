import { supabase } from '@/lib/customSupabaseClient';
import * as dateFnsTz from 'date-fns-tz';

const TIME_ZONE = 'America/Montevideo';

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
    .eq('completed', true);
  
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

    const today = dateFnsTz.utcToZonedTime(new Date(), TIME_ZONE);
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
      .eq('completed', true);

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

  try {
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket(BUCKET_NAME);
    if (bucketError) {
      if (bucketError.statusCode === '404' || (bucketError.message && bucketError.message.includes("Bucket not found"))) {
        const { error: createBucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg'],
          fileSizeLimit: 1024 * 1024 * 5,
        });
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          throw createBucketError;
        }
      } else {
        console.error('Error getting bucket:', bucketError);
        throw bucketError;
      }
    }
  } catch (error) {
     console.error('Error checking/creating bucket:', error);
     throw error;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
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
