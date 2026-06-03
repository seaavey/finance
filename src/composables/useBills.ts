import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export interface Bill {
  id: string
  user_id: string
  title: string
  amount: number
  due_date: string
  is_paid: boolean
  paid_with_account_id?: string | null
  recurrence: 'none' | 'weekly' | 'monthly'
  created_at: string
  updated_at: string
}

export const useBills = () => {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  const {
    data: billsData,
    isLoading: loading,
    refetch: fetchBills,
  } = useQuery({
    queryKey: ['bills', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('bills')
        .select(
          'id, user_id, title, amount, due_date, is_paid, paid_with_account_id, recurrence, created_at',
        )
        .eq('user_id', user.value.id)
        .order('due_date')
      if (error) {
        throw error
      }
      return data as Bill[]
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000, // 1 min — bill status changes infrequently
  })

  const bills = computed(() => billsData.value || [])

  const addBill = async (
    data: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_paid'>,
  ) => {
    if (!user.value) {
      return { error: new Error('Not authenticated') }
    }
    const { error } = await supabase
      .from('bills')
      .insert({ ...data, user_id: user.value.id, is_paid: false })
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.saved'))
      activity.log('bill', 'created', { name: data.title, amount: data.amount })
    } else {
      toast.error(t('bills.save_error'))
    }
    return { error }
  }

  const updateBill = async (
    id: string,
    updates: Partial<
      Pick<
        Bill,
        'title' | 'amount' | 'due_date' | 'is_paid' | 'paid_with_account_id' | 'recurrence'
      >
    >,
  ) => {
    const { error } = await supabase.from('bills').update(updates).eq('id', id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.saved'))
      activity.log('bill', 'updated', { name: updates.title, amount: updates.amount }, id)
    } else {
      toast.error(t('bills.save_error'))
    }
    return { error }
  }

  const deleteBill = async (id: string) => {
    const billTitle = bills.value.find((b) => b.id === id)?.title || ''
    const { error } = await supabase.from('bills').delete().eq('id', id)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      toast.success(t('bills.deleted'))
      activity.log('bill', 'deleted', { name: billTitle }, id)
    } else {
      toast.error(t('bills.delete_error'))
    }
    return { error }
  }

  const markAsPaid = async (id: string, accountId?: string) => {
    return updateBill(id, {
      is_paid: true,
      paid_with_account_id: accountId || null,
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
