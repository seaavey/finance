import { describe, expect, it, mock } from 'bun:test'
import { queryTransactions } from '../transaction.service'

interface MockSupabaseChain {
  from: () => MockSupabaseChain
  select: () => MockSupabaseChain
  eq: () => MockSupabaseChain
  order: () => MockSupabaseChain
  range: () => MockSupabaseChain
  ilike: () => MockSupabaseChain
  gte: () => MockSupabaseChain
  lte: () => MockSupabaseChain
  in: () => MockSupabaseChain
  then: (resolve: (val: { data: unknown[]; count: number; error: unknown }) => void) => void
}

const mockSupabase: MockSupabaseChain = {
  from: () => mockSupabase,
  select: () => mockSupabase,
  eq: () => mockSupabase,
  order: () => mockSupabase,
  range: () => mockSupabase,
  ilike: () => mockSupabase,
  gte: () => mockSupabase,
  lte: () => mockSupabase,
  in: () => mockSupabase,
  then: (resolve) => resolve({ data: [], count: 0, error: null }),
}

mock.module('@/lib/supabase', () => ({
  useSupabase: () => mockSupabase,
}))

describe('Transaction Service: queryTransactions', () => {
  it('calls Supabase with correct filters', async () => {
    const result = await queryTransactions('user-123', { type: 'expense' }, 1, 20)

    expect(result.data).not.toBeNull()
    expect(result.data?.data).toEqual([])
    expect(result.error).toBeNull()
  })
})
