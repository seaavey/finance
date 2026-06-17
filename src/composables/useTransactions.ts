import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, shallowRef } from 'vue'
import { getLocalTimeZone } from '@internationalized/date'
import type { DateRange } from 'reka-ui'
import {
  queryTransactions,
  getTransaction as getTxService,
  createTransaction as createTxService,
  createTransfer as createTransferService,
  updateTransaction as updateTxService,
  deleteTransaction as deleteTxService,
  bulkUpdateTransactions as bulkUpdateTxService,
  bulkDeleteTransactions as bulkDeleteTxService,
  searchTransactions as searchTxService,
  getTransactionSummary as getTxSummaryService,
  getCategoryStats as getCategoryStatsService,
  uploadTransactionImage as uploadImageService,
  deleteTransactionImage as deleteImageService,
} from '@/services/transaction.service'
import type { Transaction, TransactionFilters, TransactionInsert, TransactionUpdate, OwnerFilter } from '@/types'
import { FILTER_ALL, QUERY_KEYS, STALE_TIMES, TRANSFER_CATEGORY_NAMES } from '@/constants'

export type { OwnerFilter }

/**
 * Queries transaction summary (total income, expense, balance) for a date range,
 * with currency conversion to a target currency.
 *
 * @param userId - Reactive ref of the current user's ID.
 * @param startDate - Reactive ref of the start date (ISO string).
 * @param endDate - Reactive ref of the end date (ISO string).
 * @param targetCurrency - Reactive ref of the currency to convert amounts into.
 * @returns TanStack Query result with summary data or null.
 */
export const useTransactionSummary = (
  userId: Ref<string | undefined>,
  startDate: Ref<string>,
  endDate: Ref<string>,
  targetCurrency: Ref<string>,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSACTION_SUMMARY, userId, startDate, endDate, targetCurrency],
    queryFn: async () => {
      if (!userId.value) return null
      const result = await getTxSummaryService(
        userId.value,
        startDate.value,
        endDate.value,
        targetCurrency.value,
      )
      if (result.error) throw result.error
      return result.data
    },
    enabled: computed(() => !!userId.value),
    staleTime: STALE_TIMES.DAILY,
  })
}

/**
 * Queries per-category spending stats (income/expense totals) for a date range.
 *
 * @param userId - Reactive ref of the current user's ID.
 * @param startDate - Optional reactive ref for the start date filter.
 * @param endDate - Optional reactive ref for the end date filter.
 * @returns TanStack Query result with an array of category stat objects.
 */
export const useCategoryStats = (
  userId: Ref<string | undefined>,
  startDate?: Ref<string | undefined>,
  endDate?: Ref<string | undefined>,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY_STATS, userId, startDate, endDate],
    queryFn: async () => {
      if (!userId.value) return []
      const result = await getCategoryStatsService(userId.value, startDate?.value, endDate?.value)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!userId.value),
    staleTime: STALE_TIMES.DAILY,
  })
}

/**
 * Manages transactions with pagination, filtering, and CRUD operations.
 * Supports category and owner filters, date range, search, bulk updates/deletes,
 * image uploads, and inter-account transfers.
 *
 * @returns Reactive `transactions`, `loading`, `totalCount`, `totalPages`, `currentPage`,
 * `pageSize`, `categoryFilter`, `ownerFilter`, `dateRange`, `serverFilters`, `monthlySummary`,
 * and functions: `fetchTransactions`, `goToPage`, `changePage`, `searchTransactions`,
 * `addTransaction`, `addTransfer`, `updateTransaction`, `deleteTransaction`,
 * `bulkUpdateTransactions`, `bulkDeleteTransactions`, `getTransaction`,
 * `uploadTransactionImage`, `deleteTransactionImage`.
 */
export const useTransactions = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const activity = useActivityLog()
  const { user } = useAuth()
  const { partner } = usePartner()
  const { categories } = useCategories()
  const { mutate } = useMutationFeedback()

  const currentPage = ref(1)
  const totalCount = ref(0)
  const pageSize = ref(20)

  // UI Filters
  const categoryFilter = ref('')
  const ownerFilter = ref<OwnerFilter>('all')
  const dateRange = shallowRef<DateRange>({ start: undefined, end: undefined })

  const serverFilters = computed<TransactionFilters>(() => {
    const res: TransactionFilters = {}
    if (categoryFilter.value && categoryFilter.value !== FILTER_ALL) {
      res.category_id = categoryFilter.value
    }
    if (ownerFilter.value === 'mine' && user.value?.id) {
      res.user_id = user.value.id
    } else if (ownerFilter.value === 'partner' && partner.value?.id) {
      res.user_id = partner.value.id
    }
    if (dateRange.value.start) {
      res.startDate = dateRange.value.start.toDate(getLocalTimeZone()).toISOString().slice(0, 10)
    }
    if (dateRange.value.end) {
      res.endDate = dateRange.value.end.toDate(getLocalTimeZone()).toISOString().slice(0, 10)
    }
    return res
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

  const partnerId = computed(() => partner.value?.id)

  const {
    data: transactionsData,
    isLoading: loading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [
      'transactions',
      computed(() => user.value?.id),
      partnerId,
      serverFilters,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      if (!user.value) return { data: [] as Transaction[], count: 0 }

      const result = await queryTransactions(
        user.value.id,
        serverFilters.value,
        currentPage.value,
        pageSize.value,
        partnerId.value,
      )
      if (result.error) throw result.error

      totalCount.value = result.data?.count || 0
      return {
        data: (result.data?.data ?? []) as Transaction[],
        count: result.data?.count || 0,
      }
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DEFAULT,
  })

  const transactions = computed<Transaction[]>(() => transactionsData.value?.data || [])

  const fetchTransactions = async (filters?: TransactionFilters, page = 1) => {
    categoryFilter.value = filters?.category_id || ''
    currentPage.value = page
    await refetchTransactions()
  }

  const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) return
    currentPage.value = page
    await refetchTransactions()
  }

  const changePage = async (delta: number) => {
    await goToPage(currentPage.value + delta)
  }

  const addTransaction = async (tx: Omit<TransactionInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () => createTxService({ ...tx, user_id: user.value!.id } as TransactionInsert),
      {
        entity: 'transaction',
        action: 'created',
        queryClient,
        queryKeys: [[QUERY_KEYS.TRANSACTIONS]],
        successKey: 'toast.transaction_added',
        errorKey: 'toast.transaction_add_error',
        meta: { description: tx.description || '', amount: tx.amount, type: tx.type },
      },
    )
  }

  const addTransfer = async (data: {
    from_account_id: string
    to_account_id: string
    amount: number
    to_amount?: number
    currency: string
    to_currency?: string
    date: string
    description?: string
  }) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    const transferCategory = categories.value.find((c) =>
      TRANSFER_CATEGORY_NAMES.includes(c.name.toLowerCase()),
    )

    return mutate(
      () =>
        createTransferService(user.value!.id, {
          ...data,
          category_id: transferCategory?.id || '',
        }),
      {
        entity: 'transaction',
        action: 'created',
        queryClient,
        queryKeys: [[QUERY_KEYS.TRANSACTIONS], ['account-balances']],
        successKey: 'toast.transfer_added',
        errorKey: 'toast.transaction_add_error',
        meta: { description: data.description || 'Transfer', amount: data.amount, type: 'transfer' },
      },
    )
  }

  const updateTransaction = async (id: string, updates: TransactionUpdate) => {
    return mutate(() => updateTxService(id, updates), {
      entity: 'transaction',
      action: 'updated',
      queryClient,
      queryKeys: [[QUERY_KEYS.TRANSACTIONS]],
      successKey: 'toast.transaction_updated',
      errorKey: 'toast.transaction_update_error',
      meta: { description: updates.description || '', amount: updates.amount },
      entityId: id,
    })
  }

  const deleteTransaction = async (id: string) => {
    return mutate(() => deleteTxService(id), {
      entity: 'transaction',
      action: 'deleted',
      queryClient,
      queryKeys: [[QUERY_KEYS.TRANSACTIONS]],
      successKey: 'toast.transaction_deleted',
      errorKey: 'toast.transaction_delete_error',
      entityId: id,
    })
  }

  const bulkUpdateTransactions = async (ids: string[], updates: TransactionUpdate) => {
    if (ids.length === 0) return { error: null }

    return mutate(() => bulkUpdateTxService(ids, updates), {
      entity: 'transaction',
      action: 'updated',
      queryClient,
      queryKeys: [[QUERY_KEYS.TRANSACTIONS]],
      successKey: 'toast.bulk_transactions_updated',
      errorKey: 'toast.bulk_transactions_update_error',
      meta: { count: ids.length, ...updates },
    })
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    if (ids.length === 0) return { error: null }

    return mutate(() => bulkDeleteTxService(ids), {
      entity: 'transaction',
      action: 'deleted',
      queryClient,
      queryKeys: [[QUERY_KEYS.TRANSACTIONS]],
      successKey: 'toast.bulk_transactions_deleted',
      errorKey: 'toast.bulk_transactions_delete_error',
      meta: { count: ids.length },
    })
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
    const result = await deleteImageService(url, user.value?.id)
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
    categoryFilter,
    ownerFilter,
    dateRange,
    serverFilters,
    goToPage,
    changePage,
    searchTransactions,
    addTransaction,
    addTransfer,
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
