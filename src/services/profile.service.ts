import { useSupabase } from '@/lib/supabase'
import { querySingle } from '@/lib/query-wrapper'
import type { Result } from '@/types'

export async function getProfileCurrency(userId: string): Promise<Result<string | null>> {
  const supabase = useSupabase()
  const result = await querySingle<{ currency: string | null }>(
    supabase.from('profiles').select('currency').eq('id', userId),
  )

  if (result.error) return result
  return { data: result.data?.currency || null, error: null }
}
