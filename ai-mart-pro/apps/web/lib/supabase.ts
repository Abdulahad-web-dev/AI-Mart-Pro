import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/** Browser-safe Supabase client (anon key; access is governed by RLS policies). */
export const supabase = createClient(url, anonKey);
