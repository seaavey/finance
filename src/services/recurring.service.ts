import { useSupabase } from '@/lib/supabase'
import type { Result, RecurringRow, RecurringInsert, RecurringUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function queryRecurring(userId: string): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('active, amount, category_id, created_at, currency, description, frequency, id, next_date, type, updated_at, user_id')
    .eq('user_id', userId)
    .order('next_date', { ascending: true })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as RecurringTransaction[]) || [], error: null }
}

export async function createRecurring(recurring: RecurringInsert): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('recurring_transactions').insert(recurring).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as RecurringTransaction, error: null }
}

export async function updateRecurring(
  id: string,
  updates: RecurringUpdate,
): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('recurring_transactions').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as RecurringTransaction, error: null }
}

export async function deleteRecurring(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function queryDueRecurring(userId: string, today: string): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('active, amount, category_id, created_at, currency, description, frequency, id, next_date, type, updated_at, user_id')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('next_date', today)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as RecurringTransaction[]) || [], error: null }
}
