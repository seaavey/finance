import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let client: SupabaseClient<Database> | null = null

export const useSupabase = () => {
  if (!client) {
    client = createClient<Database>(
      import.meta.env.VITE_PUBLIC_SUPABASE_URL as string,
      import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string,
    )
  }
  return client
}
