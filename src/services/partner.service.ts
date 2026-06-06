import { useSupabase } from '@/lib/supabase'
import type { Result, ProfileRow, InvitationRow, CoupleInvitation } from '@/types'
import { AppError } from '@/types/result'

export async function getProfile(userId: string): Promise<Result<ProfileRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function queryInvitations(email: string): Promise<Result<CoupleInvitation[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('couple_invitations')
    .select('*, sender:profiles(display_name, avatar_url)')
    .eq('recipient_email', email)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as unknown as CoupleInvitation[]) || [], error: null }
}

export async function sendInvitation(
  senderId: string,
  recipientEmail: string,
): Promise<Result<InvitationRow>> {
  const supabase = useSupabase()
  const token = crypto.randomUUID()

  const { data, error } = await supabase
    .from('couple_invitations')
    .insert({
      sender_id: senderId,
      recipient_email: recipientEmail,
      token,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function acceptInvitation(invitationId: string): Promise<Result<unknown>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.rpc('accept_couple_invitation', {
    invitation_id: invitationId,
  })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  // Check for application-level error returned by RPC
  const err = (data as { error?: string } | null)?.error
  if (err) return { data: null, error: new AppError(err, 'RPC_ERROR') }

  return { data, error: null }
}

export async function rejectInvitation(invitationId: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase
    .from('couple_invitations')
    .update({ status: 'rejected' })
    .eq('id', invitationId)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function cancelInvitation(invitationId: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase
    .from('couple_invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function disconnectPartner(): Promise<Result<unknown>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.rpc('disconnect_partner')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  const err = (data as { error?: string } | null)?.error
  if (err) return { data: null, error: new AppError(err, 'RPC_ERROR') }

  return { data, error: null }
}
