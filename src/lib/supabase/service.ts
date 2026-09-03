import { supabase } from './client';

export async function syncToSupabase(table: string, data: any[]) {
  try {
    const { error } = await supabase.from(table).upsert(data, { ignoreDuplicates: false });
    if (error) {
      console.warn(`Supabase sync warning for table ${table}:`, error.message);
    }
    return !error;
  } catch (err) {
    console.warn(`Supabase connection error on table ${table}:`, err);
    return false;
  }
}

export async function fetchFromSupabase(table: string, queryFn?: (q: any) => any) {
  try {
    let q = supabase.from(table).select('*');
    if (queryFn) q = queryFn(q);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn(`Supabase fetch failed for table ${table}, falling back to local engine:`, err);
    return null;
  }
}
