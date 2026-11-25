import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'sb_publishable_59kT9D7d8EFGqeM41oGDSA_DB3oc-1u';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
