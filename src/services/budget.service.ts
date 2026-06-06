import { useSupabase } from '@/lib/supabase'
import type { Result, BudgetWithProgress, BudgetRow, BudgetInsert, BudgetUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function queryBudgets(userId: string, month: string): Promise<Result<BudgetRow[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .order('created_at')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function createBudget(
  userId: string,
  categoryId: string,
  month: string,
  amount: number,
  name?: string | null,
): Promise<Result<BudgetRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('budgets')
    .insert({ user_id: userId, category_id: categoryId, month, amount, name: name || null })
    .select()
    .single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function updateBudget(
  id: string,
  updates: BudgetUpdate,
): Promise<Result<BudgetRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function deleteBudget(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('budgets').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function queryBudgetWithProgress(
  userId: string,
  month: string,
): Promise<Result<BudgetWithProgress[]>> {
  const supabase = useSupabase()

  // 1. Fetch budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)

  if (budgetError)
    return { data: null, error: new AppError(budgetError.message, budgetError.code, budgetError) }
  if (!budgets?.length) return { data: [], error: null }

  const categoryIds = budgets.map((b) => b.category_id)

  // 2. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .in('id', categoryIds)

  const categoryMap = new Map(
    (categories || []).map((c) => [c.id, { name: c.name, color: c.color, icon: c.icon }]),
  )

  // 3. Calculate spending for the month
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year!, mon! - 1, 1)
  date.setMonth(date.getMonth() + 1)
  const nextMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`

  const { data: txData } = await supabase
    .from('transactions')
    .select('category_id, amount, splits')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', month)
    .lt('date', nextMonth)

  const spentMap = new Map<string, number>()
  for (const tx of txData || []) {
    const splits = tx.splits as unknown as Array<{ category_id: string; amount: number }> | null
    if (splits?.length) {
      for (const split of splits) {
        if (categoryIds.includes(split.category_id)) {
          spentMap.set(
            split.category_id,
            (spentMap.get(split.category_id) || 0) + Number(split.amount),
          )
        }
      }
    } else if (tx.category_id && categoryIds.includes(tx.category_id)) {
      spentMap.set(tx.category_id, (spentMap.get(tx.category_id) || 0) + Number(tx.amount))
    }
  }

  // 4. Fetch rollover from previous month
  const prevDate = new Date(year!, mon! - 1, 1)
  prevDate.setMonth(prevDate.getMonth() - 1)
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-01`

  const rolloverMap = await getBudgetRollover(userId, categoryIds, prevMonth, month)

  // 5. Assemble result
  const result: BudgetWithProgress[] = budgets.map((b) => {
    const cat = categoryMap.get(b.category_id)
    return {
      ...b,
      category_name: cat?.name || '-',
      category_color: cat?.color || '#6b7280',
      category_icon: cat?.icon || '',
      spent: spentMap.get(b.category_id) || 0,
      rollover: rolloverMap.get(b.category_id) || 0,
    }
  })

  return { data: result, error: null }
}

// Extracted pure rollover logic
export async function getBudgetRollover(
  userId: string,
  categoryIds: string[],
  prevMonth: string,
  currentMonth: string,
): Promise<Map<string, number>> {
  const supabase = useSupabase()
  const rolloverMap = new Map<string, number>()

  const { data: prevBudgetData } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('month', prevMonth)
    .in('category_id', categoryIds)

  if (!prevBudgetData?.length) return rolloverMap

  const prevCatIds = [...new Set(prevBudgetData.map((pb) => pb.category_id))]
  const prevBudgetMap = new Map<string, number>()
  for (const pb of prevBudgetData) {
    prevBudgetMap.set(pb.category_id, (prevBudgetMap.get(pb.category_id) || 0) + Number(pb.amount))
  }

  const { data: prevTxData } = await supabase
    .from('transactions')
    .select('category_id, amount, splits')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', prevMonth)
    .lt('date', currentMonth)

  const prevSpentMap = new Map<string, number>()
  for (const tx of prevTxData || []) {
    const splits = tx.splits as unknown as Array<{ category_id: string; amount: number }> | null
    if (splits?.length) {
      for (const split of splits) {
        if (prevCatIds.includes(split.category_id)) {
          prevSpentMap.set(
            split.category_id,
            (prevSpentMap.get(split.category_id) || 0) + Number(split.amount),
          )
        }
      }
    } else if (tx.category_id && prevCatIds.includes(tx.category_id)) {
      prevSpentMap.set(tx.category_id, (prevSpentMap.get(tx.category_id) || 0) + Number(tx.amount))
    }
  }

  for (const catId of prevCatIds) {
    rolloverMap.set(catId, (prevBudgetMap.get(catId) || 0) - (prevSpentMap.get(catId) || 0))
  }

  return rolloverMap
}

// Pure calculation — no I/O, perfect for unit testing
export function calculateProgress(budget: BudgetWithProgress) {
  const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
  const diff = budget.amount - budget.spent
  const effectiveAmount = budget.amount + budget.rollover
  const effectiveDiff = effectiveAmount - budget.spent
  return {
    percentage: Math.min(pct, 100),
    remaining: Math.max(diff, 0),
    overspent: Math.max(-diff, 0),
    effectiveRemaining: Math.max(effectiveDiff, 0),
    effectiveOverspent: Math.max(-effectiveDiff, 0),
  }
}
