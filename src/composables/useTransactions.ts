import { computed } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Database } from '@/types/database'

export interface SplitItem {
  category_id: string
  amount: number
  description?: string
}

/** Maps to Database['public']['Tables']['transactions']['Row'] */
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
  image_url: string | null
  splits: SplitItem[]
  created_at: string | null
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category_id?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  account_id?: string
  currency?: string
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
  const totalCount = ref(0)

  const pageSize = ref(10)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  const buildQuery = (filters?: TransactionFilters) => {
    let query = supabase
      .from('transactions')
      .select(
        'id, user_id, type, amount, currency, category_id, description, date, account_id, image_url, splits, created_at',
      )
      .order('date', { ascending: false })

    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.category_id) query = query.eq('category_id', filters.category_id)
    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('date', filters.dateTo)
    if (filters?.search) query = query.ilike('description', `%${filters.search}%`)
    if (filters?.amountMin) query = query.gte('amount', filters.amountMin)
    if (filters?.amountMax) query = query.lte('amount', filters.amountMax)
    if (filters?.account_id) query = query.eq('account_id', filters.account_id)
    if (filters?.currency) query = query.eq('currency', filters.currency)
    return query
  }

  const buildCountQuery = (filters?: TransactionFilters) => {
    let query = supabase.from('transactions').select('*', { count: 'exact', head: true })

    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.category_id) query = query.eq('category_id', filters.category_id)
    if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('date', filters.dateTo)
    if (filters?.search) query = query.ilike('description', `%${filters.search}%`)
    if (filters?.amountMin) query = query.gte('amount', filters.amountMin)
    if (filters?.amountMax) query = query.lte('amount', filters.amountMax)
    if (filters?.account_id) query = query.eq('account_id', filters.account_id)
    if (filters?.currency) query = query.eq('currency', filters.currency)
    return query
  }

  const { isLoading: loading, refetch: refetchTransactions } = useQuery({
    queryKey: [
      'transactions',
      computed(() => user.value?.id),
      currentFilters,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      const page = currentPage.value
      const from = (page - 1) * pageSize.value
      const to = from + pageSize.value - 1

      const filters = currentFilters.value

      const [dataResult, countResult] = await Promise.all([
        buildQuery(filters).range(from, to),
        buildCountQuery(filters),
      ])

      const { data, error } = dataResult
      if (error) throw error

      totalCount.value = countResult.count ?? 0

      return (data as Transaction[]) || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const transactions = computed(() => loadedTransactions.value)

  const fetchTransactions = async (filters?: TransactionFilters, page = 1) => {
    currentFilters.value = filters
    currentPage.value = page
    loadedTransactions.value = []
    const result = await refetchTransactions()
    if (result.data) {
      loadedTransactions.value = result.data
    }
  }

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    currentPage.value = page
    const result = await refetchTransactions()
    if (result.data) {
      loadedTransactions.value = result.data
    }
  }

  const changePage = async (delta: number) => {
    await goToPage(currentPage.value + delta)
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

  const bulkUpdateTransactions = async (
    ids: string[],
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    if (ids.length === 0) return { error: null }
    const { error } = await supabase.from('transactions').update(updates).in('id', ids)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_updated', { count: ids.length }))
      activity.log('transaction', 'bulk_updated', { count: ids.length, ...updates })
    } else {
      toast.error(t('toast.bulk_transactions_update_error'))
    }
    return { error }
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (ids.length === 0) return { error: null }
    const { error } = await supabase.from('transactions').delete().in('id', ids)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_deleted', { count: ids.length }))
      activity.log('transaction', 'bulk_deleted', { count: ids.length })
    } else {
      toast.error(t('toast.bulk_transactions_delete_error'))
    }
    return { error }
  }

  const getTransaction = async (id: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(
        'id, user_id, type, amount, currency, category_id, description, date, account_id, image_url, splits, created_at',
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
        'id, user_id, type, amount, currency, category_id, description, date, account_id, image_url, splits, created_at',
      )
      .ilike('description', `%${term}%`)
      .order('date', { ascending: false })
      .limit(10)
    return error || !data ? [] : (data as Transaction[])
  }

  const deleteTransactionImage = async (url: string) => {
    let path: string
    try {
      const parsed = new URL(url)
      path = parsed.pathname.replace(/^\/object\/public\/transaction-images\//, '')
    } catch {
      const prefix = '/object/public/transaction-images/'
      const idx = url.indexOf(prefix)
      if (idx === -1) return
      path = url.slice(idx + prefix.length)
    }

    if (!path) return
    await supabase.storage.from('transaction-images').remove([path])
  }

  const uploadTransactionImage = async (file: File): Promise<string | null> => {
    if (!user.value) return null

    const ext = file.name.split('.').pop() || 'png'
    const filePath = `${user.value.id}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from('transaction-images')
      .upload(filePath, file, { upsert: false })

    if (error) {
      toast.error(t('toast.upload_error'))
      return null
    }

    const { data } = supabase.storage.from('transaction-images').getPublicUrl(filePath)
    return data.publicUrl
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
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    fetchTransactions,
    goToPage,
    changePage,
    searchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
    getTransaction,
    uploadTransactionImage,
    deleteTransactionImage,
    monthlySummary,
  }
}
