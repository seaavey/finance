import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import {
  queryCategories,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  createDefaultCategories as seedDefaultsService,
} from '@/services/category.service'
import type { Category, CategoryInsert, CategoryUpdate } from '@/types'

export const useCategories = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { mutate } = useMutationFeedback()

  const {
    data: categoriesData,
    isLoading: loading,
    refetch: fetchCategories,
  } = useQuery({
    queryKey: ['categories', computed(() => user.value?.id)],
    queryFn: async (): Promise<Category[]> => {
      if (!user.value) throw new Error('Not authenticated')
      const result = await queryCategories(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 300_000,
  })

  const categories = computed(() => categoriesData.value || [])

  const seedDefaults = async (userId: string) => {
    const defaults = [
      { name: 'Gaji', icon: 'hugeicons:wallet-01', color: '#22c55e', type: 'income' },
      { name: 'Freelance', icon: 'hugeicons:laptop', color: '#3b82f6', type: 'income' },
      { name: 'Investasi', icon: 'hugeicons:chart', color: '#8b5cf6', type: 'income' },
      { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280', type: 'income' },
      { name: 'Makanan', icon: 'hugeicons:restaurant-01', color: '#f97316', type: 'expense' },
      { name: 'Transport', icon: 'hugeicons:car-01', color: '#06b6d4', type: 'expense' },
      { name: 'Belanja', icon: 'hugeicons:shopping-bag-01', color: '#ec4899', type: 'expense' },
      { name: 'Tagihan', icon: 'hugeicons:receipt-text', color: '#ef4444', type: 'expense' },
      { name: 'Hiburan', icon: 'hugeicons:game-controller-01', color: '#a855f7', type: 'expense' },
      { name: 'Kesehatan', icon: 'hugeicons:health', color: '#14b8a6', type: 'expense' },
      { name: 'Lainnya', icon: 'hugeicons:more-01', color: '#6b7280', type: 'expense' },
    ]
    const result = await seedDefaultsService(userId, defaults)
    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      await fetchCategories()
    }
    return result
  }

  const addCategory = async (category: Omit<CategoryInsert, 'user_id' | 'created_at'>) => {
    if (!user.value) return { error: new Error('Not authenticated') }

    return mutate(
      () =>
        createCategoryService({
          ...category,
          user_id: user.value!.id,
        } as CategoryInsert),
      {
        entity: 'category',
        action: 'created',
        queryClient,
        queryKeys: [['categories']],
        successKey: 'toast.category_added',
        errorKey: 'toast.category_add_error',
        meta: { name: category.name || '' },
        entityId: undefined,
      },
    )
  }

  const updateCategory = async (id: string, updates: CategoryUpdate) => {
    return mutate(() => updateCategoryService(id, updates), {
      entity: 'category',
      action: 'updated',
      queryClient,
      queryKeys: [['categories']],
      successKey: 'toast.category_updated',
      errorKey: 'toast.category_update_error',
      meta: { name: updates.name ?? '' },
      entityId: id,
    })
  }

  const deleteCategory = async (id: string) => {
    const deletedCategoryName = categories.value.find((c) => c.id === id)?.name || ''

    return mutate(() => deleteCategoryService(id), {
      entity: 'category',
      action: 'deleted',
      queryClient,
      queryKeys: [['categories']],
      successKey: 'toast.category_deleted',
      errorKey: 'toast.category_delete_error',
      meta: { name: deletedCategoryName },
      entityId: id,
    })
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
