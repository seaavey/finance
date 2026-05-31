import type { PostgrestResponse } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase';
import { createCache } from '@/lib/cache';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  active: boolean;
  description: string | null;
  created_at: string;
}

export const useRecurring = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = useSupabase();
  const cache = createCache();
  const recurring = ref<RecurringTransaction[]>([]);
  const loading = ref(false);

  const fetchRecurring = async () => {
    loading.value = true;
    const { data, error } = await (cache.fetch(
      'recurring',
      async () => await supabase.from('recurring_transactions').select('*').order('next_date', { ascending: true }),
      60_000,
    ) as Promise<PostgrestResponse<RecurringTransaction>>);

    if (!error && data) {
      recurring.value = data;
    }
    loading.value = false;
  };

  const addRecurring = async (item: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>) => {
    const { user } = useAuth();
    if (!user.value) {
      return;
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .insert({ ...item, user_id: user.value.id });

    if (!error) {
      cache.invalidate('recurring');
      await fetchRecurring();
      toast.success(t('toast.recurring_added'));
    } else {
      toast.error(t('toast.recurring_add_error'));
    }
    return { error };
  };

  const updateRecurring = async (id: string, updates: Partial<RecurringTransaction>) => {
    const { error } = await supabase.from('recurring_transactions').update(updates).eq('id', id);

    if (!error) {
      cache.invalidate('recurring');
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
      cache.invalidate('recurring');
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
