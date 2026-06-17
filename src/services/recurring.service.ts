import { useSupabase } from '@/lib/supabase'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { validateAmount } from '@/lib/utils'
import { RECURRING_FIELDS } from '@/services/fields'
import type { Result, RecurringTransaction, RecurringInsert, RecurringUpdate } from '@/types'
import { AppError } from '@/types/result'

/** Fetches all recurring transactions for a user, ordered by next date ascending. */
export async function queryRecurring(userId: string): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  return queryList<RecurringTransaction>(
    supabase
      .from('recurring_transactions')
      .select(RECURRING_FIELDS)
      .eq('user_id', userId)
      .order('next_date', { ascending: true }),
  )
}

/** Creates a recurring transaction. Validates the amount. */
export async function createRecurring(
  recurring: RecurringInsert,
): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  const valid = validateAmount(recurring.amount, true)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  return mutationWithReturn<RecurringTransaction>(
    supabase.from('recurring_transactions').insert(recurring),
  )
}

/** Updates a recurring transaction by ID. Validates the amount when provided. */
export async function updateRecurring(
  id: string,
  updates: RecurringUpdate,
): Promise<Result<RecurringTransaction>> {
  const supabase = useSupabase()
  if (updates.amount !== undefined) {
    const valid = validateAmount(updates.amount, true)
    if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  }
  return mutationWithReturn<RecurringTransaction>(
    supabase.from('recurring_transactions').update(updates).eq('id', id),
  )
}

/** Deletes a recurring transaction by ID. */
export async function deleteRecurring(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(supabase.from('recurring_transactions').delete().eq('id', id))
}

/** Fetches active recurring transactions whose next_date is on or before the given date. */
export async function queryDueRecurring(
  userId: string,
  today: string,
): Promise<Result<RecurringTransaction[]>> {
  const supabase = useSupabase()
  return queryList<RecurringTransaction>(
    supabase
      .from('recurring_transactions')
      .select(RECURRING_FIELDS)
      .eq('user_id', userId)
      .eq('active', true)
      .lte('next_date', today),
  )
}
