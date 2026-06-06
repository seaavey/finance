import { useSupabase } from '@/lib/supabase'
import type { Database } from '@/types'
import type { Result } from '@/types/result'
import { AppError } from '@/types/result'

export type BillRow = Database['public']['Tables']['bills']['Row']
export type BillInsert = Database['public']['Tables']['bills']['Insert']
export type BillUpdate = Database['public']['Tables']['bills']['Update']

export async function queryBills(userId: string): Promise<Result<BillRow[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_date')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data || [], error: null }
}

export async function createBill(bill: BillInsert): Promise<Result<BillRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('bills').insert(bill).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function updateBill(id: string, updates: BillUpdate): Promise<Result<BillRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('bills').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function deleteBill(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('bills').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function markBillAsPaid(id: string, accountId?: string | null): Promise<Result<BillRow>> {
  return updateBill(id, {
    is_paid: true,
    paid_with_account_id: accountId || null,
  })
}
