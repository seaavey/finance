import { useSupabase } from '~/lib/supabase'


export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  created_at: string
}

export const useCategories = () => {
  const { t } = useI18n()
  const { toast } = useToast()
  const supabase = useSupabase()
  const categories = useState<Category[]>('categories', () => [])
  const loading = useState('categories-loading', () => false)

  const fetchCategories = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      categories.value = data as Category[]
    }
    loading.value = false
  }

  const seedDefaults = async (userId: string) => {
    const incomeCategories = [
      { name: t('categories.default_income_salary'), icon: 'wallet', color: '#22c55e' },
      { name: t('categories.default_income_freelance'), icon: 'laptop', color: '#3b82f6' },
      { name: t('categories.default_income_investment'), icon: 'chart', color: '#8b5cf6' },
      { name: t('categories.default_income_other'), icon: 'more', color: '#6b7280' },
    ]
    const expenseCategories = [
      { name: t('categories.default_expense_food'), icon: 'food', color: '#f97316' },
      { name: t('categories.default_expense_transport'), icon: 'car', color: '#06b6d4' },
      { name: t('categories.default_expense_shopping'), icon: 'bag', color: '#ec4899' },
      { name: t('categories.default_expense_bills'), icon: 'receipt', color: '#ef4444' },
      { name: t('categories.default_expense_entertainment'), icon: 'game', color: '#a855f7' },
      { name: t('categories.default_expense_health'), icon: 'health', color: '#14b8a6' },
      { name: t('categories.default_expense_other'), icon: 'more', color: '#6b7280' },
    ]
    const entries = [
      ...incomeCategories.map((c) => ({ ...c, type: 'income' as const, user_id: userId })),
      ...expenseCategories.map((c) => ({ ...c, type: 'expense' as const, user_id: userId })),
    ]
    const { error } = await supabase.from('categories').insert(entries)
    if (!error) await fetchCategories()
  }

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    const { user } = useAuth()
    if (!user.value) return

    const { error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.value.id })

    if (!error) {
      await fetchCategories()
      toast.success(t('toast.category_added'))
    } else {
      toast.error(t('toast.category_add_failed'))
    }
    return { error }
  }

  const updateCategory = async (id: string, updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)

    if (!error) {
      await fetchCategories()
      toast.success(t('toast.category_updated'))
    } else {
      toast.error(t('toast.category_update_failed'))
    }
    return { error }
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchCategories()
      toast.success(t('toast.category_deleted'))
    } else {
      toast.error(t('toast.category_delete_failed'))
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
