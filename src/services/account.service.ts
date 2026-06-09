import { useSupabase } from '@/lib/supabase'
import { rpc } from '@/lib/rpc'
import { queryList, querySingle, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { ACCOUNT_FIELDS } from '@/services/fields'
import type { Account, Result, AccountInsert, AccountUpdate, AccountWithBalance } from '@/types'

export async function queryAccounts(userId: string): Promise<Result<Account[]>> {
  const supabase = useSupabase()
  return queryList<Account>(
    supabase
      .from('accounts')
      .select(ACCOUNT_FIELDS)
      .eq('user_id', userId)
      .order('created_at'),
  )
}

export async function getAccount(id: string): Promise<Result<Account>> {
  const supabase = useSupabase()
  return querySingle<Account>(
    supabase.from('accounts').select(ACCOUNT_FIELDS).eq('id', id),
  )
}

export async function createAccount(account: AccountInsert): Promise<Result<Account>> {
  const supabase = useSupabase()
  return mutationWithReturn<Account>(
    supabase.from('accounts').insert(account),
  )
}

export async function updateAccount(id: string, updates: AccountUpdate): Promise<Result<Account>> {
  const supabase = useSupabase()
  return mutationWithReturn<Account>(
    supabase.from('accounts').update(updates).eq('id', id),
  )
}

export async function deleteAccount(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('accounts').delete().eq('id', id),
  )
}

export async function queryAccountBalances(userId: string): Promise<Result<AccountWithBalance[]>> {
  return rpc<AccountWithBalance[]>('get_account_balances', { p_user_id: userId })
}
