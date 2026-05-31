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

    return recurring.value
      .filter((tx) => {
        if (!tx.active || tx.type !== 'expense') {
          return false;
        }
        const nextDate = new Date(tx.next_date);
        nextDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      })
      .map((tx) => {
        const nextDate = new Date(tx.next_date);
        nextDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: `${tx.id}-${tx.next_date}`,
          transaction_id: tx.id,
          name: tx.description || 'Recurring Bill',
          amount: tx.amount,
          currency: tx.currency,
          next_date: tx.next_date,
          days_left: diffDays,
        };
      });
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
