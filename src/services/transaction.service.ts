import { useSupabase } from '@/lib/supabase'
import type { Result, Transaction, TransactionInsert, TransactionUpdate, TransactionFilters } from '@/types'
import { AppError } from '@/types/result'

export async function queryTransactions(
  userId: string,
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 20,
): Promise<Result<{ data: Transaction[]; count: number }>> {
  const supabase = useSupabase()
  const { type, category_id, search, startDate, endDate, account_id } = filters

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (type) query = query.eq('type', type)
  if (category_id) query = query.eq('category_id', category_id)
  if (account_id) query = query.eq('account_id', account_id)
  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)
  if (search) query = query.ilike('description', `%${search}%`)

  const { data, error, count } = await query

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: { data: (data as unknown as Transaction[]) || [], count: count || 0 }, error: null }
}

export async function getTransaction(id: string): Promise<Result<Transaction>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as unknown as Transaction, error: null }
}

export async function createTransaction(tx: TransactionInsert): Promise<Result<Transaction>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('transactions').insert(tx).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as unknown as Transaction, error: null }
}

export async function updateTransaction(
  id: string,
  updates: TransactionUpdate,
): Promise<Result<Transaction>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as unknown as Transaction, error: null }
}

export async function deleteTransaction(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function bulkUpdateTransactions(
  ids: string[],
  updates: TransactionUpdate,
): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('transactions').update(updates).in('id', ids)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function bulkDeleteTransactions(ids: string[]): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('transactions').delete().in('id', ids)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function searchTransactions(
  userId: string,
  term: string,
  limit = 10,
): Promise<Result<Transaction[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .ilike('description', `%${term}%`)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as unknown as Transaction[]) || [], error: null }
}

export async function getTransactionSummary(
  userId: string,
  startDate: string,
  endDate: string,
  targetCurrency: string,
): Promise<Result<{ total_income: number; total_expense: number; balance: number }>> {
  const supabase = useSupabase()
  // Cast to any to bypass generated types that don't include new RPCs yet
  const { data, error } = await (supabase as any).rpc('get_transaction_summary', {
    p_user_id: userId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_target_currency: targetCurrency,
  })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  const result = data && data.length > 0 ? data[0] : { total_income: 0, total_expense: 0, balance: 0 }
  return { data: result, error: null }
}

export async function getCategoryStats(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<Result<{ category_id: string; transaction_count: number; total_amount: number }[]>> {
  const supabase = useSupabase()
  const { data, error } = await (supabase as any).rpc('get_category_stats', {
    p_user_id: userId,
    p_start_date: startDate || '1970-01-01',
    p_end_date: endDate || '9999-12-31',
  })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as any) || [], error: null }
}

export async function uploadTransactionImage(userId: string, file: File): Promise<Result<string>> {
  const supabase = useSupabase()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('transaction-attachments').upload(path, file)
  if (error) return { data: null, error: new AppError(error.message, 'UPLOAD_ERROR', error) }

  const { data } = supabase.storage.from('transaction-attachments').getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}

export async function deleteTransactionImage(url: string): Promise<Result<null>> {
  const supabase = useSupabase()
  let path: string
  try {
    const parsed = new URL(url)
    path = parsed.pathname.split('/').slice(-2).join('/')
  } catch {
    return { data: null, error: new AppError('Invalid image URL', 'INVALID_URL') }
  }

  const { error } = await supabase.storage.from('transaction-attachments').remove([path])
  if (error) return { data: null, error: new AppError(error.message, 'DELETE_ERROR', error) }

  return { data: null, error: null }
}
