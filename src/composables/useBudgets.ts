import { computed, ref } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: string
  amount: number
  created_at: string
  updated_at: string
}

export interface BudgetWithProgress extends Budget {
  category_name: string
  category_color: string
  category_icon: string
  spent: number
  rollover: number // remaining from previous month (positive) or overspent (negative)
}

export const useBudgets = () => {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  const currentMonth = ref<string>('')

  const {
    data: budgetsData,
    isLoading: loading,
    refetch: refetchBudgets,
  } = useQuery({
    queryKey: ['budgets', computed(() => user.value?.id), currentMonth],
    queryFn: async () => {
      if (!user.value || !currentMonth.value) return []
      const { data, error } = await supabase
        .from('budgets')
        .select('id, user_id, category_id, month, amount, created_at')
        .eq('user_id', user.value.id)
        .eq('month', currentMonth.value)
        .order('created_at')
      if (error) {
        throw error
      }
      return data as Budget[]
    },
    enabled: computed(() => !!user.value && !!currentMonth.value),
    staleTime: 60_000, // 1 min — budget amounts are monthly-static
  })

  const budgets = computed(() => budgetsData.value || [])

  const fetchBudgets = async (month: string) => {
    currentMonth.value = month
    await refetchBudgets()
  }

  const fetchBudgetWithProgress = async (
    month: string,
    userId?: string,
  ): Promise<BudgetWithProgress[]> => {
    const uid = userId || user.value?.id
    if (!uid) return []

    return queryClient.fetchQuery({
      queryKey: ['budgets:with-progress', uid, month],
      queryFn: async () => {
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('id, user_id, category_id, month, amount, created_at')
          .eq('user_id', uid)
          .eq('month', month)

        const budgetsList = (budgetData as Budget[]) || []

        if (budgetsList.length === 0) {
          return []
        }

        const categoryIds = budgetsList.map((b) => b.category_id)

        const [year, mon] = month.split('-').map(Number)
        const date = new Date(year as number, (mon as number) - 1, 1)
        date.setMonth(date.getMonth() + 1)
        const nextMonth = date.toISOString().slice(0, 10)

        // Previous month range for rollover calculation
        const prevDate = new Date(year as number, (mon as number) - 1, 1)
        prevDate.setMonth(prevDate.getMonth() - 1)
        const prevMonth = prevDate.toISOString().slice(0, 10)

        const [{ data: categoriesData }, { data: txData }] = await Promise.all([
          supabase.from('categories').select('id, name, color, icon').in('id', categoryIds),
          supabase
            .from('transactions')
            .select('category_id, amount')
            .eq('user_id', uid)
            .eq('type', 'expense')
            .gte('date', month)
            .lt('date', nextMonth)
            .in('category_id', categoryIds),
        ])

        const categoryMap = new Map(
          (categoriesData || []).map(
            (c: { id: string; name: string; color: string; icon: string }) => [c.id, c],
          ),
        )

        const spentMap = new Map<string, number>()
        for (const tx of (txData || []) as { category_id: string; amount: number }[]) {
          spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + Number(tx.amount))
        }

        // Compute rollover: fetch previous month budgets + spending for same categories
        const rolloverMap = new Map<string, number>()
        const { data: prevBudgetData } = await supabase
          .from('budgets')
          .select('category_id, amount')
          .eq('user_id', uid)
          .eq('month', prevMonth)
          .in('category_id', categoryIds)

        if (prevBudgetData && prevBudgetData.length > 0) {
          const prevCatIds = [
            ...new Set(prevBudgetData.map((pb: { category_id: string }) => pb.category_id)),
          ]

          const prevBudgetMap = new Map<string, number>()
          for (const pb of prevBudgetData as { category_id: string; amount: number }[]) {
            // If duplicate categories (shouldn't happen but be safe), take the last one
            prevBudgetMap.set(pb.category_id, Number(pb.amount))
          }

          if (prevCatIds.length > 0) {
            const { data: prevTxData } = await supabase
              .from('transactions')
              .select('category_id, amount')
              .eq('user_id', uid)
              .eq('type', 'expense')
              .gte('date', prevMonth)
              .lt('date', month)
              .in('category_id', prevCatIds)

            const prevSpentMap = new Map<string, number>()
            for (const tx of (prevTxData || []) as { category_id: string; amount: number }[]) {
              prevSpentMap.set(tx.category_id, (prevSpentMap.get(tx.category_id) || 0) + Number(tx.amount))
            }

            for (const catId of prevCatIds) {
              const prevAmount = prevBudgetMap.get(catId) || 0
              const prevSpent = prevSpentMap.get(catId) || 0
              // Positive rollover = leftover from last month
              // Negative rollover = overspent last month
              rolloverMap.set(catId, Number(prevAmount) - prevSpent)
            }
          }
        }

        return budgetsList.map((b) => {
          const cat = categoryMap.get(b.category_id)
          return {
            ...b,
            category_name: cat?.name || '-',
            category_color: cat?.color || '#6b7280',
            category_icon: cat?.icon || '',
            spent: spentMap.get(b.category_id) || 0,
            rollover: rolloverMap.get(b.category_id) || 0,
          }
        })
      },
      staleTime: 30_000,
    })
  }

  const setBudget = async (categoryId: string, month: string, amount: number) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('category_id', categoryId)
      .eq('month', month)
      .maybeSingle()

    let error
    if (existing) {
      const result = await supabase.from('budgets').update({ amount }).eq('id', existing.id)
      error = result.error
      if (!error) activity.log('budget', 'updated', { category_name: categoryId, amount })
    } else {
      const result = await supabase.from('budgets').insert({
        user_id: user.value.id,
        category_id: categoryId,
        month,
        amount,
      })
      error = result.error
      if (!error) activity.log('budget', 'created', { category_name: categoryId, amount })
    }

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.saved'))
    } else {
      toast.error(t('budget.save_error'))
    }

    return { error }
  }

  const deleteBudget = async (id: string, month: string) => {
    const budget = budgets.value.find((b) => b.id === id)
    const categoryId = budget?.category_id || ''
    const { error } = await supabase.from('budgets').delete().eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] })
      await fetchBudgets(month)
      toast.success(t('budget.deleted'))
      activity.log('budget', 'deleted', { category_name: categoryId }, id)
    } else {
      toast.error(t('budget.delete_error'))
    }

    return { error }
  }

  const getProgress = (budget: BudgetWithProgress) => {
    const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
    const diff = budget.amount - budget.spent
    const effectiveAmount = budget.amount + budget.rollover
    const effectiveDiff = effectiveAmount - budget.spent
    return {
      percentage: Math.min(pct, 100),
      remaining: Math.max(diff, 0),
      overspent: Math.max(-diff, 0),
      effectiveRemaining: Math.max(effectiveDiff, 0),
      effectiveOverspent: Math.max(-effectiveDiff, 0),
    }
  }

  return {
    budgets,
    loading,
    fetchBudgets,
    fetchBudgetWithProgress,
    setBudget,
    deleteBudget,
    getProgress,
  }
}
