import { useSupabase } from '@/lib/supabase';

export interface NetWorthData {
  label: string;
  assets: number;
  debts: number;
  netWorth: number;
  date: string;
}

export const useNetWorth = () => {
  const supabase = useSupabase();
  const { user } = useAuth();
  const { locale } = useI18n();

  const history = ref<NetWorthData[]>([]);
  const loading = ref(false);

  const fetchNetWorthHistory = async (months: number = 6) => {
    if (!user.value) {
      return;
    }
    loading.value = true;

    try {
      // 1. Fetch all accounts
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.value.id);

      if (accError) {
        throw accError;
      }

      // 2. Fetch all transactions (no limit to ensure historical accuracy)
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('account_id, type, amount, date')
        .eq('user_id', user.value.id)
        .order('date', { ascending: true });

      if (txError) {
        throw txError;
      }

      const result: NetWorthData[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // Last day of month
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString(locale.value, { month: 'short' });

        let totalAssets = 0;
        let totalDebts = 0;

        for (const acc of accounts) {
          // Initial balance only if account created before or during this month
          const accCreatedAt = new Date(acc.created_at);
          let balance = accCreatedAt <= d ? Number(acc.initial_balance) : 0;

          // Add transactions for this account up to the end of this month
          const accTxs = transactions.filter(
            (tx) => tx.account_id === acc.id && new Date(tx.date) <= d,
          );

          for (const tx of accTxs) {
            if (tx.type === 'income') {
              balance += Number(tx.amount);
            } else {
              balance -= Number(tx.amount);
            }
          }

          if (acc.type === 'liability') {
            totalDebts += balance;
          } else {
            totalAssets += balance;
          }
        }

        result.push({
          label,
          assets: totalAssets,
          debts: totalDebts,
          netWorth: totalAssets - totalDebts,
          date: dateStr || "",
        });
      }

      history.value = result;
    } catch (error) {
      console.error('Failed to fetch net worth history:', error);
    } finally {
      loading.value = false;
    }
  };

  const currentNetWorth = computed(() => {
    if (history.value.length === 0) {
      return null;
    }
    return history.value[history.value.length - 1];
  });

  return {
    history,
    loading,
    fetchNetWorthHistory,
    currentNetWorth,
  };
};
