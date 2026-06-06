import { useSupabase } from '@/lib/supabase'
import type { Database } from '@/types'
import type { Result } from '@/types/result'
import { AppError } from '@/types/result'

export type AccountRow = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

export interface AccountWithBalance extends AccountRow {
  balance: number
}

export async function queryAccounts(userId: string): Promise<Result<AccountRow[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data || [], error: null }
}

export async function getAccount(id: string): Promise<Result<AccountRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function createAccount(account: AccountInsert): Promise<Result<AccountRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').insert(account).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function updateAccount(id: string, updates: AccountUpdate): Promise<Result<AccountRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function deleteAccount(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('accounts').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function queryAccountBalances(userId: string): Promise<Result<AccountWithBalance[]>> {
  const supabase = useSupabase()

  // 1. Fetch accounts
  const { data: accounts, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)

  if (accountError)
    return { data: null, error: new AppError(accountError.message, accountError.code, accountError) }
  if (!accounts?.length) return { data: [], error: null }

  // 2. Fetch all transactions for these accounts to calculate net change
  const accountIds = accounts.map((a) => a.id)
  const { data: txData } = await supabase
    .from('transactions')
    .select('account_id, amount, type, splits')
    .in('account_id', accountIds)

  const netMap = new Map<string, number>()
  for (const tx of txData || []) {
    const amount = Number(tx.amount)
    const factor = tx.type === 'income' ? 1 : -1
    const accountId = tx.account_id || ''
    const current = netMap.get(accountId) || 0
    netMap.set(accountId, current + amount * factor)
  }

  const result: AccountWithBalance[] = accounts.map((a) => ({
    ...a,
    balance: Number(a.initial_balance || 0) + (netMap.get(a.id) || 0),
  }))

  return { data: result, error: null }
}
