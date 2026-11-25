import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqamVwb2tpemhqbGdndmpzbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTM4NzksImV4cCI6MjExMDkyOTg3OX0.nFhP0Hzbq10b776GinIOPVV4Jnl8wp-vO7BfqBxrpc4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
