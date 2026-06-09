import { useSupabase } from '@/lib/supabase'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { SUBSCRIPTION_FIELDS } from '@/services/fields'
import type { Result, Subscription, SubscriptionInsert, SubscriptionUpdate } from '@/types'

export async function querySubscriptions(userId: string): Promise<Result<Subscription[]>> {
  const supabase = useSupabase()
  return queryList<Subscription>(
    supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_FIELDS)
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true }),
  )
}

export async function createSubscription(subscription: SubscriptionInsert): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  return mutationWithReturn<Subscription>(
    supabase.from('subscriptions').insert(subscription),
  )
}

export async function updateSubscription(
  id: string,
  updates: SubscriptionUpdate,
): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  return mutationWithReturn<Subscription>(
    supabase.from('subscriptions').update(updates).eq('id', id),
  )
}

export async function deleteSubscription(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('subscriptions').delete().eq('id', id),
  )
}
