import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  queryGoals,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  deleteGoal as deleteGoalService,
  addGoalFunds as addFundsService,
  uploadGoalImage as uploadImageService,
  deleteGoalImage as deleteImageService,
} from '@/services/goal.service'
import type { Goal, GoalInsert, GoalUpdate } from '@/types'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

export const useGoals = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { mutate } = useMutationFeedback()

  const partnerId = ref<string | undefined>()

  const {
    data: goalsData,
    isLoading: loadingGoals,
    refetch: fetchGoals,
  } = useQuery({
    queryKey: [QUERY_KEYS.GOALS, computed(() => user.value?.id)],
    queryFn: async (): Promise<Goal[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryGoals(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 30_000,
  })

  const {
    data: partnerGoalsData,
    isLoading: loadingPartnerGoals,
    refetch: fetchPartnerGoals,
  } = useQuery({
    queryKey: [QUERY_KEYS.GOALS, partnerId],
    queryFn: async (): Promise<Goal[]> => {
      if (!partnerId.value) return []
      const result = await queryGoals(partnerId.value)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!partnerId.value),
    staleTime: 30_000,
  })

  const goals = computed(() => goalsData.value || [])
  const partnerGoals = computed(() => partnerGoalsData.value || [])

  const setPartnerId = (id: string | undefined) => {
    partnerId.value = id
  }

  const fetchUserGoals = async (userId: string): Promise<Goal[]> => {
    const result = await queryGoals(userId)
    if (result.error) throw result.error
    return result.data || []
  }

  const addGoal = async (goal: Omit<GoalInsert, 'user_id' | 'created_at' | 'current_amount'>) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () =>
        createGoalService({
          ...goal,
          user_id: user.value!.id,
          current_amount: 0,
        } as GoalInsert),
      {
        entity: 'goal',
        action: 'created',
        queryClient,
        queryKeys: [['goals']],
        successKey: 'toast.goal_added',
        errorKey: 'toast.goal_add_error',
        meta: { name: goal.name || '', target_amount: goal.target_amount || 0 },
      },
    )
  }

  const updateGoal = async (id: string, updates: GoalUpdate) => {
    const goalName = goals.value.find((g) => g.id === id)?.name || ''

    return mutate(() => updateGoalService(id, updates), {
      entity: 'goal',
      action: 'updated',
      queryClient,
      queryKeys: [['goals']],
      successKey: 'toast.goal_updated',
      errorKey: 'toast.goal_update_error',
      meta: { name: goalName, ...updates },
      entityId: id,
    })
  }

  const addFunds = async (goalId: string, amount: number) => {
    const goal = goals.value.find((g) => g.id === goalId)
    if (!goal) return { error: new Error('Goal not found') }

    return mutate(() => addFundsService(goalId, amount), {
      entity: 'goal',
      action: 'updated',
      queryClient,
      queryKeys: [['goals']],
      successKey: 'toast.funds_added',
      errorKey: 'toast.funds_add_error',
      meta: { name: goal.name, amount_added: amount },
      entityId: goalId,
    })
  }

  const uploadGoalImage = async (file: File): Promise<string | null> => {
    if (!user.value) return null
    const result = await uploadImageService(user.value.id, file)
    if (result.error) {
      toast.error(t('goals.upload_error'))
      return null
    }
    return result.data
  }

  const deleteGoalImage = async (url: string) => {
    const result = await deleteImageService(url, user.value?.id)
    return { error: result.error }
  }

  const deleteGoal = async (id: string) => {
    const goal = goals.value.find((g) => g.id === id)
    if (goal?.image_url) {
      await deleteGoalImage(goal.image_url)
    }

    return mutate(() => deleteGoalService(id), {
      entity: 'goal',
      action: 'deleted',
      queryClient,
      queryKeys: [['goals']],
      successKey: 'toast.goal_deleted',
      errorKey: 'toast.goal_delete_error',
      meta: { name: goal?.name || '' },
      entityId: id,
    })
  }

  return {
    goals,
    partnerGoals,
    setPartnerId,
    loading: computed(() => loadingGoals.value || loadingPartnerGoals.value),
    fetchGoals,
    fetchPartnerGoals,
    fetchUserGoals,
    addGoal,
    updateGoal,
    addFunds,
    uploadGoalImage,
    deleteGoalImage,
    deleteGoal,
  }
}
