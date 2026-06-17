/**
 * Pure utility functions for budget calculations.
 * No I/O — easy to unit test.
 */

/**
 * Sums spending per category from a list of transactions.
 * Handles both regular and split transactions.
 *
 * @param transactions - Array of transactions with optional splits
 * @param categoryIds - Category IDs to include in the result
 * @returns Map from category ID to total amount spent
 */
export function calculateSpendingByCategory(
  transactions: Array<{
    category_id: string | null
    amount: number
    splits: Array<{ category_id: string; amount: number }> | null
  }>,
  categoryIds: string[],
): Map<string, number> {
  const spentMap = new Map<string, number>()

  for (const tx of transactions) {
    const splits = tx.splits
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

  return spentMap
}

/**
 * Computes rollover amounts from the previous month's budget and spending.
 *
 * @param prevBudgetMap - Map of category IDs to budget amounts from the previous month
 * @param prevSpentMap - Map of category IDs to spending amounts from the previous month
 * @param categoryIds - Category IDs to compute rollover for
 * @returns Map from category ID to rollover amount (budget minus spending)
 */
export function calculateRollover(
  prevBudgetMap: Map<string, number>,
  prevSpentMap: Map<string, number>,
  categoryIds: string[],
): Map<string, number> {
  const rolloverMap = new Map<string, number>()
  for (const catId of categoryIds) {
    rolloverMap.set(catId, (prevBudgetMap.get(catId) || 0) - (prevSpentMap.get(catId) || 0))
  }
  return rolloverMap
}

export interface BudgetProgress {
  percentage: number
  remaining: number
  overspent: number
  effectiveRemaining: number
  effectiveOverspent: number
}

/**
 * Calculates budget progress including percentage, remaining, and overspent amounts.
 *
 * @param amount - Budget amount for the current month
 * @param spent - Total spent against this budget
 * @param rollover - Amount rolled over from the previous month
 * @returns BudgetProgress with percentage, remaining, overspent, and effective values
 */
export function calculateProgress(amount: number, spent: number, rollover: number): BudgetProgress {
  const pct = amount > 0 ? (spent / amount) * 100 : 0
  const diff = amount - spent
  const effectiveAmount = amount + rollover
  const effectiveDiff = effectiveAmount - spent
  return {
    percentage: Math.min(pct, 100),
    remaining: Math.max(diff, 0),
    overspent: Math.max(-diff, 0),
    effectiveRemaining: Math.max(effectiveDiff, 0),
    effectiveOverspent: Math.max(-effectiveDiff, 0),
  }
}

/**
 * Returns the first day of the next month as YYYY-MM-DD.
 *
 * @param month - A date string in YYYY-MM-DD format
 * @returns First day of the following month as YYYY-MM-DD
 */
export function getNextMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year!, mon! - 1, 1)
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Returns the first day of the previous month as YYYY-MM-DD.
 *
 * @param month - A date string in YYYY-MM-DD format
 * @returns First day of the preceding month as YYYY-MM-DD
 */
export function getPrevMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  const prevDate = new Date(year!, mon! - 1, 1)
  prevDate.setMonth(prevDate.getMonth() - 1)
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-01`
}
