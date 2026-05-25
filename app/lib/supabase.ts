import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const useSupabase = () => {
  if (!client) {
    const config = useRuntimeConfig();
    client = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
    );
  }
  return client;
};
