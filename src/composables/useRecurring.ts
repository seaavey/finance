import type { PostgrestResponse } from '@supabase/supabase-js'
import { computed } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { formatDateSafe } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

import type { Database } from '@/types'

export type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

export const useRecurring = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const {
    data: recurringData,
    isLoading: loading,
    refetch: fetchRecurring,
  } = useQuery({
    queryKey: ['recurring', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.value.id)
        .order('next_date', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 120_000, // 2 min — recurring rarely changes
  })

  const recurring = computed(() => recurringData.value || [])

  const addRecurring = async (
    item: Omit<Database['public']['Tables']['recurring_transactions']['Insert'], 'user_id' | 'created_at'>,
  ) => {
    if (!user.value) {
      return
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .insert({ ...item, user_id: user.value.id } as Database['public']['Tables']['recurring_transactions']['Insert'])

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_added'))
      activity.log('recurring', 'created', {
        description: item.description || item.type,
        amount: item.amount,
      })
    } else {
      toast.error(t('toast.recurring_add_error'))
    }
    return { error }
  }

  const updateRecurring = async (
    id: string,
    updates: Database['public']['Tables']['recurring_transactions']['Update'],
  ) => {
    let error: any
    try {
      const result = await supabase.from('recurring_transactions').update(updates).eq('id', id)
      error = result.error
    } catch (err) {
      console.error('Update recurring threw:', err)
      error = err
    }

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_updated'))
      activity.log('recurring', 'updated', { description: updates.description || updates.type }, id)
    } else {
      toast.error(t('toast.recurring_update_error'))
    }
    return { error }
  }

  const deleteRecurring = async (id: string) => {
    const recurringItem = recurring.value.find((r) => r.id === id)
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
      toast.success(t('toast.recurring_deleted'))
      activity.log(
        'recurring',
        'deleted',
        { description: recurringItem?.description || recurringItem?.type || '' },
        id,
      )
    } else {
      toast.error(t('toast.recurring_delete_error'))
    }
    return { error }
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

    // Fetch due + active recurring items
    const { data: due, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('active', true)
      .lte('next_date', today)

    if (fetchError || !due || due.length === 0) return 0

    let created = 0

    for (const item of due) {
      // 1. Create the actual transaction
      const { error: txError } = await supabase.from('transactions').insert({
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
      })

      if (txError) {
        console.error('Failed to create recurring transaction:', txError)
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

      const { error: updateError } = await supabase
        .from('recurring_transactions')
        .update({ next_date: nextDate })
        .eq('id', item.id)

      if (updateError) {
        console.error('Failed to advance next_date:', updateError)
      }

      created++
    }

    if (created > 0) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['recurring'] })
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
