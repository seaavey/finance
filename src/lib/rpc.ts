import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'

/**
 * Calls a Supabase RPC function by name.
 * Centralizes the `as any` cast needed because the Database type
 * lacks per-function return generics.
 *
 * @param name - Name of the RPC function defined in Supabase
 * @param params - Parameters to pass to the RPC function
 * @returns Result containing the RPC return value, or an AppError
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
 * Calls a Supabase Edge Function via POST with an Authorization header.
 * The header acts as a CSRF shield — browsers cannot set custom headers
 * cross-origin without CORS preflight.
 *
 * @param functionName - Name of the Edge Function (the path segment after /functions/v1/)
 * @param body - JSON payload to send in the request body
 * @returns Result containing the parsed response, or an AppError
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
