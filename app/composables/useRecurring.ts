import { useSupabase } from '~/lib/supabase';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category_id: string | null;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  active: boolean;
  created_at: string;
}

export const useRecurring = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = useSupabase();
  const recurring = useState<RecurringTransaction[]>('recurring', () => []);
  const loading = useState('recurring-loading', () => false);

  const fetchRecurring = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .order('next_date', { ascending: true });

    if (!error && data) {
      recurring.value = data as RecurringTransaction[];
    }
    loading.value = false;
  };

  const addRecurring = async (
    item: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>,
  ) => {
    const { user } = useAuth();
    if (!user.value) {
      return { error: { message: 'Not authenticated' } };
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .insert({ ...item, user_id: user.value.id });

    if (!error) {
      await fetchRecurring();
      toast.success(t('toast.recurring_added'));
    } else {
      toast.error(t('toast.recurring_add_error'));
    }
    return { error };
  };

  const updateRecurring = async (
    id: string,
    updates: Partial<Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>>,
  ) => {
    const { error } = await supabase.from('recurring_transactions').update(updates).eq('id', id);

    if (!error) {
      await fetchRecurring();
      toast.success(t('toast.recurring_updated'));
    } else {
      toast.error(t('toast.recurring_update_error'));
    }
    return { error };
  };

  const deleteRecurring = async (id: string) => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);

    if (!error) {
      await fetchRecurring();
      toast.success(t('toast.recurring_deleted'));
    } else {
      toast.error(t('toast.recurring_delete_error'));
    }
    return { error };
  };

  const toggleActive = async (id: string, active: boolean) => {
    return updateRecurring(id, { active });
  };

  return {
    recurring,
    loading,
    fetchRecurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
  };
};
