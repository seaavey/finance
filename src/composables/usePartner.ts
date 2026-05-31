import { ref, computed } from 'vue';
import type { PostgrestResponse } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/supabase';
import { createCache } from '@/lib/cache';

export interface CoupleInvitation {
  id: string;
  sender_id: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  token: string;
  created_at: string;
  updated_at: string;
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface PartnerProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  currency: string;
}

export const usePartner = () => {
  const supabase = useSupabase();
  const cache = createCache();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const partner = ref<PartnerProfile | null>(null);
  const sentInvitations = ref<CoupleInvitation[]>([]);
  const receivedInvitations = ref<CoupleInvitation[]>([]);
  const loading = ref(false);
  const sending = ref(false);

  const isPartnered = computed(() => partner.value !== null);

  const partnerDisplayName = computed(
    () => partner.value?.display_name || (partner.value ? t('sidebar.partner') : ''),
  );

  const fetchPartner = async () => {
    if (!user.value) {
      return;
    }

    const result = await cache.fetch(
      `partner:${user.value.id}`,
      async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('partner_id')
          .eq('id', user.value?.id)
          .single();

        if (profile?.partner_id) {
          const { data: partnerData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url, currency')
            .eq('id', profile.partner_id)
            .single();
          return partnerData as PartnerProfile | null;
        }
        return null;
      },
      60_000,
    );

    partner.value = result;
  };

  const fetchInvitations = async () => {
    if (!user.value?.email) {
      return;
    }
    loading.value = true;

    const [sentResult, receivedResult] = await Promise.all([
      cache.fetch(
        `invitations:sent:${user.value.id}`,
        async () => await supabase.from('couple_invitations').select('*').eq('sender_id', user.value?.id).order('created_at', { ascending: false }),
        60_000,
      ) as Promise<PostgrestResponse<CoupleInvitation>>,
      cache.fetch(
        `invitations:received:${user.value.email}`,
        async () => await supabase.from('couple_invitations').select('*, sender:profiles(display_name, avatar_url)').eq('recipient_email', user.value?.email).eq('status', 'pending').order('created_at', { ascending: false }),
        60_000,
      ) as Promise<PostgrestResponse<CoupleInvitation>>,
    ]);

    if (!sentResult.error && sentResult.data) {
      sentInvitations.value = sentResult.data;
    }
    if (!receivedResult.error && receivedResult.data) {
      receivedInvitations.value = receivedResult.data;
    }
    loading.value = false;
  };

  const sendInvite = async (email: string) => {
    if (!user.value) {
      toast.error(t('toast.login_required'));
      return { error: new Error('Not authenticated') };
    }

    if (user.value.email === email) {
      toast.error(t('toast.partner_invite_self'));
      return { error: new Error('Cannot invite yourself') };
    }

    sending.value = true;

    // Check if user already has a partner
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.value.id)
      .single();

    if (myProfile?.partner_id) {
      toast.error(t('toast.partner_already_connected'));
      sending.value = false;
      return { error: new Error('Already partnered') };
    }

    // Check for existing pending invitation to this email
    const { data: existing } = await supabase
      .from('couple_invitations')
      .select('id')
      .eq('sender_id', user.value.id)
      .eq('recipient_email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      toast.error(t('toast.partner_invite_pending'));
      sending.value = false;
      return { error: new Error('Invitation already pending') };
    }

    const { error } = await supabase.from('couple_invitations').insert({
      sender_id: user.value.id,
      recipient_email: email,
      status: 'pending',
    });

    if (!error) {
      cache.invalidate('invitations');
      await fetchInvitations();
      toast.success(t('toast.partner_invite_sent'));

      // Notify recipient via email (fire-and-forget)
      const edgeUrl = `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/send-couple-invite`;
      fetch(edgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.value.id,
          recipient_email: email,
        }),
      }).catch((e) => {
        console.warn('Failed to send notification email:', e);
      });
    } else {
      toast.error(t('toast.partner_invite_error'));
    }

    sending.value = false;
    return { error };
  };

  const acceptInvite = async (invitationId: string) => {
    loading.value = true;
    const { error } = await supabase.functions.invoke('accept-couple-invite', {
      body: { invitation_id: invitationId },
    });

    if (!error) {
      cache.invalidate(); // Clear all cache as profile changed
      await Promise.all([fetchPartner(), fetchInvitations()]);
      toast.success(t('toast.partner_connected'));
    } else {
      toast.error(t('toast.partner_connect_error'));
    }
    loading.value = false;
    return { error };
  };

  const rejectInvite = async (invitationId: string) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'rejected' })
      .eq('id', invitationId);

    if (!error) {
      cache.invalidate('invitations');
      await fetchInvitations();
      toast.success(t('toast.partner_invite_rejected'));
    }
    return { error };
  };

  const cancelInvite = async (invitationId: string) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    if (!error) {
      cache.invalidate('invitations');
      await fetchInvitations();
      toast.success(t('toast.partner_invite_cancelled'));
    }
    return { error };
  };

  const disconnectPartner = async () => {
    loading.value = true;
    const { error } = await supabase.functions.invoke('disconnect-partner');

    if (!error) {
      cache.invalidate();
      partner.value = null;
      toast.success(t('toast.partner_disconnected'));
    } else {
      toast.error(t('toast.partner_disconnect_error'));
    }
    loading.value = false;
    return { error };
  };

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
  };
};
