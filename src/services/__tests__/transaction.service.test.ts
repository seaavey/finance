import { describe, expect, it, mock } from 'bun:test'
import { queryTransactions } from '../transaction.service'

// Improved mock for useSupabase
const mockSupabase: any = {
  from: () => mockSupabase,
  select: () => mockSupabase,
  eq: () => mockSupabase,
  order: () => mockSupabase,
  range: () => mockSupabase,
  ilike: () => mockSupabase,
  gte: () => mockSupabase,
  lte: () => mockSupabase,
  in: () => mockSupabase,
  then: (resolve: any) => resolve({ data: [], count: 0, error: null }),
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
