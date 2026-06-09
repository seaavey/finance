import { useQuery } from '@tanstack/vue-query'
import { getTransactionSummary as getTxSummaryService } from '@/services/transaction.service'
import type { BudgetWithProgress } from "@/types"
import { formatDateSafe } from '@/lib/utils'

export function useDashboard() {
  const router = useRouter()
  const { user, getSession } = useAuth()
  const { transactions, fetchTransactions } = useTransactions()
  const { categories, fetchCategories } = useCategories()
  const { formatCurrency, defaultCurrency, convertTo } = useCurrency()
  const { t, locale } = useI18n()
  const { fetchPartner, partner, isPartnered, myProfile } = usePartner()

  const viewMode = ref<'mine' | 'partner'>('mine')
  const period = ref<'1d' | '7d' | '30d' | 'all'>('7d')
  const loading = ref(true)
  const budgetSummaries = ref<BudgetWithProgress[]>([])

  const periodOptions = [
    { value: '1d' as const, label: '1D' },
    { value: '7d' as const, label: '7D' },
    { value: '30d' as const, label: '30D' },
    { value: 'all' as const, label: 'ALL' },
  ]

  const viewModes = computed(() => [
    { value: 'mine' as const, label: displayName.value },
    {
      value: 'partner' as const,
      label: partner.value?.display_name?.split(' ')[0] || t('sidebar.partner'),
    },
  ])

  const displayName = computed(() => {
    const name = myProfile.value?.display_name || user.value?.user_metadata?.full_name || user.value?.user_metadata?.name || ''
    if (!name) {
      return t('dashboard.user')
    }
    return name.split(' ')[0]
  })

  const activeCurrency = computed(() => {
    if (viewMode.value === 'partner' && isPartnered.value && partner.value?.currency) {
      return partner.value.currency
    }
    return defaultCurrency.value
  })

  const startDate = computed(() => {
    const now = new Date()
    if (period.value === 'all') return '1970-01-01'
    const daysMap = { '1d': 0, '7d': 6, '30d': 29 }
    const d = new Date(now.getTime() - (daysMap[period.value as keyof typeof daysMap] || 0) * 24 * 60 * 60 * 1000)
    return formatDateSafe(d)
  })

  const endDate = computed(() => formatDateSafe(new Date()))

  const targetUserId = computed(() => {
    if (isPartnered.value && viewMode.value === 'partner') {
      return partner.value?.id
    }
    return user.value?.id
  })

  const { data: summary, isLoading: summaryLoading } = useTransactionSummary(
    targetUserId,
    startDate,
    endDate,
    activeCurrency,
  )

  const prevSummaryParams = computed(() => {
    if (period.value === 'all') return null
    const now = new Date()
    const daysMap = { '1d': 1, '7d': 7, '30d': 30 }
    const days = daysMap[period.value as keyof typeof daysMap] || 0

    const end = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)

    return {
      start: formatDateSafe(start),
      end: formatDateSafe(end)
    }
  })

  const { data: prevSummary } = useQuery({
    queryKey: ['transaction-summary-prev', targetUserId, prevSummaryParams, activeCurrency],
    queryFn: async () => {
      if (!targetUserId.value || !prevSummaryParams.value) return null
      const result = await getTxSummaryService(
        targetUserId.value,
        prevSummaryParams.value.start,
        prevSummaryParams.value.end,
        activeCurrency.value
      )
      if (result.error) throw result.error
      return result.data
    },
    enabled: computed(() => !!targetUserId.value && !!prevSummaryParams.value),
    staleTime: 60_000,
  })

  const totalIncome = computed(() => summary.value?.total_income || 0)
  const totalExpense = computed(() => summary.value?.total_expense || 0)
  const balance = computed(() => summary.value?.balance || 0)

  const trendBalance = computed(() => {
    if (!prevSummary.value || prevSummary.value.balance === 0) {
      return balance.value !== 0 ? null : 0
    }
    return Math.round(((balance.value - prevSummary.value.balance) / prevSummary.value.balance) * 100)
  })

  const trendDisplay = computed(() => {
    if (trendBalance.value === null) return 'New'
    return `${Math.abs(trendBalance.value)}%`
  })

  const { fetchBudgetWithProgress, checkBudgetAlerts, budgetsWithProgress } = useBudgets()
  const { fetchAccounts, accountBalances, fetchAccountBalances } = useAccounts()
  const { currentNetWorth, fetchNetWorthHistory } = useNetWorth()
  const { fetchRecurring, processDueRecurring } = useRecurring()
  useReminders()

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount
    const converted = convertTo(amount, fromCurrency, toCurrency)
    if (converted !== null) return converted
    return 0
  }

  const monthLabel = computed(() => {
    if (period.value === '1d') return t('dashboard.today')
    if (period.value === '7d') return t('dashboard.last_7_days')
    if (period.value === '30d') return t('dashboard.last_30_days')
    return t('dashboard.all_time')
  })

  const formatRelativeDate = (date: string) => {
    const now = new Date()
    const d = new Date(date)
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return t('dashboard.today')
    if (diffDays === 1) return t('dashboard.yesterday')
    if (diffDays < 7) return t('dashboard.days_ago', { days: diffDays })
    return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
  }

  const categoryMap = computed(() => {
    const map = new Map<string, { name: string; color: string }>()
    for (const cat of categories.value) {
      map.set(cat.id, { name: cat.name, color: cat.color || '#6b7280' })
    }
    return map
  })

  const getCategoryName = (id: string | null) => {
    if (!id) return ''
    return categoryMap.value.get(id)?.name || ''
  }

  const currentMonthStr = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })

  const filteredTransactions = computed(() => {
    let list = transactions.value
    if (isPartnered.value) {
      const targetId = viewMode.value === 'mine' ? user.value?.id : partner.value?.id
      if (targetId) list = list.filter((tx) => tx.user_id === targetId)
    }
    return list
  })

  const recentTransactions = computed(() =>
    [...filteredTransactions.value]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
  )

  const monthlyData = computed(() => {
    // If viewing 1D or 7D, show daily granularity. If 30D or ALL, show monthly.
    if (period.value === '1d' || period.value === '7d') {
      const days = period.value === '1d' ? 1 : 7
      const data: { label: string; income: number; expense: number }[] = []

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString(locale.value, { weekday: 'short', day: 'numeric' })
        const dateStr = formatDateSafe(d)

        const dayTx = filteredTransactions.value.filter((tx) => tx.date === dateStr)
        const activeCur = activeCurrency.value
        data.push({
          label,
          income: dayTx
            .filter((t) => t.type === 'income')
            .reduce(
              (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
              0,
            ),
          expense: dayTx
            .filter((t) => t.type === 'expense')
            .reduce(
              (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
              0,
            ),
        })
      }
      return data
    }

    // Monthly logic for 30D and ALL
    const months: { label: string; income: number; expense: number }[] = []
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const label = d.toLocaleDateString(locale.value, { month: 'short' })
      const m = d.getMonth()
      const y = d.getFullYear()

      const monthTx = transactions.value.filter((tx) => {
        const td = new Date(tx.date)
        return td.getMonth() === m && td.getFullYear() === y
      })

      const activeCur = activeCurrency.value
      months.push({
        label,
        income: monthTx
          .filter((t) => t.type === 'income')
          .reduce(
            (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
            0,
          ),
        expense: monthTx
          .filter((t) => t.type === 'expense')
          .reduce(
            (s, t) => s + convertAmount(t.amount, t.currency || defaultCurrency.value, activeCur),
            0,
          ),
      })
    }
    return months
  })

  const init = async () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const sixMonthsAgo = formatDateSafe(new Date(currentYear, currentMonth - 5, 1))

    // Ensure session is loaded before fetching (defense-in-depth for OAuth redirect)
    await getSession()

    await Promise.all([
      fetchTransactions({ dateFrom: sixMonthsAgo }),
      fetchCategories(),
      fetchPartner(),
      fetchNetWorthHistory(),
      fetchRecurring(),
      loadCurrency(),
    ])

    // Auto-process due recurring transactions
    await processDueRecurring()

    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    await Promise.all([
      fetchBudgetWithProgress(monthStr),
      fetchAccounts(),
      fetchAccountBalances(),
    ])
    budgetSummaries.value = budgetsWithProgress.value

    // Check budget thresholds for alerts after fresh budget data is loaded
    await checkBudgetAlerts(monthStr)

    loading.value = false
  }

  return {
    // State
    viewMode,
    period,
    loading,
    budgetSummaries,
    periodOptions,
    viewModes,
    displayName,
    activeCurrency,
    startDate,
    endDate,
    targetUserId,
    summary,
    summaryLoading,
    prevSummaryParams,
    prevSummary,
    totalIncome,
    totalExpense,
    balance,
    trendBalance,
    trendDisplay,
    currentNetWorth,
    accountBalances,
    convertAmount,
    monthLabel,
    formatRelativeDate,
    categoryMap,
    getCategoryName,
    currentMonthStr,
    filteredTransactions,
    recentTransactions,
    monthlyData,
    // Expose for template use
    router,
    // Init function
    init,
  }
}
