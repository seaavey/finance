import { computed } from 'vue';
import { useSupabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability';
  currency: string;
  color: string;
  icon: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends Account {
  balance: number;
}

export const useAccounts = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { toast } = useToast();
  const activity = useActivityLog();
  const { user } = useAuth();

  const { data: accountsData, isLoading: loading, refetch: fetchAccounts } = useQuery({
    queryKey: ['accounts', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('accounts')
        .select('id, user_id, name, type, currency, color, icon, initial_balance, created_at')
        .eq('user_id', user.value.id)
        .order('created_at');
      if (error) {
        throw error;
      }
      return data as Account[];
    },
    enabled: computed(() => !!user.value),
    staleTime: 120_000, // 2 min — account structure rarely changes
  });

  const accounts = computed(() => accountsData.value || []);

  const addAccount = async (
    data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  ) => {
    if (!user.value) {
      return { error: new Error('Not authenticated') };
    }
    const { error } = await supabase.from('accounts').insert({ ...data, user_id: user.value.id });
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(t('accounts.saved'));
      activity.log('account', 'created', { name: data.name, type: data.type });
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const updateAccount = async (
    id: string,
    updates: Partial<
      Pick<Account, 'name' | 'type' | 'currency' | 'color' | 'icon' | 'initial_balance'>
    >,
  ) => {
    const { error } = await supabase.from('accounts').update(updates).eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(t('accounts.saved'));
      activity.log('account', 'updated', { name: updates.name }, id);
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const deleteAccount = async (id: string) => {
    const accountName = accounts.value.find((a) => a.id === id)?.name || '';
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(t('accounts.deleted'));
      activity.log('account', 'deleted', { name: accountName }, id);
    } else {
      toast.error(t('accounts.delete_error'));
    }
    return { error };
  };

  const getAccountBalance = async (accountId: string): Promise<number> => {
    if (!user.value) {
      return 0;
    }
    const account = accounts.value.find((a) => a.id === accountId);
    if (!account) {
      return 0;
    }

    const { data } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.value.id)
      .eq('account_id', accountId);

    const net = (data || []).reduce((sum, tx: { type: string; amount: number }) => {
      return tx.type === 'income' ? sum + Number(tx.amount) : sum - Number(tx.amount);
    }, 0);

    return Number(account.initial_balance) + net;
  };

  const getAccountBalances = async (): Promise<AccountWithBalance[]> => {
    if (!user.value) {
      return [];
    }
    const accts = accounts.value;
    if (accts.length === 0) {
      return [];
    }

    const { data } = await supabase
      .from('transactions')
      .select('account_id, type, amount')
      .eq('user_id', user.value.id)
      .in(
        'account_id',
        accts.map((a) => a.id),
      )
      .not('account_id', 'is', null);

    const netMap = new Map<string, number>();
    for (const tx of (data || []) as { account_id: string; type: string; amount: number }[]) {
      const current = netMap.get(tx.account_id) || 0;
      netMap.set(
        tx.account_id,
        tx.type === 'income' ? current + Number(tx.amount) : current - Number(tx.amount),
      );
    }

    return accts.map((a) => ({
      ...a,
      balance: Number(a.initial_balance) + (netMap.get(a.id) || 0),
    }));
  };

  const getConvertedBalances = async (): Promise<AccountWithBalance[]> => {
    if (!user.value) {
      return [];
    }
    const accts = accounts.value;
    if (accts.length === 0) {
      return [];
    }

    const { data } = await supabase
      .from('transactions')
      .select('account_id, type, amount')
      .eq('user_id', user.value.id)
      .in(
        'account_id',
        accts.map((a) => a.id),
      )
      .not('account_id', 'is', null);

    const netMap = new Map<string, number>();
    for (const tx of (data || []) as { account_id: string; type: string; amount: number }[]) {
      const current = netMap.get(tx.account_id) || 0;
      netMap.set(
        tx.account_id,
        tx.type === 'income' ? current + Number(tx.amount) : current - Number(tx.amount),
      );
    }

    const { defaultCurrency, convertTo } = useCurrency();

    return accts.map((a) => {
      const net = netMap.get(a.id) || 0;
      const rawBalance = Number(a.initial_balance) + net;

      let convertedBalance = rawBalance;
      if (a.currency !== defaultCurrency.value) {
        const converted = convertTo(rawBalance, a.currency, defaultCurrency.value);
        if (converted !== null) {
          convertedBalance = converted;
        }
      }

      return { ...a, balance: convertedBalance };
    });
  };

  const bankAccounts = computed(() => accounts.value.filter((a) => a.type === 'bank'));
  const ewalletAccounts = computed(() => accounts.value.filter((a) => a.type === 'e-wallet'));
  const cashAccounts = computed(() => accounts.value.filter((a) => a.type === 'cash'));
  const investmentAccounts = computed(() => accounts.value.filter((a) => a.type === 'investment'));
  const liabilityAccounts = computed(() => accounts.value.filter((a) => a.type === 'liability'));

  return {
    accounts,
    loading,
    fetchAccounts,
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
  };
};
