import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const useSupabase = () => {
  if (!client) {
    client = createClient(
      import.meta.env.VITE_PUBLIC_SUPABASE_URL as string,
      import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string,
    )
  }
  return client
}
