import { useSupabase } from '@/lib/supabase'
import { queryList, querySingle, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { uploadImage, deleteImage } from '@/lib/storage-util'
import { GOAL_FIELDS } from '@/services/fields'
import { validateAmount } from '@/lib/utils'
import type { Result, GoalRow, GoalInsert, GoalUpdate } from '@/types'
import { AppError } from '@/types/result'

/** Fetches all goals for a user, ordered by creation date descending. */
export async function queryGoals(userId: string): Promise<Result<GoalRow[]>> {
  const supabase = useSupabase()
  return queryList(
    supabase.from('goals').select(GOAL_FIELDS).eq('user_id', userId).order('created_at', { ascending: false }),
  )
}

/** Fetches a single goal by ID. */
export async function getGoal(id: string): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  return querySingle(supabase.from('goals').select(GOAL_FIELDS).eq('id', id))
}

/** Creates a new goal. */
export async function createGoal(goal: GoalInsert): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  return mutationWithReturn(supabase.from('goals').insert(goal))
}

/** Updates a goal by ID. */
export async function updateGoal(id: string, updates: GoalUpdate): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  return mutationWithReturn(supabase.from('goals').update(updates).eq('id', id))
}

/** Deletes a goal by ID. */
export async function deleteGoal(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(supabase.from('goals').delete().eq('id', id))
}

/** Adds funds to a goal, increasing its current_amount. */
export async function addGoalFunds(goalId: string, amount: number): Promise<Result<GoalRow>> {
  const valid = validateAmount(amount)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }

  const { data: goal, error: fetchError } = await getGoal(goalId)
  if (fetchError || !goal)
    return { data: null, error: fetchError || new AppError('Goal not found', 'NOT_FOUND') }

  const newAmount = Number(goal.current_amount) + (valid.value ?? 0)
  return updateGoal(goalId, { current_amount: newAmount })
}

/** Uploads an image file to the goal-images storage bucket. */
export async function uploadGoalImage(userId: string, file: File): Promise<Result<string>> {
  return uploadImage(userId, file, 'goal-images', 'png')
}

/** Deletes an image from the goal-images storage bucket. */
export async function deleteGoalImage(url: string, userId?: string): Promise<Result<null>> {
  return deleteImage(url, 'goal-images', userId)
}
