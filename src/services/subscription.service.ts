import { useSupabase } from '@/lib/supabase'
import { SUBSCRIPTION_FIELDS } from '@/services/fields'
import type { Result, Subscription, SubscriptionInsert, SubscriptionUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function querySubscriptions(userId: string): Promise<Result<Subscription[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('subscriptions')
    .select(SUBSCRIPTION_FIELDS)
    .eq('user_id', userId)
    .order('next_billing_date', { ascending: true })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as Subscription[]) || [], error: null }
}

export async function createSubscription(subscription: SubscriptionInsert): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('subscriptions').insert(subscription).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as Subscription, error: null }
}

export async function updateSubscription(
  id: string,
  updates: SubscriptionUpdate,
): Promise<Result<Subscription>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as Subscription, error: null }
}

export async function deleteSubscription(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}
