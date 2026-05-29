import { useSupabase } from '~/lib/supabase';
import { createCache } from '~/lib/cache';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'bank' | 'e-wallet' | 'cash';
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
  const cache = createCache();
  const { t } = useI18n();
  const { toast } = useToast();
  const { user } = useAuth();

  const accounts = useState<Account[]>('accounts', () => []);
  const loading = useState('accounts-loading', () => false);

  const fetchAccounts = async () => {
    if (!user.value) {
      return;
    }
    loading.value = true;
    try {
      const result = await cache.fetch(
        'accounts',
        async () => {
          const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.value!.id)
            .order('created_at');
          if (error) {
            throw error;
          }
          return data as Account[];
        },
        30_000,
      );
      accounts.value = result || [];
    } finally {
      loading.value = false;
    }
  };

  const addAccount = async (data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user.value) {
      return { error: new Error('Not authenticated') };
    }
    const { error } = await supabase.from('accounts').insert({ ...data, user_id: user.value.id });
    if (!error) {
      cache.invalidate('accounts');
      await fetchAccounts();
      toast.success(t('accounts.saved'));
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const updateAccount = async (id: string, updates: Partial<Pick<Account, 'name' | 'type' | 'currency' | 'color' | 'icon' | 'initial_balance'>>) => {
    const { error } = await supabase.from('accounts').update(updates).eq('id', id);
    if (!error) {
      cache.invalidate('accounts');
      await fetchAccounts();
      toast.success(t('accounts.saved'));
    } else {
      toast.error(t('accounts.save_error'));
    }
    return { error };
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (!error) {
      cache.invalidate('accounts');
      cache.invalidate('transactions');
      await fetchAccounts();
      toast.success(t('accounts.deleted'));
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
      .in('account_id', accts.map((a) => a.id))
      .not('account_id', 'is', null);

    const netMap = new Map<string, number>();
    for (const tx of (data || []) as { account_id: string; type: string; amount: number }[]) {
      const current = netMap.get(tx.account_id) || 0;
      netMap.set(tx.account_id, tx.type === 'income' ? current + Number(tx.amount) : current - Number(tx.amount));
    }

    return accts.map((a) => ({
      ...a,
      balance: Number(a.initial_balance) + (netMap.get(a.id) || 0),
    }));
  };

  const bankAccounts = computed(() => accounts.value.filter((a) => a.type === 'bank'));
  const ewalletAccounts = computed(() => accounts.value.filter((a) => a.type === 'e-wallet'));
  const cashAccounts = computed(() => accounts.value.filter((a) => a.type === 'cash'));

  return {
    accounts,
    loading,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountBalance,
    getAccountBalances,
    bankAccounts,
    ewalletAccounts,
    cashAccounts,
  };
};
