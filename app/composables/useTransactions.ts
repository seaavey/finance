import { useSupabase } from '~/lib/supabase';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category_id: string | null;
  description: string | null;
  date: string;
  created_at: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category_id?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useTransactions = () => {
  const { toast } = useToast();
  const supabase = useSupabase();
  const transactions = useState<Transaction[]>('transactions', () => []);
  const loading = useState('transactions-loading', () => false);

  const fetchTransactions = async (filters?: TransactionFilters) => {
    loading.value = true;
    let query = supabase.from('transactions').select('*').order('date', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters?.dateFrom) {
      query = query.gte('date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('date', filters.dateTo);
    }
    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      transactions.value = data as Transaction[];
    }
    loading.value = false;
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const { user } = useAuth();
    if (!user.value) {
      return { error: { message: 'Not authenticated' } };
    }

    const { error } = await supabase.from('transactions').insert({ ...tx, user_id: user.value.id });

    if (!error) {
      await fetchTransactions();
      toast.success('Transaksi berhasil ditambahkan');
    } else {
      toast.error('Gagal menambahkan transaksi');
    }
    return { error };
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    const { error } = await supabase.from('transactions').update(updates).eq('id', id);

    if (!error) {
      await fetchTransactions();
      toast.success('Transaksi berhasil diperbarui');
    } else {
      toast.error('Gagal memperbarui transaksi');
    }
    return { error };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (!error) {
      await fetchTransactions();
      toast.success('Transaksi berhasil dihapus');
    } else {
      toast.error('Gagal menghapus transaksi');
    }
    return { error };
  };

  const getTransaction = async (id: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

    return { data: data as Transaction | null, error };
  };

  const monthlySummary = computed(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthTxs = transactions.value.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const income = monthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const expense = monthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return { income, expense, balance: income - expense };
  });

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    monthlySummary,
  };
};
