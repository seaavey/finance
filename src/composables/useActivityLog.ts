import { computed, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { queryActivityLogs, logActivity } from '@/services/activity.service'


export const useActivityLog = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const currentFilters = ref<ActivityLogFilters>({})

  const {
    data: logData,
    isLoading: loading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['activity_logs', computed(() => user.value?.id), currentFilters],
    queryFn: async () => {
      if (!user.value) return { logs: [], total: 0 }
      const result = await queryActivityLogs(user.value.id, currentFilters.value)
      if (result.error) throw result.error
      return result.data || { logs: [], total: 0 }
    },
    enabled: computed(() => !!user.value),
    staleTime: 5_000,
  })

  // Append logic - we keep existing logs if page > 1, otherwise we replace
  const accumulatedLogs = ref<ActivityLog[]>([])

  watch(
    () => logData.value,
    (newData) => {
      if (!newData) return
      const isFirstPage = (currentFilters.value.page || 1) === 1
      if (isFirstPage) {
        accumulatedLogs.value = newData.logs
      } else {
        accumulatedLogs.value = [...accumulatedLogs.value, ...newData.logs]
      }
    },
  )

  const logs = computed(() => accumulatedLogs.value)
  const total = computed(() => logData.value?.total || 0)

  const log = async (
    entityType: EntityType,
    action: ActionType,
    metadata?: Record<string, unknown>,
    entityId?: string,
  ) => {
    if (!user.value) return

    // Fire-and-forget
    try {
      await logActivity({
        user_id: user.value.id,
        entity_type: entityType,
        entity_id: entityId ?? null,
        action,
        metadata: (metadata || {}) as any,
      })
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
    } catch {
      // Silently ignore
    }
  }

  const fetchAll = async (filters: ActivityLogFilters = {}) => {
    currentFilters.value = filters
    await refetchLogs()
  }

  const fetchRecent = async (limitCount = 5): Promise<ActivityLog[]> => {
    if (!user.value) return []
    const result = await queryActivityLogs(user.value.id, { limit: limitCount })
    return result.data?.logs || []
  }

  return {
    logs,
    loading,
    total,
    log,
    fetchAll,
    fetchRecent,
  }
}
