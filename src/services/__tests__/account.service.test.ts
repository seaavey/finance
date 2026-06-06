import { describe, expect, it, mock } from 'bun:test'
import { queryAccounts } from '../account.service'

const mockSupabase: any = {
  from: () => mockSupabase,
  select: () => mockSupabase,
  eq: () => mockSupabase,
  order: () => mockSupabase,
  then: (resolve: any) => resolve({ data: [], error: null }),
}

mock.module('@/lib/supabase', () => ({
  useSupabase: () => mockSupabase,
}))

describe('Account Service: queryAccounts', () => {
  it('fetches accounts for user', async () => {
    const result = await queryAccounts('user-123')

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })
})
