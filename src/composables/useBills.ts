import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryBills,
  createBill as createBillService,
  updateBill as updateBillService,
  deleteBill as deleteBillService,
  markBillAsPaid as markAsPaidService,
} from '@/services/bill.service'
import type { Bill, BillInsert, Database } from '@/types'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

export const useBills = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { mutate } = useMutationFeedback()

  const {
    data: billsData,
    isLoading: loading,
    refetch: fetchBills,
  } = useQuery({
    queryKey: [QUERY_KEYS.BILLS, computed(() => user.value?.id)],
    queryFn: async (): Promise<Bill[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryBills(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DAILY,
  })

  const bills = computed(() => billsData.value || [])

  const addBill = async (
    bill: Omit<
      Database['public']['Tables']['bills']['Insert'],
      'user_id' | 'created_at' | 'is_paid'
    >,
  ) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () =>
        createBillService({
          ...bill,
          user_id: user.value!.id,
          is_paid: false,
        } as BillInsert),
      {
        entity: 'bill',
        action: 'created',
        queryClient,
        queryKeys: [['bills']],
        successKey: 'bills.saved',
        errorKey: 'bills.save_error',
        meta: { name: bill.title, amount: bill.amount },
      },
    )
  }

  const updateBill = async (
    id: string,
    updates: Database['public']['Tables']['bills']['Update'],
  ) => {
    return mutate(() => updateBillService(id, updates), {
      entity: 'bill',
      action: 'updated',
      queryClient,
      queryKeys: [['bills']],
      successKey: 'bills.saved',
      errorKey: 'bills.save_error',
      meta: { name: updates.title ?? '', amount: updates.amount ?? 0 },
      entityId: id,
    })
  }

  const deleteBill = async (id: string) => {
    const billTitle = bills.value.find((b) => b.id === id)?.title || ''

    return mutate(() => deleteBillService(id), {
      entity: 'bill',
      action: 'deleted',
      queryClient,
      queryKeys: [['bills']],
      successKey: 'bills.deleted',
      errorKey: 'bills.delete_error',
      meta: { name: billTitle },
      entityId: id,
    })
  }

  const markAsPaid = async (id: string, accountId?: string) => {
    return mutate(() => markAsPaidService(id, accountId), {
      entity: 'bill',
      action: 'paid',
      queryClient,
      queryKeys: [['bills']],
      successKey: 'bills.saved',
      errorKey: 'bills.save_error',
      entityId: id,
    })
  }

  return {
    bills,
    loading,
    fetchBills,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid,
  }
}
