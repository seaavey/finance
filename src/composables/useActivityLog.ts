import { useSupabase } from '@/lib/supabase'

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
  const { user } = useAuth()

  const logs = ref<ActivityLog[]>([])
  const loading = ref(false)
  const total = ref(0)

  const log = async (
    entityType: EntityType,
    action: ActionType,
    metadata?: Record<string, unknown>,
    entityId?: string,
  ) => {
    if (!user.value) return

    // Fire-and-forget: failure to log shouldn't block user's primary action
    supabase.from('activity_logs').insert({
      user_id: user.value.id,
      entity_type: entityType,
      entity_id: entityId ?? null,
      action,
      metadata: metadata ?? {},
    }).catch(() => {
      // Silently ignore — activity logging is best-effort
    })
  }

  const fetchAll = async (filters: ActivityLogFilters = {}) => {
    if (!user.value) return
    loading.value = true

    const { page = 1, limit = 50, entityType, action, startDate, endDate } = filters
    const safePage = Math.max(1, page)

    try {
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' })
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

      if (data) {
        logs.value = data as ActivityLog[]
      } else {
        logs.value = []
      }
      if (count !== null) {
        total.value = count
      }
    } catch {
      logs.value = []
      loading.value = false
    }
  }

  const fetchRecent = async (limitCount = 5): Promise<ActivityLog[]> => {
    if (!user.value) return []

    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })
        .limit(limitCount)

      return (data as ActivityLog[]) || []
    } catch {
      return []
    }
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
