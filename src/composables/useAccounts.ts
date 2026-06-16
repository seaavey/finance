import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from './i18n-compat'
import {
  queryAccounts,
  createAccount as createAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  queryAccountBalances as queryAccountBalancesService,
} from '@/services/account.service'
import type { Account, AccountWithBalance, AccountInsert, AccountUpdate } from '@/types'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

export const useAccounts = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { defaultCurrency, convertTo } = useCurrency()
  const { mutate } = useMutationFeedback()

  const {
    data: accountsData,
    isLoading: loading,
    refetch: fetchAccounts,
  } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS, computed(() => user.value?.id)],
    queryFn: async (): Promise<Account[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryAccounts(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.RARELY,
  })

  const {
    data: balancesData,
    isLoading: balancesLoading,
    refetch: fetchAccountBalances,
  } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_BALANCES, computed(() => user.value?.id)],
    queryFn: async (): Promise<AccountWithBalance[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryAccountBalancesService(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DAILY,
  })

  const accounts = computed(() => accountsData.value || [])
  const accountBalances = computed(() => balancesData.value || [])

  const addAccount = async (
    account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    if (!user.value) {
      return { error: new Error('Not authenticated') }
    }

    return mutate(
      () =>
        createAccountService({
          ...account,
          user_id: user.value!.id,
        } as AccountInsert),
      {
        entity: 'account',
        action: 'created',
        queryClient,
        queryKeys: [['accounts'], ['account-balances']],
        successKey: 'accounts.saved',
        errorKey: 'accounts.save_error',
        meta: { name: account.name, type: account.type },
      },
    )
  }

  const updateAccount = async (id: string, updates: AccountUpdate) => {
    return mutate(() => updateAccountService(id, updates), {
      entity: 'account',
      action: 'updated',
      queryClient,
      queryKeys: [['accounts'], ['account-balances']],
      successKey: 'accounts.saved',
      errorKey: 'accounts.save_error',
      meta: { name: updates.name ?? '' },
      entityId: id,
    })
  }

  const deleteAccount = async (id: string) => {
    const accountName = accounts.value.find((a) => a.id === id)?.name || ''

    return mutate(() => deleteAccountService(id), {
      entity: 'account',
      action: 'deleted',
      queryClient,
      queryKeys: [['accounts'], ['account-balances'], ['transactions']],
      successKey: 'accounts.deleted',
      errorKey: 'accounts.delete_error',
      meta: { name: accountName },
      entityId: id,
    })
  }

  const getAccountBalance = async (accountId: string): Promise<number> => {
    const balances = balancesData.value || (await getAccountBalances())
    const account = balances.find((a) => a.id === accountId)
    return account?.balance ?? 0
  }

  const getAccountBalances = async (): Promise<AccountWithBalance[]> => {
    if (!user.value) return []
    const result = await queryAccountBalancesService(user.value.id)
    if (result.error) throw result.error
    return result.data || []
  }

  const getConvertedBalances = async (): Promise<AccountWithBalance[]> => {
    const balances = balancesData.value || (await getAccountBalances())
    if (balances.length === 0) return []

    return balances.map((a) => {
      let convertedBalance = a.balance
      if (a.currency !== defaultCurrency.value) {
        const converted = convertTo(
          a.balance,
          a.currency || defaultCurrency.value,
          defaultCurrency.value,
        )
        if (converted !== null) {
          convertedBalance = converted
        }
      }

      return { ...a, balance: convertedBalance }
    })
  }

  const bankAccounts = computed(() => accounts.value.filter((a) => a.type === 'bank'))
  const ewalletAccounts = computed(() => accounts.value.filter((a) => a.type === 'e-wallet'))
  const cashAccounts = computed(() => accounts.value.filter((a) => a.type === 'cash'))
  const investmentAccounts = computed(() => accounts.value.filter((a) => a.type === 'investment'))
  const liabilityAccounts = computed(() => accounts.value.filter((a) => a.type === 'liability'))

  return {
    accounts,
    accountBalances,
    loading: computed(() => loading.value || balancesLoading.value),
    balancesLoading,
    fetchAccounts,
    fetchAccountBalances,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
    getAccountBalances,
    getConvertedBalances,
    bankAccounts,
    ewalletAccounts,
    cashAccounts,
    investmentAccounts,
    liabilityAccounts,
  }
}
