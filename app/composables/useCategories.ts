import { useSupabase } from '~/lib/supabase';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  created_at: string;
}

const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Gaji', icon: 'wallet', color: '#22c55e' },
    { name: 'Freelance', icon: 'laptop', color: '#3b82f6' },
    { name: 'Investasi', icon: 'chart', color: '#8b5cf6' },
    { name: 'Lainnya', icon: 'more', color: '#6b7280' },
  ],
  expense: [
    { name: 'Makanan', icon: 'food', color: '#f97316' },
    { name: 'Transport', icon: 'car', color: '#06b6d4' },
    { name: 'Belanja', icon: 'bag', color: '#ec4899' },
    { name: 'Tagihan', icon: 'receipt', color: '#ef4444' },
    { name: 'Hiburan', icon: 'game', color: '#a855f7' },
    { name: 'Kesehatan', icon: 'health', color: '#14b8a6' },
    { name: 'Lainnya', icon: 'more', color: '#6b7280' },
  ],
};

export const useCategories = () => {
  const { toast } = useToast();
  const supabase = useSupabase();
  const categories = useState<Category[]>('categories', () => []);
  const loading = useState('categories-loading', () => false);

  const fetchCategories = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      categories.value = data as Category[];
    }
    loading.value = false;
  };

  const seedDefaults = async (userId: string) => {
    const entries = [
      ...DEFAULT_CATEGORIES.income.map((c) => ({ ...c, type: 'income' as const, user_id: userId })),
      ...DEFAULT_CATEGORIES.expense.map((c) => ({
        ...c,
        type: 'expense' as const,
        user_id: userId,
      })),
    ];
    const { error } = await supabase.from('categories').insert(entries);
    if (!error) await fetchCategories();
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    const { user } = useAuth();
    if (!user.value) return;

    const { error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.value.id });

    if (!error) {
      await fetchCategories();
      toast.success('Kategori berhasil ditambahkan');
    } else {
      toast.error('Gagal menambahkan kategori');
    }
    return { error };
  };

  const updateCategory = async (
    id: string,
    updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>,
  ) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);

    if (!error) {
      await fetchCategories();
      toast.success('Kategori berhasil diperbarui');
    } else {
      toast.error('Gagal memperbarui kategori');
    }
    return { error };
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (!error) {
      await fetchCategories();
      toast.success('Kategori berhasil dihapus');
    } else {
      toast.error('Gagal menghapus kategori');
    }
    return { error };
  };

  const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'));
  const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'));

  return {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    seedDefaults,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
