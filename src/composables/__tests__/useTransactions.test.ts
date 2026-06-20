import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useTransactions } from '../useTransactions'

// Auto-imported composables — stub as globals since unplugin-auto-import doesn't run in vitest
vi.stubGlobal('useI18n', () => ({ t: vi.fn((k: string) => k) }))
vi.stubGlobal('useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.stubGlobal('useActivityLog', () => ({ log: vi.fn() }))
vi.stubGlobal('useAuth', () => ({ user: ref({ id: 'user-123' }) }))
vi.stubGlobal('usePartner', () => ({ partner: ref(null) }))
vi.stubGlobal('useCategories', () => ({
  categories: ref([
    { id: 'cat-transfer', name: 'Transfer' },
    { id: 'cat-other', name: 'Other' },
  ]),
}))
vi.stubGlobal('useMutationFeedback', () => ({
  mutate: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}))

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
  useQuery: () => ({
    data: ref({ data: [], count: 0 }),
    isLoading: ref(false),
    refetch: vi.fn(async () => {}),
  }),
}))

vi.mock('@/services/transaction.service', () => ({
  queryTransactions: vi.fn(async () => ({ data: { data: [], count: 0 }, error: null })),
  createTransfer: vi.fn(async () => ({ data: [], error: null })),
  getTransaction: vi.fn(async () => ({ data: null, error: null })),
  createTransaction: vi.fn(async () => ({ data: null, error: null })),
  updateTransaction: vi.fn(async () => ({ data: null, error: null })),
  deleteTransaction: vi.fn(async () => ({ data: null, error: null })),
  bulkUpdateTransactions: vi.fn(async () => ({ data: null, error: null })),
  bulkDeleteTransactions: vi.fn(async () => ({ data: null, error: null })),
  searchTransactions: vi.fn(async () => ({ data: [], error: null })),
  getTransactionSummary: vi.fn(async () => ({ data: null, error: null })),
  getCategoryStats: vi.fn(async () => ({ data: [], error: null })),
  uploadTransactionImage: vi.fn(async () => ({ data: null, error: null })),
  deleteTransactionImage: vi.fn(async () => ({ data: null, error: null })),
}))

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have addTransfer method', () => {
    const { addTransfer } = useTransactions()
    expect(addTransfer).toBeDefined()
    expect(typeof addTransfer).toBe('function')
  })

  it('addTransfer should call createTransfer service', async () => {
    const { addTransfer } = useTransactions()
    const service = await import('@/services/transaction.service')

    const transferData = {
      from_account_id: 'acc-1',
      to_account_id: 'acc-2',
      amount: 1000,
      currency: 'IDR',
      date: '2026-06-07',
      description: 'Test transfer',
    }

    await addTransfer(transferData)
    expect(service.createTransfer).toHaveBeenCalled()
  })
})
