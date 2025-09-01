import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fpjabzhhwwlhgrnhmnby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwamFiemhod3dsaGdybmhtbmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjcxNzgsImV4cCI6MjA3MjA0MzE3OH0.m5i-rU7D46cJnmZAaXV6DzSL3LSKgTyZ0aTwxlGh65w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);