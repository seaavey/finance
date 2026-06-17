import { useSupabase } from '@/lib/supabase'
import {
  querySingle,
  queryList,
  mutationWithReturn,
  mutationVoid,
  queryMaybeSingle,
} from '@/lib/query-wrapper'
import { PROFILE_FIELDS } from '@/services/fields'
import type { Result, ProfileRow, Invitation, InvitationRow, CoupleInvitation } from '@/types'
import { AppError } from '@/types/result'

/** Fetches a user profile by ID. */
export async function getProfile(userId: string): Promise<Result<ProfileRow>> {
  const supabase = useSupabase()
  return querySingle<ProfileRow>(supabase.from('profiles').select(PROFILE_FIELDS).eq('id', userId))
}

/** Queries pending couple invitations addressed to the given email. */
export async function queryInvitations(email: string): Promise<Result<CoupleInvitation[]>> {
  const supabase = useSupabase()
  return queryList<CoupleInvitation>(
    supabase
      .from('couple_invitations')
      .select('*, sender:profiles(display_name, avatar_url)')
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  )
}

/** Creates a new couple invitation with a unique token. */
export async function sendInvitation(
  senderId: string,
  recipientEmail: string,
): Promise<Result<InvitationRow>> {
  const supabase = useSupabase()
  const token = crypto.randomUUID()
  return mutationWithReturn<InvitationRow>(
    supabase.from('couple_invitations').insert({
      sender_id: senderId,
      recipient_email: recipientEmail,
      token,
      status: 'pending',
    }),
  )
}

/** Accepts a couple invitation via the accept_couple_invitation RPC. */
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

/** Marks a couple invitation as rejected. */
export async function rejectInvitation(invitationId: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('couple_invitations').update({ status: 'rejected' }).eq('id', invitationId),
  )
}

/** Marks a couple invitation as cancelled. */
export async function cancelInvitation(invitationId: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('couple_invitations').update({ status: 'cancelled' }).eq('id', invitationId),
  )
}

/** Removes the partner link via the disconnect_partner RPC. */
export async function disconnectPartner(): Promise<Result<unknown>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.rpc('disconnect_partner')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  const err = (data as { error?: string } | null)?.error
  if (err) return { data: null, error: new AppError(err, 'RPC_ERROR') }

  return { data, error: null }
}

/** Queries couple invitations sent by a user. */
export async function querySentInvitations(senderId: string): Promise<Result<Invitation[]>> {
  const supabase = useSupabase()
  return queryList<Invitation>(
    supabase
      .from('couple_invitations')
      .select('created_at, id, recipient_email, sender_id, status, token, updated_at')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false }),
  )
}

/** Checks whether a pending invitation already exists between a sender and recipient. */
export async function getExistingPendingInvitation(
  senderId: string,
  email: string,
): Promise<Result<{ id: string } | null>> {
  const supabase = useSupabase()
  return queryMaybeSingle<{ id: string }>(
    supabase
      .from('couple_invitations')
      .select('id')
      .eq('sender_id', senderId)
      .eq('recipient_email', email)
      .eq('status', 'pending'),
  )
}
