import { ref, computed } from 'vue'
import type { PostgrestResponse } from '@supabase/supabase-js'
import { useSupabase } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Database } from '@/types'

export interface CoupleInvitation {
  id: string
  sender_id: string
  recipient_email: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  token: string
  created_at: string
  updated_at: string
  sender?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export type PartnerProfile = Database['public']['Tables']['profiles']['Row']

export const usePartner = () => {
  const supabase = useSupabase()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()
  const activity = useActivityLog()

  const sending = ref(false)

  const { data: partnerData, refetch: fetchPartner } = useQuery({
    queryKey: ['partner', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return null
      const { data: profile } = await supabase
        .from('profiles')
        .select('partner_id')
        .eq('id', user.value?.id)
        .single()

      if (profile?.partner_id) {
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.partner_id)
          .single()
        return partnerProfile

      }
      return null
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000, // 1 min — partner data changes infrequently
  })

  const partner = computed(() => partnerData.value || null)
  const isPartnered = computed(() => partner.value !== null)

  const partnerDisplayName = computed(
    () => partner.value?.display_name || (partner.value ? t('sidebar.partner') : ''),
  )

  const {
    data: sentInvitationsData,
    isLoading: loadingSent,
    refetch: fetchSentInvitations,
  } = useQuery({
    queryKey: ['invitations:sent', computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return []
      const { data } = await supabase
        .from('couple_invitations')
        .select('id, sender_id, recipient_email, status, token, created_at')
        .eq('sender_id', user.value.id)
        .order('created_at', { ascending: false })
      return (data as CoupleInvitation[]) || []
    },
    enabled: computed(() => !!user.value),
    staleTime: 60_000, // 1 min
  })

  const {
    data: receivedInvitationsData,
    isLoading: loadingReceived,
    refetch: fetchReceivedInvitations,
  } = useQuery({
    queryKey: ['invitations:received', computed(() => user.value?.email)],
    queryFn: async () => {
      if (!user.value?.email) return []
      const { data } = await supabase
        .from('couple_invitations')
        .select(
          'id, sender_id, recipient_email, status, token, created_at, updated_at, sender:profiles(display_name, avatar_url)',
        )
        .eq('recipient_email', user.value.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      return (data as unknown as CoupleInvitation[]) || []
    },
    enabled: computed(() => !!user.value?.email),
    staleTime: 30_000, // 30s — incoming invites should stay fresh
  })

  const sentInvitations = computed(() => sentInvitationsData.value || [])
  const receivedInvitations = computed(() => receivedInvitationsData.value || [])
  const loading = computed(() => loadingSent.value || loadingReceived.value)

  const fetchInvitations = async () => {
    await Promise.all([fetchSentInvitations(), fetchReceivedInvitations()])
  }

  const sendInvite = async (email: string) => {
    if (!user.value) {
      toast.error(t('toast.login_required'))
      return { error: new Error('Not authenticated') }
    }

    if (user.value.email === email) {
      toast.error(t('toast.partner_invite_self'))
      return { error: new Error('Cannot invite yourself') }
    }

    sending.value = true

    // Check if user already has a partner
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.value.id)
      .single()

    if (myProfile?.partner_id) {
      toast.error(t('toast.partner_already_connected'))
      sending.value = false
      return { error: new Error('Already partnered') }
    }

    // Check for existing pending invitation to this email
    const { data: existing } = await supabase
      .from('couple_invitations')
      .select('id')
      .eq('sender_id', user.value.id)
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      toast.error(t('toast.partner_invite_exists'))
      sending.value = false
      return { error: new Error('Invitation already pending') }
    }

    const { error } = await supabase.from('couple_invitations').insert({
      sender_id: user.value.id,
      recipient_email: email,
      status: 'pending',
    })

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      toast.success(t('toast.partner_invite_sent'))

      // Notify recipient via email (fire-and-forget)
      const edgeUrl = `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/send-couple-invite`
      supabase.auth.getSession().then(({ data: { session } }) => {
        const token = session?.access_token
        fetch(edgeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            sender_id: user.value!.id,
            recipient_email: email,
          }),
        }).catch((e) => {
          console.warn('Failed to send notification email:', e)
        })
      })
    } else {
      toast.error(t('toast.partner_invite_error'))
    }

    sending.value = false
    return { error }
  }

  const acceptInvite = async (invitationId: string) => {
    const { data, error } = await supabase.rpc('accept_couple_invitation', {
      invitation_id: invitationId,
    })

    const err =
      (data as any)?.error || // RPC returned { error: string }
      error?.message || // Supabase client error
      (error as { details?: string })?.details || // Postgres error detail
      null
    if (!err) {
      queryClient.invalidateQueries({ queryKey: ['partner'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_connected'))
      activity.log('partner', 'connected')
    } else {
      toast.error(t('toast.partner_accept_error'))
    }
    return { error: err ? new Error(err as string) : null }
  }

  const rejectInvite = async (invitationId: string) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_rejected'))
    }
    return { error }
  }

  const cancelInvite = async (invitationId: string) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      toast.success(t('toast.partner_cancelled'))
    }
    return { error }
  }

  const disconnectPartner = async () => {
    const { data, error } = await supabase.rpc('disconnect_partner')

    const err =
      (data as any)?.error || // RPC returned { error: string }
      error?.message || // Supabase client error
      (error as { details?: string })?.details || // Postgres error detail
      null
    if (!err) {
      queryClient.invalidateQueries({ queryKey: ['partner'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:sent'] })
      queryClient.invalidateQueries({ queryKey: ['invitations:received'] })
      toast.success(t('toast.partner_disconnected'))
      activity.log('partner', 'disconnected')
    } else {
      toast.error(t('toast.partner_disconnect_error'))
    }
    return { error: err ? new Error(err as string) : null }
  }

  return {
    partner,
    sentInvitations,
    receivedInvitations,
    loading,
    sending,
    isPartnered,
    partnerDisplayName,
    fetchPartner,
    fetchInvitations,
    sendInvite,
    acceptInvite,
    rejectInvite,
    cancelInvite,
    disconnectPartner,
  }
}
