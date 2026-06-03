import { useSupabase } from '@/lib/supabase'
import { user } from './useAuth'
import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export type EntityType =
  | 'transaction'
  | 'category'
  | 'budget'
  | 'goal'
  | 'bill'
  | 'account'
  | 'recurring'
  | 'todo'
  | 'partner'
  | 'auth'

export type ActionType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'login'
  | 'logout'
  | 'connected'
  | 'disconnected'

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: EntityType
  entity_id: string | null
  action: ActionType
  metadata: Record<string, unknown>
  created_at: string
}

export interface ActivityLogFilters {
  page?: number
  limit?: number
  entityType?: EntityType | EntityType[]
  action?: ActionType | ActionType[]
  startDate?: string
  endDate?: string
}

export const useActivityLog = () => {
  const supabase = useSupabase()
  const queryClient = useQueryClient()

  const currentFilters = ref<ActivityLogFilters>({})

  const {
    data: logData,
    isLoading: loading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['activity_logs', computed(() => user.value?.id), currentFilters],
    queryFn: async () => {
      if (!user.value) return { logs: [], total: 0 }
      const filters = currentFilters.value
      const { page = 1, limit = 50, entityType, action, startDate, endDate } = filters
      const safePage = Math.max(1, page)

      let query = supabase
        .from('activity_logs')
        .select('id, user_id, entity_type, entity_id, action, metadata, created_at', {
          count: 'exact',
        })
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .range((safePage - 1) * limit, safePage * limit - 1)

      if (entityType) {
        if (Array.isArray(entityType)) {
          query = query.in('entity_type', entityType)
        } else {
          query = query.eq('entity_type', entityType)
        }
      }
      if (action) {
        if (Array.isArray(action)) {
          query = query.in('action', action)
        } else {
          query = query.eq('action', action)
        }
      }
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, count } = await query

      return {
        logs: (data as ActivityLog[]) || [],
        total: count || 0,
      }
    },
    enabled: computed(() => !!user.value),
    staleTime: 5_000, // 5s — activity log refreshes frequently but avoid refetch on every mount
  })

  // Append logic - we keep existing logs if page > 1, otherwise we replace
  // This approach is a bit tricky with useQuery directly, so we manage a local ref
  // synced with query results for pagination support.
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

    // Fire-and-forget: failure to log shouldn't block user's primary action
    try {
      await supabase.from('activity_logs').insert({
        user_id: user.value.id,
        entity_type: entityType,
        entity_id: entityId ?? null,
        action,
        metadata: metadata ?? {},
      })
      // invalidate cache silently so next fetch is up to date
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] })
    } catch {
      // Silently ignore — activity logging is best-effort
    }
  }

  const fetchAll = async (filters: ActivityLogFilters = {}) => {
    currentFilters.value = filters
    await refetchLogs()
  }

  const fetchRecent = async (limitCount = 5): Promise<ActivityLog[]> => {
    if (!user.value) return []

    return queryClient.fetchQuery({
      queryKey: ['activity_logs:recent', user.value.id, limitCount],
      queryFn: async () => {
        const { data } = await supabase
          .from('activity_logs')
          .select('id, user_id, entity_type, entity_id, action, metadata, created_at')
          .eq('user_id', user.value!.id)
          .order('created_at', { ascending: false })
          .limit(limitCount)

        return (data as ActivityLog[]) || []
      },
      staleTime: 10_000,
    })
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
