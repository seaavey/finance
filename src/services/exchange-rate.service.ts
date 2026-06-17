import { useSupabase } from '@/lib/supabase'
import { queryList } from '@/lib/query-wrapper'
import type { Result } from '@/types'

/** Fetches all exchange rates and returns them as a currency-code-to-rate map. */
export async function queryExchangeRates(): Promise<Result<Record<string, number>>> {
  const supabase = useSupabase()
  const result = await queryList<{ target_currency: string; rate: number }>(
    supabase.from('exchange_rates').select('target_currency, rate'),
  )

  if (result.error) return result

  const map: Record<string, number> = {}
  for (const row of result.data) {
    map[row.target_currency] = Number(row.rate)
  }
  return { data: map, error: null }
}
