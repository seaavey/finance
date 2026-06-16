import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryRecurring,
  queryDueRecurring,
  createRecurring as createRecurringService,
  updateRecurring as updateRecurringService,
  deleteRecurring as deleteRecurringService,
} from '@/services/recurring.service'
import { createTransaction as createTxService } from '@/services/transaction.service'
import { formatDateSafe } from '@/lib/utils'
import type {
  RecurringTransaction,
  TransactionInsert,
  RecurringInsert,
  RecurringUpdate,
} from '@/types'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

export type { RecurringTransaction }

export const useRecurring = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { mutate } = useMutationFeedback()

  const {
    data: recurringData,
    isLoading: loading,
    refetch: fetchRecurring,
  } = useQuery({
    queryKey: [QUERY_KEYS.RECURRING, computed(() => user.value?.id)],
    queryFn: async (): Promise<RecurringTransaction[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryRecurring(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.RARELY,
  })

  const recurring = computed(() => recurringData.value || [])

  const addRecurring = async (item: Omit<RecurringInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () =>
        createRecurringService({
          ...item,
          user_id: user.value!.id,
        } as RecurringInsert),
      {
        entity: 'recurring',
        action: 'created',
        queryClient,
        queryKeys: [['recurring']],
        successKey: 'toast.recurring_added',
        errorKey: 'toast.recurring_add_error',
        meta: { description: item.description || item.type, amount: item.amount },
      },
    )
  }

  const updateRecurring = async (id: string, updates: RecurringUpdate) => {
    return mutate(() => updateRecurringService(id, updates), {
      entity: 'recurring',
      action: 'updated',
      queryClient,
      queryKeys: [['recurring']],
      successKey: 'toast.recurring_updated',
      errorKey: 'toast.recurring_update_error',
      meta: { description: updates.description ?? updates.type ?? '' },
      entityId: id,
    })
  }

  const deleteRecurring = async (id: string) => {
    const recurringItem = recurring.value.find((r) => r.id === id)

    return mutate(() => deleteRecurringService(id), {
      entity: 'recurring',
      action: 'deleted',
      queryClient,
      queryKeys: [['recurring']],
      successKey: 'toast.recurring_deleted',
      errorKey: 'toast.recurring_delete_error',
      meta: { description: recurringItem?.description || recurringItem?.type || '' },
      entityId: id,
    })
  }

  const toggleActive = async (id: string, active: boolean) => {
    return updateRecurring(id, { active })
  }

  /**
   * Process due recurring transactions — creates actual transactions and
   * advances next_date. Should be called on app startup and after toggling
   * a recurring item active.
   */
  const processDueRecurring = async (): Promise<number> => {
    if (!user.value) return 0

    const today = formatDateSafe(new Date())
    const result = await queryDueRecurring(user.value.id, today)

    if (result.error || !result.data || result.data.length === 0) return 0

    let created = 0

    for (const item of result.data) {
      // 1. Create the actual transaction
      const txResult = await createTxService({
        user_id: user.value.id,
        type: item.type,
        amount: item.amount,
        currency: item.currency,
        category_id: item.category_id,
        description: `[Auto] ${item.description || ''}`.trim(),
        date: today,
        account_id: null,
        image_url: null,
        splits: [],
      } as TransactionInsert)

      if (txResult.error) {
        console.error('Failed to create recurring transaction:', txResult.error)
        continue
      }

      // 2. Advance next_date based on frequency
      const next = new Date(item.next_date)
      switch (item.frequency) {
        case 'daily':
          next.setDate(next.getDate() + 1)
          break
        case 'weekly':
          next.setDate(next.getDate() + 7)
          break
        case 'monthly':
          next.setMonth(next.getMonth() + 1)
          break
        case 'yearly':
          next.setFullYear(next.getFullYear() + 1)
          break
      }
      const nextDate = formatDateSafe(next)

      await updateRecurringService(item.id, { next_date: nextDate })
      created++
    }

    if (created > 0) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECURRING] })
      toast.success(t('toast.recurring_processed', { count: String(created) }))
    }

    return created
  }

  return {
    recurring,
    loading,
    fetchRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    processDueRecurring,
  }
}
