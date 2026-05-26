import { useSupabase } from '~/lib/supabase';
import type { User } from '@supabase/supabase-js';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const partner = useState<PartnerProfile | null>('partner', () => null);
  const sentInvitations = useState<CoupleInvitation[]>('partner-sent-invites', () => []);
  const receivedInvitations = useState<CoupleInvitation[]>('partner-received-invites', () => []);
  const loading = useState('partner-loading', () => false);
  const sending = useState('partner-sending', () => false);

  const partnerId = computed(() => {
    // partner_id will be loaded from profiles table
    return null; // placeholder, set after fetch
  });

  const isPartnered = computed(() => partner.value !== null);

  const partnerDisplayName = computed(
    () => partner.value?.display_name || (partner.value ? 'Pasangan' : ''),
  );

  const fetchPartner = async () => {
    if (!user.value) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.value.id)
      .single();

    if (profile?.partner_id) {
      const { data: partnerData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, currency')
        .eq('id', profile.partner_id)
        .single();

      if (partnerData) {
        partner.value = partnerData as PartnerProfile;
      }
    } else {
      partner.value = null;
    }
  };

  const fetchInvitations = async () => {
    if (!user.value?.email) return;
    loading.value = true;

    const [sentResult, receivedResult] = await Promise.all([
      supabase
        .from('couple_invitations')
        .select('*')
        .eq('sender_id', user.value.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('couple_invitations')
        .select('*, sender:profiles(display_name, avatar_url)')
        .eq('recipient_email', user.value.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    if (!sentResult.error && sentResult.data) {
      sentInvitations.value = sentResult.data as CoupleInvitation[];
    }
    if (!receivedResult.error && receivedResult.data) {
      receivedInvitations.value = receivedResult.data as CoupleInvitation[];
    }

    loading.value = false;
  };

  const sendInvite = async (email: string) => {
    if (!user.value) {
      toast.error(t('toast.login_required'));
      return { error: new Error('Not authenticated') };
    }

    if (user.value.email === email) {
      toast.error('Tidak bisa mengundang diri sendiri');
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
      toast.error('Kamu sudah terhubung dengan pasangan');
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
      toast.error('Undangan sudah dikirim ke email ini');
      sending.value = false;
      return { error: new Error('Invitation already sent') };
    }

    const { error } = await supabase.from('couple_invitations').insert({
      sender_id: user.value.id,
      recipient_email: email,
    });

    if (!error) {
      await fetchInvitations();
      toast.success('Undangan berhasil dikirim');

      // Notify recipient via email (fire-and-forget)
      const config = useRuntimeConfig();
      const edgeUrl = `${config.public.supabaseUrl}/functions/v1/send-couple-invite`;
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
      toast.error('Gagal mengirim undangan');
    }

    sending.value = false;
    return { error };
  };

  const acceptInvite = async (invitation: CoupleInvitation) => {
    if (!user.value) {
      toast.error(t('toast.login_required'));
      return { error: new Error('Not authenticated') };
    }

    loading.value = true;

    const { data, error } = await supabase.rpc('accept_couple_invitation', {
      invitation_id: invitation.id,
    });

    if (error || (data as any)?.error) {
      const errorMsg = error?.message || (data as any)?.error;
      toast.error(errorMsg || 'Gagal menerima undangan');
      loading.value = false;
      return { error: new Error(errorMsg) };
    }

    await Promise.all([fetchPartner(), fetchInvitations()]);
    toast.success('Berhasil terhubung dengan pasangan!');
    loading.value = false;
    return { error: null };
  };

  const rejectInvite = async (invitation: CoupleInvitation) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'rejected' })
      .eq('id', invitation.id);

    if (!error) {
      await fetchInvitations();
      toast.success('Undangan ditolak');
    } else {
      toast.error('Gagal menolak undangan');
    }
    return { error };
  };

  const cancelInvite = async (invitation: CoupleInvitation) => {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitation.id);

    if (!error) {
      await fetchInvitations();
      toast.success('Undangan dibatalkan');
    } else {
      toast.error('Gagal membatalkan undangan');
    }
    return { error };
  };

  const disconnectPartner = async () => {
    if (!user.value || !partner.value) return;

    loading.value = true;
    const partnerId = partner.value.id;

    // Remove partner_id from both profiles
    const [myUpdate, partnerUpdate] = await Promise.all([
      supabase.from('profiles').update({ partner_id: null }).eq('id', user.value.id),
      supabase.from('profiles').update({ partner_id: null }).eq('id', partnerId),
    ]);

    if (myUpdate.error || partnerUpdate.error) {
      toast.error('Gagal memutuskan hubungan');
      loading.value = false;
      return { error: myUpdate.error || partnerUpdate.error };
    }

    partner.value = null;
    toast.success('Hubungan dengan pasangan diputuskan');
    loading.value = false;
    return { error: null };
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
