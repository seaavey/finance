import { useSupabase } from '@/lib/supabase'
import { CATEGORY_FIELDS } from '@/services/fields'
import type { Result, CategoryRow, CategoryInsert, CategoryUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function queryCategories(userId: string): Promise<Result<CategoryRow[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data || [], error: null }
}

export async function getCategory(id: string): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('categories').select(CATEGORY_FIELDS).eq('id', id).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function createCategory(category: CategoryInsert): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('categories').insert(category).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function updateCategory(
  id: string,
  updates: CategoryUpdate,
): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function deleteCategory(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function createDefaultCategories(
  userId: string,
  defaults: Array<{ name: string; type: string; icon: string; color: string }>,
): Promise<Result<CategoryRow[]>> {
  const supabase = useSupabase()
  const items = defaults.map((d) => ({ ...d, user_id: userId }))

  const { data, error } = await supabase.from('categories').insert(items).select()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data || [], error: null }
}
