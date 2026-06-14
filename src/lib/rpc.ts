import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'

/**
 * Call a Supabase RPC.
 * Centralizes the `(supabase as any).rpc()` cast so it's in one place.
 *
 * The `as any` cast is intentional: Supabase `rpc()` return type varies
 * between `{ data: T }` (newer) and `{ data: T; count: null }` depending
 * on the PostgREST version. The app's Database type (PostgrestVersion 14.5)
 * doesn't provide per-function return generics yet — once it does, remove
 * the cast and use `supabase.rpc<T>(name, params)` directly.
 *
 * @example
 *   const result = await rpc<AccountWithBalance[]>('get_account_balances', { p_user_id: userId })
 */
export async function rpc<T>(
  name: string,
  params: Record<string, unknown> = {},
): Promise<Result<T>> {
  const supabase = useSupabase()
  // @ts-expect-error Supabase RPC return type depends on PostgREST version — see JSDoc above
  const { data, error } = await supabase.rpc(name, params)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}

/**
 * Call a Supabase Edge Function with anti-forgery (Authorization header).
 * Replaces raw fetch() calls to Edge Functions scattered across the codebase.
 *
 * The `Authorization: Bearer <session>` header acts as a CSRF shield because
 * browsers cannot set custom headers cross-origin without CORS preflight.
 *
 * @example
 *   const result = await callEdgeFunction('send-couple-invite', { recipient_email })
 */
export async function callEdgeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<Result<T>> {
  const supabase = useSupabase()
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const data: T = await res.json()

    if (!res.ok) {
      const msg =
        res.status === 401 || res.status === 403
          ? 'Unauthorized'
          : `Edge function error: ${res.status}`
      return { data: null, error: new AppError(msg, `EDGE_${res.status}`) }
    }

    return { data, error: null }
  } catch (e) {
    return {
      data: null,
      error: new AppError('Network error calling edge function', 'EDGE_NETWORK'),
    }
  }
}
