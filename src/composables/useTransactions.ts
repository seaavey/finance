import { computed } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  currency: string
  category_id: string | null
  description: string | null
  date: string
  account_id: string | null
  created_at: string
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category_id?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

const PAGE_SIZE = 50

export const useTransactions = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const activity = useActivityLog()
  const { user } = useAuth()

  const currentFilters = ref<TransactionFilters | undefined>(undefined)
  const currentPage = ref(1)
  const loadedTransactions = ref<Transaction[]>([])
  const hasMore = ref(true)
  const loadingMore = ref(false)

  const { isLoading: loading, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', computed(() => user.value?.id), currentFilters, currentPage],
    queryFn: async () => {
      const page = currentPage.value
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('transactions')
        .select(
          'id, user_id, type, amount, currency, category_id, description, date, account_id, created_at',
        )
        .order('date', { ascending: false })
        .range(from, to)

      const filters = currentFilters.value
      if (filters?.type) query = query.eq('type', filters.type)
      if (filters?.category_id) query = query.eq('category_id', filters.category_id)
      if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
      if (filters?.dateTo) query = query.lte('date', filters.dateTo)
      if (filters?.search) query = query.ilike('description', `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      const items = (data as Transaction[]) || []

      // If fewer items than page size, this was the last page
      hasMore.value = items.length >= PAGE_SIZE

      return items
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const transactions = computed(() => loadedTransactions.value)

  const fetchTransactions = async (filters?: TransactionFilters) => {
    currentFilters.value = filters
    currentPage.value = 1
    hasMore.value = true
    loadedTransactions.value = []
    const result = await refetchTransactions()
    if (result.data) {
      loadedTransactions.value = result.data
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value || loading.value) return
    loadingMore.value = true
    currentPage.value += 1
    const result = await refetchTransactions()
    if (result.data) {
      loadedTransactions.value = [...loadedTransactions.value, ...result.data]
    }
    loadingMore.value = false
  }

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user.value) {
      return { error: { message: 'Not authenticated' } }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...tx, user_id: user.value.id })
      .select()

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_added'))
      if (data) {
        activity.log(
          'transaction',
          'created',
          {
            description: tx.description || '',
            amount: tx.amount,
            type: tx.type,
          },
          data[0]?.id,
        )
      }
    } else {
      toast.error(t('toast.transaction_add_error'))
    }
    return { error }
  }

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    const { error } = await supabase.from('transactions').update(updates).eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_updated'))
      activity.log(
        'transaction',
        'updated',
        {
          description: updates.description || '',
          amount: updates.amount,
        },
        id,
      )
    } else {
      toast.error(t('toast.transaction_update_error'))
    }
    return { error }
  }

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_deleted'))
      activity.log('transaction', 'deleted', {}, id)
    } else {
      toast.error(t('toast.transaction_delete_error'))
    }
    return { error }
  }

  const getTransaction = async (id: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id, user_id, type, amount, currency, category_id, description, date, account_id, created_at',
      )
      .eq('id', id)
      .single()

    return { data: data as Transaction | null, error }
  }

  const searchTransactions = async (term: string): Promise<Transaction[]> => {
    if (!term.trim()) {
      return []
    }
    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id, user_id, type, amount, currency, category_id, description, date, account_id, created_at',
      )
      .ilike('description', `%${term}%`)
      .order('date', { ascending: false })
      .limit(10)
    return error || !data ? [] : (data as Transaction[])
  }

  const monthlySummary = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const monthTxs = transactions.value.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() === month && d.getFullYear() === year
    })

    const income = monthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    const expense = monthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)

    return { income, expense, balance: income - expense }
  })

  return {
    transactions,
    loading,
    hasMore,
    loadingMore,
    fetchTransactions,
    loadMore,
    searchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    monthlySummary,
  }
}
