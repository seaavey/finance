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
  const { getConvertedBalances } = useAccounts();

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

      if (accError) throw accError;
      if (!accounts?.length) {
        history.value = [];
        return;
      }

      // 2. Fetch all transactions (no limit for historical accuracy)
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('account_id, type, amount, date')
        .eq('user_id', user.value.id)
        .order('date', { ascending: true });

      if (txError) throw txError;

      // 3. Fetch exchange rates
      const { data: ratesData } = await supabase
        .from('exchange_rates')
        .select('target_currency, rate');

      const rates: Record<string, number> = {};
      for (const row of ratesData || []) {
        rates[row.target_currency] = Number(row.rate);
      }

      const convertAmount = (amount: number, fromCurrency: string): number => {
        if (fromCurrency === 'IDR' || !rates[fromCurrency]) {
          return amount;
        }
        return amount / rates[fromCurrency];
      };

      const result: NetWorthData[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // Last day of month
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString(locale.value, { month: 'short' });

        let totalAssets = 0;
        let totalDebts = 0;

        for (const acc of accounts) {
          const accCreatedAt = new Date(acc.created_at);
          let balance = accCreatedAt <= d ? Number(acc.initial_balance) : 0;

          const accTxs = (transactions || []).filter(
            (tx: { account_id: string; date: string }) =>
              tx.account_id === acc.id && new Date(tx.date) <= d,
          );

          for (const tx of accTxs as { type: string; amount: number }[]) {
            if (tx.type === 'income') {
              balance += Number(tx.amount);
            } else {
              balance -= Number(tx.amount);
            }
          }

          // Convert to base currency (IDR)
          const convertedBalance = convertAmount(balance, acc.currency || 'IDR');

          if (acc.type === 'liability') {
            totalDebts += convertedBalance;
          } else {
            totalAssets += convertedBalance;
          }
        }

        result.push({
          label,
          assets: totalAssets,
          debts: totalDebts,
          netWorth: totalAssets - totalDebts,
          date: dateStr || '',
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
