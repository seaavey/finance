import { useSupabase } from '@/lib/supabase'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { BILL_FIELDS } from '@/services/fields'
import type { Result, BillRow, BillInsert, BillUpdate } from '@/types'

/** Fetches all bills for a user, ordered by due date. */
export async function queryBills(userId: string): Promise<Result<BillRow[]>> {
  const supabase = useSupabase()
  return queryList<BillRow>(
    supabase.from('bills').select(BILL_FIELDS).eq('user_id', userId).order('due_date'),
  )
}

/** Creates a new bill. */
export async function createBill(bill: BillInsert): Promise<Result<BillRow>> {
  const supabase = useSupabase()
  return mutationWithReturn<BillRow>(supabase.from('bills').insert(bill))
}

/** Updates a bill by ID. */
export async function updateBill(id: string, updates: BillUpdate): Promise<Result<BillRow>> {
  const supabase = useSupabase()
  return mutationWithReturn<BillRow>(supabase.from('bills').update(updates).eq('id', id))
}

/** Deletes a bill by ID. */
export async function deleteBill(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(supabase.from('bills').delete().eq('id', id))
}

/** Marks a bill as paid, optionally linking it to the paying account. */
export async function markBillAsPaid(
  id: string,
  accountId?: string | null,
): Promise<Result<BillRow>> {
  return updateBill(id, {
    is_paid: true,
    paid_with_account_id: accountId || null,
  })
}
