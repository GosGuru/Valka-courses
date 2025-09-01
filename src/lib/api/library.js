
import { supabase } from '@/lib/customSupabaseClient';

export const getLessonCategoriesWithLessons = async () => {
  const { data, error } = await supabase
    .from('lesson_categories')
    .select(`
      *,
      lessons (
        *
      )
    `)
    .order('order', { ascending: true });

  if (error) throw error;
  return data;
};

export const getLessonById = async (id) => {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      category:lesson_categories (
        name
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};
