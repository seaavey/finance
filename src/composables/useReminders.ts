import { useLocalStorage } from '@vueuse/core'
import { useRecurring } from './useRecurring'
import { useSubscriptions } from './useSubscriptions'
import { computed } from 'vue'
import { daysUntil } from '@/lib/utils'

export interface Reminder {
  id: string
  transaction_id: string
  name: string
  amount: number
  currency: string
  next_date: string
  days_left: number
}

/**
 * Aggregates upcoming bill reminders from recurring transactions and subscriptions.
 * Filters items due within the next 7 days and supports dismissing individual reminders.
 *
 * @returns Reactive `reminders`, `activeReminders`, and functions: `dismissReminder`, `clearDismissed`.
 */
export const useReminders = () => {
  const { recurring } = useRecurring()
  const { subscriptions } = useSubscriptions()
  const dismissedReminders = useLocalStorage<string[]>('dismissed-bill-reminders', [])

  const reminders = computed(() => {
    const today = new Date()

    const recurringReminders = recurring.value
      .filter((tx) => {
        if (!tx.active || tx.type !== 'expense') return false
        const diffDays = daysUntil(tx.next_date, today)
        return diffDays >= 0 && diffDays <= 7
      })
      .map((tx) => ({
        id: `${tx.id}-${tx.next_date}`,
        transaction_id: tx.id,
        name: tx.description || 'Recurring Bill',
        amount: tx.amount,
        currency: tx.currency || 'IDR',
        next_date: tx.next_date,
        days_left: daysUntil(tx.next_date, today),
      }))

    const subscriptionReminders = subscriptions.value
      .filter((sub) => {
        if (!sub.active) return false
        const diffDays = daysUntil(sub.next_billing_date, today)
        return diffDays >= 0 && diffDays <= (sub.reminder_days || 7)
      })
      .map((sub) => ({
        id: `${sub.id}-${sub.next_billing_date}`,
        transaction_id: sub.id,
        name: sub.name,
        amount: sub.amount,
        currency: sub.currency || 'IDR',
        next_date: sub.next_billing_date,
        days_left: daysUntil(sub.next_billing_date, today),
      }))

    return [...recurringReminders, ...subscriptionReminders].sort(
      (a, b) => a.days_left - b.days_left,
    )
  })

  const activeReminders = computed(() => {
    return reminders.value.filter((r) => !dismissedReminders.value.includes(r.id))
  })

  const dismissReminder = (id: string) => {
    dismissedReminders.value = [...dismissedReminders.value, id]
  }

  const clearDismissed = () => {
    dismissedReminders.value = []
  }

  return { reminders, activeReminders, dismissReminder, clearDismissed }
}
