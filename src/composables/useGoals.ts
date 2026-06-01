import { computed } from 'vue';
import { useSupabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string | null;
  color: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const activity = useActivityLog();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: goalsData, isLoading: loading, refetch: fetchGoals } = useQuery({
    queryKey: ['goals', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data as Goal[];
    },
    enabled: computed(() => !!user.value),
  });

  const goals = computed(() => goalsData.value || []);

  const addGoal = async (
    goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_amount'>,
  ) => {
    if (!user.value) {
      return { error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.value.id, current_amount: 0 })
      .select();

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('toast.goal_added'));
      activity.log('goal', 'created', { name: goal.name, target_amount: goal.target_amount }, data?.[0]?.id);
    } else {
      toast.error(t('toast.goal_add_error'));
    }
    return { error };
  };

  const updateGoal = async (
    id: string,
    updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  ) => {
    const goalName = goals.value.find((g) => g.id === id)?.name || '';
    const { error } = await supabase.from('goals').update(updates).eq('id', id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('toast.goal_updated'));
      activity.log('goal', 'updated', { name: goalName, ...updates }, id);
    } else {
      toast.error(t('toast.goal_update_error'));
    }
    return { error };
  };

  const addFunds = async (goalId: string, amount: number) => {
    const goal = goals.value.find((g) => g.id === goalId);
    if (!goal) {
      return { error: { message: 'Goal not found' } };
    }

    const newAmount = Number(goal.current_amount) + Number(amount);
    const { error } = await supabase
      .from('goals')
      .update({ current_amount: newAmount })
      .eq('id', goalId);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('toast.funds_added'));
      activity.log('goal', 'updated', { name: goal.name, amount_added: amount }, goalId);
    } else {
      toast.error(t('toast.funds_add_error'));
    }
    return { error };
  };

  const uploadGoalImage = async (file: File): Promise<string | null> => {
    if (!user.value) {
      return null;
    }

    const ext = file.name.split('.').pop() || 'png';
    const filePath = `${user.value.id}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('goal-images')
      .upload(filePath, file, { upsert: false });

    if (error) {
      toast.error(t('goals.upload_error'));
      return null;
    }

    const { data } = supabase.storage.from('goal-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const deleteGoalImage = async (url: string) => {
    const prefix = '/object/public/goal-images/';
    const idx = url.indexOf(prefix);
    if (idx === -1) {
      return;
    }
    const path = url.slice(idx + prefix.length);

    await supabase.storage.from('goal-images').remove([path]);
  };

  const deleteGoal = async (id: string) => {
    const goal = goals.value.find((g) => g.id === id);
    if (goal?.image_url) {
      await deleteGoalImage(goal.image_url);
    }

    const { error } = await supabase.from('goals').delete().eq('id', id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('toast.goal_deleted'));
      activity.log('goal', 'deleted', { name: goal?.name || '' }, id);
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
    uploadGoalImage,
    deleteGoalImage,
    deleteGoal,
  };
};
