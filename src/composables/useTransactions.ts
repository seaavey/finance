import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  queryTransactions,
  getTransaction as getTxService,
  createTransaction as createTxService,
  updateTransaction as updateTxService,
  deleteTransaction as deleteTxService,
  bulkUpdateTransactions as bulkUpdateTxService,
  bulkDeleteTransactions as bulkDeleteTxService,
  searchTransactions as searchTxService,
  uploadTransactionImage as uploadImageService,
  deleteTransactionImage as deleteImageService,
} from '@/services/transaction.service'
import type { TransactionFilters as ServiceFilters } from '@/services/transaction.service'
import type { Database } from '@/types'

export interface SplitItem {
  category_id: string
  amount: number
  description?: string
  [key: string]: any
}

export type Transaction = Omit<Database['public']['Tables']['transactions']['Row'], 'splits'> & {
  splits: any
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

export const useTransactions = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const activity = useActivityLog()
  const { user } = useAuth()

  const currentFilters = ref<TransactionFilters | undefined>(undefined)
  const currentPage = ref(1)
  const loadedTransactions = ref<Transaction[]>([])
  const totalCount = ref(0)
  const pageSize = ref(20)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  const { isLoading: loading, refetch: refetchTransactions } = useQuery({
    queryKey: [
      'transactions',
      computed(() => user.value?.id),
      currentFilters,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      if (!user.value) return []

      const filters: ServiceFilters = {
        type: currentFilters.value?.type,
        category_id: currentFilters.value?.category_id,
        search: currentFilters.value?.search,
        startDate: currentFilters.value?.dateFrom,
        endDate: currentFilters.value?.dateTo,
        account_id: currentFilters.value?.account_id,
      }

      const result = await queryTransactions(user.value.id, filters, currentPage.value, pageSize.value)
      if (result.error) throw result.error

      totalCount.value = result.data?.count || 0
      return (result.data?.data as Transaction[]) || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const transactions = computed<Transaction[]>(() => loadedTransactions.value)

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

  const addTransaction = async (
    tx: Omit<Database['public']['Tables']['transactions']['Insert'], 'user_id' | 'created_at'>,
  ) => {
    if (!user.value) return { error: { message: 'Not authenticated' } }

    const result = await createTxService({ ...tx, user_id: user.value.id } as any)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_added'))
      if (result.data) {
        activity.log(
          'transaction',
          'created',
          {
            description: tx.description || '',
            amount: tx.amount,
            type: tx.type,
          },
          result.data.id,
        )
      }
    } else {
      toast.error(t('toast.transaction_add_error'))
    }
    return { error: result.error }
  }

  const updateTransaction = async (
    id: string,
    updates: Database['public']['Tables']['transactions']['Update'],
  ) => {
    const result = await updateTxService(id, updates)

    if (!result.error) {
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
    return { error: result.error }
  }

  const deleteTransaction = async (id: string) => {
    const result = await deleteTxService(id)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.transaction_deleted'))
      activity.log('transaction', 'deleted', {}, id)
    } else {
      toast.error(t('toast.transaction_delete_error'))
    }
    return { error: result.error }
  }

  const bulkUpdateTransactions = async (
    ids: string[],
    updates: Database['public']['Tables']['transactions']['Update'],
  ) => {
    if (ids.length === 0) return { error: null }
    const result = await bulkUpdateTxService(ids, updates)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_updated', { count: ids.length }))
      activity.log('transaction', 'bulk_updated', { count: ids.length, ...updates })
    } else {
      toast.error(t('toast.bulk_transactions_update_error'))
    }
    return { error: result.error }
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (ids.length === 0) return { error: null }
    const result = await bulkDeleteTxService(ids)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success(t('toast.bulk_transactions_deleted', { count: ids.length }))
      activity.log('transaction', 'bulk_deleted', { count: ids.length })
    } else {
      toast.error(t('toast.bulk_transactions_delete_error'))
    }
    return { error: result.error }
  }

  const getTransaction = async (id: string) => {
    return getTxService(id)
  }

  const searchTransactions = async (term: string): Promise<Transaction[]> => {
    if (!user.value || !term.trim()) return []
    const result = await searchTxService(user.value.id, term)
    return (result.data as Transaction[]) || []
  }

  const deleteTransactionImage = async (url: string) => {
    const result = await deleteImageService(url)
    return { error: result.error }
  }

  const uploadTransactionImage = async (file: File): Promise<string | null> => {
    if (!user.value) return null
    const result = await uploadImageService(user.value.id, file)
    if (result.error) {
      toast.error(t('toast.upload_error'))
      return null
    }
    return result.data
  }

  const monthlySummary = computed(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    const txs = transactions.value
    const monthTxs = txs.filter((tx) => {
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
