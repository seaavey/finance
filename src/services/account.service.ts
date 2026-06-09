import { useSupabase } from '@/lib/supabase'
import { rpc } from '@/lib/rpc'
import { ACCOUNT_FIELDS } from '@/services/fields'
import type { Account, Result, AccountInsert, AccountUpdate, AccountWithBalance } from '@/types'
import { AppError } from '@/types/result'

export async function queryAccounts(userId: string): Promise<Result<Account[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_FIELDS)
    .eq('user_id', userId)
    .order('created_at')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as Account[]) || [], error: null }
}

export async function getAccount(id: string): Promise<Result<Account>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').select(ACCOUNT_FIELDS).eq('id', id).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as Account, error: null }
}

export async function createAccount(account: AccountInsert): Promise<Result<Account>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').insert(account).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as Account, error: null }
}

export async function updateAccount(id: string, updates: AccountUpdate): Promise<Result<Account>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('accounts').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as Account, error: null }
}

export async function deleteAccount(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('accounts').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function queryAccountBalances(userId: string): Promise<Result<AccountWithBalance[]>> {
  return rpc<AccountWithBalance[]>('get_account_balances', { p_user_id: userId })
}
