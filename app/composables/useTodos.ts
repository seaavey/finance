import { useSupabase } from '~/lib/supabase'


export type TodoPriority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  user_id: string
  title: string
  is_complete: boolean
  priority: TodoPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

const PRIORITY_ORDER: Record<TodoPriority, number> = { high: 0, medium: 1, low: 2 }

export const useTodos = () => {
  const { toast } = useToast()
  const supabase = useSupabase()
  const { user } = useAuth()
  const todos = useState<Todo[]>('todos', () => [])
  const loading = useState('todos-loading', () => false)

  const fetchTodos = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const sorted = [...data].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority as TodoPriority]
        const pb = PRIORITY_ORDER[b.priority as TodoPriority]
        if (pa !== pb) { return pa - pb }
        const da = a.due_date ? new Date(a.due_date).getTime() : Infinity
        const db = b.due_date ? new Date(b.due_date).getTime() : Infinity
        return da - db
      })
      todos.value = sorted as Todo[]
    }
    loading.value = false
  }

  const addTodo = async (title: string, priority: TodoPriority = 'medium', due_date: string | null = null) => {
    if (!user.value) { return { error: { message: 'Not authenticated' } } }

    const { error } = await supabase
      .from('todos')
      .insert({ title, priority, due_date, user_id: user.value.id })

    if (!error) {
      await fetchTodos()
      toast.success('Todo berhasil ditambahkan')
    } else {
      toast.error('Gagal menambahkan todo')
    }
    return { error }
  }

  const updateTodo = async (id: string, updates: Partial<Pick<Todo, 'title' | 'is_complete' | 'priority' | 'due_date'>>) => {
    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)

    if (!error) {
      await fetchTodos()
    } else {
      toast.error('Gagal memperbarui todo')
    }
    return { error }
  }

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchTodos()
      toast.success('Todo berhasil dihapus')
    } else {
      toast.error('Gagal menghapus todo')
    }
    return { error }
  }

  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    updateTodo,
    deleteTodo,
  }
}
