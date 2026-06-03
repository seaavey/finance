import { computed, ref } from 'vue';
import { useSupabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetWithProgress extends Budget {
  category_name: string;
  category_color: string;
  category_icon: string;
  spent: number;
}

export const useBudgets = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { toast } = useToast();
  const activity = useActivityLog();
  const { user } = useAuth();

  const currentMonth = ref<string>('');

  const { data: budgetsData, isLoading: loading, refetch: refetchBudgets } = useQuery({
    queryKey: ['budgets', computed(() => user.value?.id), currentMonth],
    queryFn: async () => {
      if (!user.value || !currentMonth.value) return [];
      const { data, error } = await supabase
        .from('budgets')
        .select('id, user_id, category_id, month, amount, created_at')
        .eq('user_id', user.value.id)
        .eq('month', currentMonth.value)
        .order('created_at');
      if (error) {
        throw error;
      }
      return data as Budget[];
    },
    enabled: computed(() => !!user.value && !!currentMonth.value),
    staleTime: 60_000, // 1 min — budget amounts are monthly-static
  });

  const budgets = computed(() => budgetsData.value || []);

  const fetchBudgets = async (month: string) => {
    currentMonth.value = month;
    await refetchBudgets();
  };

  const fetchBudgetWithProgress = async (month: string): Promise<BudgetWithProgress[]> => {
    if (!user.value) return [];
    
    // Explicit direct fetch for fetchBudgetWithProgress as it's often used inline
    return queryClient.fetchQuery({
      queryKey: ['budgets:with-progress', user.value.id, month],
      queryFn: async () => {
        const { data: budgetData } = await supabase
          .from('budgets')
          .select('id, user_id, category_id, month, amount, created_at')
          .eq('user_id', user.value!.id)
          .eq('month', month);

        const budgetsList = (budgetData as Budget[]) || [];

        if (budgetsList.length === 0) {
          return [];
        }

        const categoryIds = budgetsList.map((b) => b.category_id);

        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, color, icon')
          .in('id', categoryIds);

        const categoryMap = new Map(
          (categoriesData || []).map(
            (c: { id: string; name: string; color: string; icon: string }) => [c.id, c],
          ),
        );

        const [year, mon] = month.split('-').map(Number);
        const nextMonth = new Date(year as number, mon as number, 1).toISOString().slice(0, 10);

        const { data: txData } = await supabase
          .from('transactions')
          .select('category_id, amount')
          .eq('user_id', user.value!.id)
          .eq('type', 'expense')
          .gte('date', month)
          .lt('date', nextMonth)
          .in('category_id', categoryIds);

        const spentMap = new Map<string, number>();
        for (const tx of (txData || []) as { category_id: string; amount: number }[]) {
          spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + Number(tx.amount));
        }

        return budgetsList.map((b) => {
          const cat = categoryMap.get(b.category_id);
          return {
            ...b,
            category_name: cat?.name || '-',
            category_color: cat?.color || '#6b7280',
            category_icon: cat?.icon || '',
            spent: spentMap.get(b.category_id) || 0,
          };
        });
      },
      staleTime: 30_000,
    });
  };

  const setBudget = async (categoryId: string, month: string, amount: number) => {
    if (!user.value) {
      toast.error(t('toast.login_required'));
      return { error: new Error('Not authenticated') };
    }

    const { data: existing } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('category_id', categoryId)
      .eq('month', month)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase.from('budgets').update({ amount }).eq('id', existing.id);
      error = result.error;
      if (!error) activity.log('budget', 'updated', { category_name: categoryId, amount });
    } else {
      const result = await supabase.from('budgets').insert({
        user_id: user.value.id,
        category_id: categoryId,
        month,
        amount,
      });
      error = result.error;
      if (!error) activity.log('budget', 'created', { category_name: categoryId, amount });
    }

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] });
      await fetchBudgets(month);
      toast.success(t('budget.saved'));
    } else {
      toast.error(t('budget.save_error'));
    }

    return { error };
  };

  const deleteBudget = async (id: string, month: string) => {
    const budget = budgets.value.find((b) => b.id === id);
    const categoryId = budget?.category_id || '';
    const { error } = await supabase.from('budgets').delete().eq('id', id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets:with-progress'] });
      await fetchBudgets(month);
      toast.success(t('budget.deleted'));
      activity.log('budget', 'deleted', { category_name: categoryId }, id);
    } else {
      toast.error(t('budget.delete_error'));
    }

    return { error };
  };

  const getProgress = (budget: BudgetWithProgress) => {
    const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const diff = budget.amount - budget.spent;
    return {
      percentage: Math.min(pct, 100),
      remaining: Math.max(diff, 0),
      overspent: Math.max(-diff, 0),
    };
  };

  return {
    budgets,
    loading,
    fetchBudgets,
    fetchBudgetWithProgress,
    setBudget,
    deleteBudget,
    getProgress,
  };
};
