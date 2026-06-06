import { computed } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

import type { Database } from '@/types'

export type Category = Database['public']['Tables']['categories']['Row']

const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Gaji', icon: 'hugeicons:wallet-01', color: '#22c55e' },
    { name: 'Freelance', icon: 'hugeicons:laptop', color: '#3b82f6' },
    { name: 'Investasi', icon: 'hugeicons:chart', color: '#8b5cf6' },
    { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280' },
  ],
  expense: [
    { name: 'Makanan', icon: 'hugeicons:restaurant-01', color: '#f97316' },
    { name: 'Transport', icon: 'hugeicons:car-01', color: '#06b6d4' },
    { name: 'Belanja', icon: 'hugeicons:shopping-bag-01', color: '#ec4899' },
    { name: 'Tagihan', icon: 'hugeicons:receipt-text', color: '#ef4444' },
    { name: 'Hiburan', icon: 'hugeicons:game-controller-01', color: '#a855f7' },
    { name: 'Kesehatan', icon: 'hugeicons:health', color: '#14b8a6' },
    { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280' },
  ],
}

export const useCategories = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const {
    data: categoriesData,
    isLoading: loading,
    refetch: fetchCategories,
  } = useQuery({
    queryKey: ['categories', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('categories')
        .select('id, user_id, name, type, icon, color, created_at')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 300_000, // 5 min — categories almost never change
  })

  const categories = computed(() => categoriesData.value || [])

  const seedDefaults = async (userId: string) => {
    const entries = [
      ...DEFAULT_CATEGORIES.income.map((c) => ({ ...c, type: 'income' as const, user_id: userId })),
      ...DEFAULT_CATEGORIES.expense.map((c) => ({
        ...c,
        type: 'expense' as const,
        user_id: userId,
      })),
    ]
    const { error } = await supabase.from('categories').insert(entries)
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      await fetchCategories()
    }
  }

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    if (!user.value) {
      return
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.value.id })
      .select()

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_added'))
      activity.log('category', 'created', { name: category.name }, data?.[0]?.id)
    } else {
      toast.error(t('toast.category_add_error'))
    }
    return { error }
  }

  const updateCategory = async (
    id: string,
    updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>,
  ) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_updated'))
      activity.log('category', 'updated', { name: updates.name }, id)
    } else {
      toast.error(t('toast.category_update_error'))
    }
    return { error }
  }

  const deleteCategory = async (id: string) => {
    const deletedCategoryName = categories.value.find((c) => c.id === id)?.name || ''
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(t('toast.category_deleted'))
      activity.log('category', 'deleted', { name: deletedCategoryName }, id)
    } else {
      toast.error(t('toast.category_delete_error'))
    }
    return { error }
  }

  const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'))
  const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'))

  return {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    fetchCategories,
    seedDefaults,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
