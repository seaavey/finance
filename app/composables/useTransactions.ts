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
  receipt_image: string | null;
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
  const { t } = useI18n();
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
      toast.success(t('toast.transaction_added'));
    } else {
      toast.error(t('toast.transaction_add_error'));
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
      toast.success(t('toast.transaction_updated'));
    } else {
      toast.error(t('toast.transaction_update_error'));
    }
    return { error };
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (!error) {
      await fetchTransactions();
      toast.success(t('toast.transaction_deleted'));
    } else {
      toast.error(t('toast.transaction_delete_error'));
    }
    return { error };
  };

  const getTransaction = async (id: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

    return { data: data as Transaction | null, error };
  };

  const searchTransactions = async (term: string): Promise<Transaction[]> => {
    if (!term.trim()) {
      return [];
    }
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .ilike('description', `%${term}%`)
      .order('date', { ascending: false })
      .limit(10);
    return error || !data ? [] : (data as Transaction[]);
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    const { user } = useAuth();
    if (!user.value) {
      return null;
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.value.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('receipts').upload(path, file);
    if (error) {
      toast.error('Failed to upload receipt');
      return null;
    }

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path);
    return urlData?.publicUrl || null;
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
    searchTransactions,
    uploadReceipt,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    monthlySummary,
  };
};
