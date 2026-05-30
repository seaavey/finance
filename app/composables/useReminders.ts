import { useLocalStorage } from '@vueuse/core';
import { useRecurring } from './useRecurring';

export interface Reminder {
  id: string;
  transaction_id: string;
  name: string;
  amount: number;
  currency: string;
  next_date: string;
  days_left: number;
}

export const useReminders = () => {
  const { recurring } = useRecurring();
  const dismissedReminders = useLocalStorage<string[]>('dismissed-bill-reminders', []);

  const reminders = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDate(tomorrow);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = formatDate(nextWeek);

    return recurring.value
      .filter((tx) => {
        if (!tx.active || tx.type !== 'expense') {
          return false;
        }
        return tx.next_date === tomorrowStr || tx.next_date === nextWeekStr;
      })
      .map((tx) => ({
        id: `${tx.id}-${tx.next_date}`,
        transaction_id: tx.id,
        name: tx.description || 'Recurring Bill',
        amount: tx.amount,
        currency: tx.currency,
        next_date: tx.next_date,
        days_left: tx.next_date === tomorrowStr ? 1 : 7,
      }));
  });

  const activeReminders = computed(() => {
    return reminders.value.filter((r) => !dismissedReminders.value.includes(r.id));
  });

  const dismissReminder = (id: string) => {
    if (!dismissedReminders.value.includes(id)) {
      dismissedReminders.value.push(id);
    }
  };

  return {
    reminders,
    activeReminders,
    dismissReminder,
  };
};
