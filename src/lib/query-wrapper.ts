import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

/**
 * Executes a Supabase query and returns exactly one row.
 * Fails with an error if zero or multiple rows match.
 *
 * @param builder - A Supabase select query builder (without .single() appended)
 * @returns Result containing the single row, or an AppError
 */
export async function querySingle<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T>> {
  const { data, error } = await builder.single()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}

/**
 * Executes a Supabase query and returns one row or null.
 * Unlike querySingle, returns null when no rows match instead of an error.
 *
 * @param builder - A Supabase select query builder
 * @returns Result containing the row or null, or an AppError
 */
export async function queryMaybeSingle<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T | null>> {
  const { data, error } = await builder.maybeSingle()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as T) || null, error: null }
}

/**
 * Executes a Supabase query and returns all matching rows.
 *
 * @param builder - A Supabase select query builder
 * @returns Result containing an array of rows (empty array if none), or an AppError
 */
export async function queryList<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T[]>> {
  const { data, error } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as T[]) || [], error: null }
}

/**
 * Executes a Supabase insert or update and returns the affected row.
 * Appends .select().single() to the builder automatically.
 *
 * @param builder - A Supabase insert or update builder (without .select() appended)
 * @returns Result containing the created/updated row, or an AppError
 */
export async function mutationWithReturn<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['insert' | 'update'],
): Promise<Result<T>> {
  const { data, error } = await builder.select().single()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}

/**
 * Executes a Supabase write operation that returns no data.
 * Used for deletes or updates where the returned row is not needed.
 *
 * @param builder - A Supabase delete or update builder
 * @returns Result containing null on success, or an AppError
 */
export async function mutationVoid(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['delete' | 'update'],
): Promise<Result<null>> {
  const { error } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

/**
 * Executes a Supabase select query and returns both rows and total count.
 * Used for paginated queries where the total count is needed.
 *
 * @param builder - A Supabase select query with .count('exact') applied
 * @returns Result containing an object with data array and count, or an AppError
 */
export async function queryWithCount<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<{ data: T[]; count: number }>> {
  const { data, error, count } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: { data: (data as T[]) || [], count: count || 0 }, error: null }
}
