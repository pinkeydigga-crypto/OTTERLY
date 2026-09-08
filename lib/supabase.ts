import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://otsiwrtnkzhrztlpcdjx.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90c2l3cnRua3pocnp0bHBjZGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNzY4MTEsImV4cCI6MjEwMzY1MjgxMX0.Va5iCqbD2JxbKeG9cKoKlBVlM9Gvyr2fXykeoA6jero';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);