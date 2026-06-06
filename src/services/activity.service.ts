import { useSupabase } from '@/lib/supabase'
import type { Database, Json } from '@/types'
import type { Result } from '@/types/result'
import { AppError } from '@/types/result'

export type ActivityLogRow = Omit<Database['public']['Tables']['activity_logs']['Row'], 'metadata'> & {
  metadata: any
}
export type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

export interface ActivityLogFilters {
  page?: number
  limit?: number
  entityType?: string | string[]
  action?: string
  startDate?: string
  endDate?: string
}

export async function queryActivityLogs(
  userId: string,
  filters: ActivityLogFilters = {},
): Promise<Result<{ logs: ActivityLogRow[]; total: number }>> {
  const supabase = useSupabase()
  const { page = 1, limit = 50, entityType, action, startDate, endDate } = filters
  const safePage = Math.max(1, page)

  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((safePage - 1) * limit, safePage * limit - 1)

  if (entityType) {
    if (Array.isArray(entityType)) {
      query = query.in('entity_type', entityType)
    } else {
      query = query.eq('entity_type', entityType)
    }
  }
  if (action) query = query.eq('action', action)
  if (startDate) query = query.gte('created_at', startDate)
  if (endDate) query = query.lte('created_at', endDate)

  const { data, error, count } = await query

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: { logs: (data as ActivityLogRow[]) || [], total: count || 0 }, error: null }
}

export async function logActivity(log: ActivityLogInsert): Promise<Result<ActivityLogRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('activity_logs').insert(log).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as ActivityLogRow, error: null }
}
