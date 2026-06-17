import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  getProfile,
  queryInvitations,
  sendInvitation,
  acceptInvitation as acceptInvitationService,
  rejectInvitation as rejectInvitationService,
  cancelInvitation as cancelInvitationService,
  disconnectPartner as disconnectPartnerService,
  querySentInvitations,
  getExistingPendingInvitation,
} from '@/services/partner.service'
import { callEdgeFunction } from '@/lib/rpc'
import { QUERY_KEYS, STALE_TIMES } from '@/constants'

/**
 * Manages partner connections via invitation system.
 * Handles sending, accepting, rejecting, and canceling invitations,
 * as well as disconnecting an existing partner link.
 *
 * @returns Reactive `partner`, `myProfile`, `sentInvitations`, `receivedInvitations`,
 * `isPartnered`, `partnerDisplayName`, `loading`, `sending`, and functions:
 * `fetchPartner`, `fetchInvitations`, `sendInvite`, `acceptInvite`, `rejectInvite`,
 * `cancelInvite`, `disconnectPartner`.
 */
export const usePartner = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()
  const activity = useActivityLog()
  const { mutate } = useMutationFeedback()

  const sending = ref(false)

  const { data: myProfileData, refetch: _refetchMyProfile } = useQuery({
    queryKey: [QUERY_KEYS.MY_PROFILE, computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return null
      const result = await getProfile(user.value.id)
      if (result.error) throw result.error
      return result.data
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DAILY,
  })

  const myProfile = computed(() => myProfileData.value || null)

  const { data: partnerData, refetch: fetchPartner } = useQuery({
    queryKey: [QUERY_KEYS.PARTNER, computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return null
      const myProfileResult = await getProfile(user.value.id)
      if (myProfileResult.error) throw myProfileResult.error

      if (myProfileResult.data?.partner_id) {
        const partnerProfileResult = await getProfile(myProfileResult.data.partner_id)
        if (partnerProfileResult.error) throw partnerProfileResult.error
        return partnerProfileResult.data
      }
      return null
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DAILY,
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
    queryKey: [QUERY_KEYS.INVITATIONS_SENT, computed(() => user.value?.id)],
    queryFn: async () => {
      if (!user.value) return []
      const result = await querySentInvitations(user.value.id)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value),
    staleTime: STALE_TIMES.DAILY,
  })

  const {
    data: receivedInvitationsData,
    isLoading: loadingReceived,
    refetch: fetchReceivedInvitations,
  } = useQuery({
    queryKey: [QUERY_KEYS.INVITATIONS_RECEIVED, computed(() => user.value?.email)],
    queryFn: async () => {
      if (!user.value?.email) return []
      const result = await queryInvitations(user.value.email)
      if (result.error) throw result.error
      return result.data || []
    },
    enabled: computed(() => !!user.value?.email),
    staleTime: STALE_TIMES.DEFAULT,
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
    const myProfileResult = await getProfile(user.value.id)
    if (myProfileResult.data?.partner_id) {
      toast.error(t('toast.partner_already_connected'))
      sending.value = false
      return { error: new Error('Already partnered') }
    }

    // Check for existing pending invitation to this email
    const existingResult = await getExistingPendingInvitation(user.value.id, email)
    if (existingResult.error) {
      sending.value = false
      return { error: existingResult.error }
    }
    const existing = existingResult.data

    if (existing) {
      toast.error(t('toast.partner_invite_exists'))
      sending.value = false
      return { error: new Error('Invitation already pending') }
    }

    const result = await sendInvitation(user.value.id, email)

    if (!result.error) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVITATIONS_SENT] })
      toast.success(t('toast.partner_invite_sent'))

      // Notify recipient via email (fire-and-forget)
      const senderId = user.value.id
      callEdgeFunction('send-couple-invite', {
        sender_id: senderId,
        recipient_email: email,
      }).catch((e) => {
        console.warn('Failed to send notification email:', e)
      })
    } else {
      toast.error(t('toast.partner_invite_error'))
    }

    sending.value = false
    return { error: result.error }
  }

  const partnerQueryKeys = [
    [QUERY_KEYS.PARTNER],
    [QUERY_KEYS.ACCOUNTS],
    ['invitations:sent'],
    ['invitations:received'],
  ]

  const acceptInvite = async (invitationId: string) => {
    return mutate(() => acceptInvitationService(invitationId), {
      entity: 'partner',
      action: 'created',
      queryClient,
      queryKeys: partnerQueryKeys,
      successKey: 'toast.partner_connected',
      errorKey: 'toast.partner_accept_error',
      silent: false,
    })
  }

  const rejectInvite = async (invitationId: string) => {
    return mutate(() => rejectInvitationService(invitationId), {
      entity: 'partner',
      action: 'deleted',
      queryClient,
      queryKeys: [['invitations:received']],
      successKey: 'toast.partner_rejected',
      errorKey: 'toast.partner_reject_error',
    })
  }

  const cancelInvite = async (invitationId: string) => {
    return mutate(() => cancelInvitationService(invitationId), {
      entity: 'partner',
      action: 'deleted',
      queryClient,
      queryKeys: [['invitations:sent']],
      successKey: 'toast.partner_cancelled',
      errorKey: 'toast.partner_cancel_error',
    })
  }

  const disconnectPartner = async () => {
    return mutate(() => disconnectPartnerService(), {
      entity: 'partner',
      action: 'deleted',
      queryClient,
      queryKeys: partnerQueryKeys,
      successKey: 'toast.partner_disconnected',
      errorKey: 'toast.partner_disconnect_error',
    })
  }

  return {
    myProfile,
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
