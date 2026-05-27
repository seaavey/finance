import { useSupabase } from '~/lib/supabase';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const supabase = useSupabase();
  const goals = useState<Goal[]>('goals', () => []);
  const loading = useState('goals-loading', () => false);

  const fetchGoals = async () => {
    loading.value = true;
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      goals.value = data as Goal[];
    }
    loading.value = false;
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_amount'>) => {
    const { user } = useAuth();
    if (!user.value) return { error: { message: 'Not authenticated' } };

    const { error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.value.id, current_amount: 0 });

    if (!error) {
      await fetchGoals();
      toast.success(t('toast.goal_added'));
    } else {
      toast.error(t('toast.goal_add_error'));
    }
    return { error };
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await fetchGoals();
      toast.success(t('toast.goal_updated'));
    } else {
      toast.error(t('toast.goal_update_error'));
    }
    return { error };
  };

  const addFunds = async (goalId: string, amount: number) => {
    const goal = goals.value.find(g => g.id === goalId);
    if (!goal) return { error: { message: 'Goal not found' } };

    const newAmount = Number(goal.current_amount) + Number(amount);
    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);

    if (!error) {
      await fetchGoals();
      toast.success(t('toast.funds_added'));
    } else {
      toast.error(t('toast.funds_add_error'));
    }
    return { error };
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchGoals();
      toast.success(t('toast.goal_deleted'));
    } else {
      toast.error(t('toast.goal_delete_error'));
    }
    return { error };
  };

  return {
    goals,
    loading,
    fetchGoals,
    addGoal,
    updateGoal,
    addFunds,
    deleteGoal
  };
};
