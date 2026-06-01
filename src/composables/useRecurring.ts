import type { PostgrestResponse } from '@supabase/supabase-js';
import { computed } from 'vue';
import { useSupabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

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
  const activity = useActivityLog();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: recurringData, isLoading: loading, refetch: fetchRecurring } = useQuery({
    queryKey: ['recurring', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated');
      const { data, error } = await supabase.from('recurring_transactions').select('*').eq('user_id', user.value.id).order('next_date', { ascending: true });
      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: computed(() => !!user.value),
  });

  const recurring = computed(() => recurringData.value || []);

  const addRecurring = async (item: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user.value) {
      return;
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .insert({ ...item, user_id: user.value.id });

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success(t('toast.recurring_added'));
      activity.log('recurring', 'created', { description: item.description || item.type, amount: item.amount });
    } else {
      toast.error(t('toast.recurring_add_error'));
    }
    return { error };
  };

  const updateRecurring = async (id: string, updates: Partial<RecurringTransaction>) => {
    const { error } = await supabase.from('recurring_transactions').update(updates).eq('id', id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success(t('toast.recurring_updated'));
      activity.log('recurring', 'updated', { description: updates.description || updates.type }, id);
    } else {
      toast.error(t('toast.recurring_update_error'));
    }
    return { error };
  };

  const deleteRecurring = async (id: string) => {
    const recurringItem = recurring.value.find((r) => r.id === id);
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      toast.success(t('toast.recurring_deleted'));
      activity.log('recurring', 'deleted', { description: recurringItem?.description || recurringItem?.type || '' }, id);
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
