import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'

/**
 * Call a Supabase RPC.
 * Centralizes the `(supabase as any).rpc()` cast so it's in one place.
 *
 * @example
 *   const result = await rpc<AccountWithBalance[]>('get_account_balances', { p_user_id: userId })
 */
export async function rpc<T>(
  name: string,
  params: Record<string, unknown> = {},
): Promise<Result<T>> {
  const supabase = useSupabase()
  const { data, error } = await (supabase as any).rpc(name, params)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}
