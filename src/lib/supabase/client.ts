import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwlsvjcqxefoszjfthxd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3bHN2amNxeGVmb3N6amZ0aHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMjExNjksImV4cCI6MjEwMzg5NzE2OX0.-YrOI7Q7Z6qHzv0DjioaRnLVWrB8HcgikZ3lDwiMZC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
