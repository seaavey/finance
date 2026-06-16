import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  querySubscriptions,
  createSubscription as createService,
  updateSubscription as updateService,
  deleteSubscription as deleteService,
} from '@/services/subscription.service'
import type { Subscription, SubscriptionInsert, SubscriptionUpdate } from '@/types'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

export const useSubscriptions = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { mutate } = useMutationFeedback()

  const {
    data: subscriptionsData,
    isLoading: loading,
    refetch: fetchSubscriptions,
  } = useQuery({
    queryKey: [QUERY_KEYS.SUBSCRIPTIONS, computed(() => user.value?.id)],
    queryFn: async (): Promise<Subscription[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await querySubscriptions(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.RARELY,
  })

  const subscriptions = computed(() => subscriptionsData.value || [])

  const addSubscription = async (item: Omit<SubscriptionInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () =>
        createService({
          ...item,
          user_id: user.value!.id,
        } as SubscriptionInsert),
      {
        entity: 'subscription',
        action: 'created',
        queryClient,
        queryKeys: [['subscriptions']],
        successKey: 'toast.subscription_added',
        errorKey: 'toast.subscription_add_error',
        meta: { name: item.name || '', amount: item.amount ?? 0 },
      },
    )
  }

  const updateSubscription = async (id: string, updates: SubscriptionUpdate) => {
    return mutate(() => updateService(id, updates), {
      entity: 'subscription',
      action: 'updated',
      queryClient,
      queryKeys: [['subscriptions']],
      successKey: 'toast.subscription_updated',
      errorKey: 'toast.subscription_update_error',
      meta: { name: updates.name ?? '' },
      entityId: id,
    })
  }

  const deleteSubscription = async (id: string) => {
    const subItem = subscriptions.value.find((s) => s.id === id)

    return mutate(() => deleteService(id), {
      entity: 'subscription',
      action: 'deleted',
      queryClient,
      queryKeys: [['subscriptions']],
      successKey: 'toast.subscription_deleted',
      errorKey: 'toast.subscription_delete_error',
      meta: { name: subItem?.name || '' },
      entityId: id,
    })
  }

  const toggleActive = async (id: string, active: boolean) => {
    return updateSubscription(id, { active })
  }

  const monthlyTotal = computed(() => {
    return subscriptions.value
      .filter((s) => s.active !== false)
      .reduce((sum, s) => sum + Number(s.amount || 0), 0)
  })

  return {
    subscriptions,
    loading,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    monthlyTotal,
  }
}
