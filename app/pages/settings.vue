<template>
  <div class="mx-auto w-full max-w-2xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div>
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ t('settings.account') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('settings.preferences') }}</p>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="space-y-6">
      <div class="h-48 w-full animate-pulse rounded-4xl bg-muted/50" />
      <div class="h-64 w-full animate-pulse rounded-4xl bg-muted/50" />
    </div>

    <div v-else class="space-y-8">
      <!-- PROFILE CARD -->
      <section
        class="relative overflow-hidden rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md md:p-8"
      >
        <div class="absolute -right-12 -top-12 size-48 rounded-full bg-primary/5 blur-3xl" />

        <div class="relative flex flex-col items-center gap-6 md:flex-row md:gap-8">
          <Avatar class="size-20 border-2 border-background shadow-xl md:size-24">
            <AvatarImage
              v-if="user?.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              :alt="user?.user_metadata?.full_name"
            />
            <AvatarFallback class="bg-primary/10 text-2xl font-black text-primary md:text-3xl">
              {{ (profile.display_name || user?.user_metadata?.full_name || '?').charAt(0) }}
            </AvatarFallback>
          </Avatar>

          <div class="min-w-0 flex-1 text-center md:text-left">
            <h2 class="text-2xl font-black tracking-tight text-foreground md:text-3xl truncate">
              {{ profile.display_name || user?.user_metadata?.full_name }}
            </h2>
            <p class="mt-1 text-sm font-medium text-muted-foreground/80 truncate">
              {{ user?.email }}
            </p>
            <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <span
                class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary"
              >
                {{ isPartnered ? $t('settings.couple_mode') : $t('settings.personal_mode') }}
              </span>
              <span
                v-if="user?.app_metadata?.provider"
                class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
              >
                {{ user.app_metadata.provider }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- PREFERENCES -->
      <section>
        <h3 class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {{ $t('settings.preferences') }}
        </h3>
        <div
          class="overflow-hidden rounded-4xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
        >
          <SettingsItem
            icon="user"
            :label="$t('settings.display_name')"
            :value="profile.display_name || $t('settings.not_set')"
            @click="editName = true"
          />
          <div class="mx-6 border-t border-border/40" />
          <SettingsItem
            icon="currency"
            :label="$t('settings.currency')"
            :value="selectedCurrencyLabel"
            @click="editCurrency = true"
          />
          <div class="mx-6 border-t border-border/40" />
          <SettingsItem
            icon="palette"
            :label="$t('settings.theme')"
            :value="themeLabel"
            @click="cycleTheme"
          />
          <div class="mx-6 border-t border-border/40" />
          <SettingsItem
            icon="language"
            :label="$t('settings.language')"
            :value="localeLabel"
            @click="cycleLanguage"
          />
        </div>
      </section>

      <!-- COUPLE -->
      <section>
        <h3 class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {{ $t('sidebar.partner') }}
        </h3>

        <!-- LOADING: PASANGAN -->
        <div
          v-if="partnerLoading"
          class="flex w-full items-center justify-center rounded-4xl border border-border/50 bg-card p-10 shadow-sm"
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
            />
            <span class="text-xs font-bold uppercase tracking-tight text-muted-foreground">{{
              $t('settings.loading_partner')
            }}</span>
          </div>
        </div>
        
        <!-- NOT CONNECTED -->
        <div v-else-if="!isPartnered" class="space-y-4">
          <!-- Kirim Undangan -->
          <div
            class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div class="mb-6 flex items-center gap-4">
              <div
                class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
              >
                <Icon name="hugeicons:mail-send-01" :size="24" />
              </div>
              <div>
                <p class="text-sm font-black text-foreground">
                  {{ $t('settings.invite_partner_title') }}
                </p>
                <p class="text-xs font-medium text-muted-foreground">
                  {{ $t('settings.invite_partner_desc') }}
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row">
              <Input
                v-model="inviteEmail"
                type="email"
                :placeholder="$t('settings.invite_email_placeholder')"
                class="h-11 flex-1 rounded-2xl bg-muted/30 border-border/50 focus:border-primary/50"
                @keyup.enter="onSendInvite"
              />
              <Button
                size="lg"
                :disabled="partnerSending || !inviteEmail"
                class="h-11 rounded-2xl bg-linear-to-b from-primary to-primary/90 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                @click="onSendInvite"
              >
                {{ partnerSending ? $t('settings.inviting') : $t('settings.invite_button') }}
              </Button>
            </div>
          </div>

          <!-- Undangan Terkirim -->
          <div
            v-if="sentInvitations.length > 0"
            class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm"
          >
            <p class="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {{ $t('settings.sent_invitations_title') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="inv in sentInvitations"
                :key="inv.id"
                class="flex items-center justify-between rounded-3xl border border-border/30 bg-muted/20 px-4 py-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted/50"
                  >
                    <Icon name="hugeicons:mail-01" :size="18" class="text-muted-foreground" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold text-foreground">
                      {{ inv.recipient_email }}
                    </p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-primary">
                      {{ inv.status }}
                    </p>
                  </div>
                </div>
                <Button
                  v-if="inv.status === 'pending'"
                  variant="ghost"
                  size="sm"
                  class="rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
                  @click="onCancelInvite(inv)"
                >
                  {{ $t('settings.cancel_invite') }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Undangan Masuk -->
          <div
            v-if="receivedInvitations.length > 0"
            class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm"
          >
            <p class="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {{ $t('settings.received_invitations_title') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="inv in receivedInvitations"
                :key="inv.id"
                class="flex items-center justify-between rounded-3xl border border-border/30 bg-muted/20 px-4 py-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <Avatar class="size-10 border-2 border-background shadow-sm">
                    <AvatarImage
                      v-if="inv.sender?.avatar_url"
                      :src="inv.sender.avatar_url"
                      :alt="inv.sender.display_name || ''"
                    />
                    <AvatarFallback class="bg-primary/10 text-xs font-black text-primary">
                      {{ (inv.sender?.display_name || '?').charAt(0) }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold text-foreground">
                      {{ inv.sender?.display_name || $t('settings.someone') }}
                    </p>
                    <p class="text-[10px] font-medium text-muted-foreground">
                      {{ $t('settings.invite_wants_to_connect') }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                    @click="onRejectInvite(inv)"
                  >
                    {{ $t('settings.reject') }}
                  </Button>
                  <Button
                    size="sm"
                    class="rounded-xl bg-primary px-4 font-bold text-white shadow-sm hover:bg-primary/90"
                    @click="onAcceptInvite(inv)"
                  >
                    {{ $t('settings.accept') }}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CONNECTED -->
        <div v-else class="space-y-4">
          <div
            class="relative overflow-hidden rounded-4xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 shadow-sm transition-all hover:bg-emerald-500/[0.05] md:p-8"
          >
            <div class="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div class="relative flex items-center gap-6">
              <Avatar class="size-16 border-2 border-background shadow-xl">
                <AvatarImage
                  v-if="partner?.avatar_url"
                  :src="partner.avatar_url"
                  :alt="partner.display_name || ''"
                />
                <AvatarFallback class="bg-emerald-500/10 text-xl font-black text-emerald-600">
                  {{ (partnerDisplayName || '?').charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="truncate text-xl font-black tracking-tight text-emerald-600 md:text-2xl">
                  {{ partnerDisplayName }}
                </p>
                <div class="mt-1 flex items-center gap-2">
                  <div class="size-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">
                    {{ $t('settings.connected_status') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            class="group w-full h-auto rounded-4xl border border-rose-500/20 bg-rose-500/[0.02] p-4 transition-all hover:bg-rose-500/5 hover:border-rose-500/40"
            @click="onDisconnect"
          >
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110"
                >
                  <Icon name="hugeicons:unlink-01" :size="22" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-sm font-black text-rose-500 md:text-base">
                    {{ $t('settings.disconnect_title') }}
                  </p>
                  <p class="text-[10px] font-bold uppercase tracking-tight text-rose-500/60">
                    {{ $t('settings.disconnect_desc') }}
                  </p>
                </div>
              </div>
              <Icon
                name="hugeicons:arrow-right-01"
                :size="20"
                class="shrink-0 text-rose-500/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rose-500/60"
              />
            </div>
          </Button>
        </div>
      </section>

      <!-- EXPORT DATA -->
      <section>
        <h3 class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {{ $t('settings.data') }}
        </h3>
        <div
          class="overflow-hidden rounded-4xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
        >
          <SettingsItem
            icon="download"
            :label="$t('settings.export')"
            :value="exportLabel"
            @click="exportData"
          />
        </div>
      </section>

      <!-- DANGER ZONE -->
      <section>
        <h3 class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-rose-500/60">
          {{ $t('settings.account') }}
        </h3>
        <div
          class="rounded-4xl border border-border/50 bg-card p-1.5 shadow-sm transition-all hover:shadow-md"
        >
          <Button 
            variant="ghost" 
            class="group w-full h-auto rounded-3xl p-4 transition-all hover:bg-rose-500/5"
            @click="onSignOut"
          >
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 transition-transform duration-300 group-hover:scale-110"
                >
                  <Icon name="hugeicons:logout-01" :size="22" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-sm font-black text-foreground md:text-base">
                    {{ $t('settings.logout') }}
                  </p>
                  <p class="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                    {{ $t('settings.logout_desc') }}
                  </p>
                </div>
              </div>
              <Icon
                name="hugeicons:arrow-right-01"
                :size="20"
                class="shrink-0 text-muted-foreground/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground/60"
              />
            </div>
          </Button>
        </div>
      </section>

      <div class="flex flex-col items-center gap-2 pb-8 opacity-40">
        <p class="text-[10px] font-black uppercase tracking-[0.3em]">
          {{ $t('settings.version') }}
        </p>
        <p class="text-[9px] font-medium tracking-tighter italic text-primary/80">
          {{ $t('dashboard.made_with') }}
        </p>
      </div>
    </div>

    <!-- DIALOGS -->
    <Dialog v-model:open="editName">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm rounded-4xl">
        <DialogHeader>
          <DialogTitle class="font-black tracking-tight">{{ $t('settings.dialog_name_title') }}</DialogTitle>
          <DialogDescription class="sr-only">{{ $t('settings.dialog_name_desc') }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-3 py-4">
          <Input
            v-model="profile.display_name"
            :placeholder="$t('settings.name_placeholder')"
            class="h-12 rounded-2xl bg-muted/30"
            autofocus
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="rounded-xl font-bold" @click="editName = false">
            {{ $t('settings.cancel') }}
          </Button>
          <Button class="rounded-xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20" :disabled="saving" @click="saveProfile">
            {{ saving ? $t('settings.saving') : $t('settings.save') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editCurrency">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm rounded-4xl">
        <DialogHeader>
          <DialogTitle class="font-black tracking-tight">{{ $t('settings.dialog_currency_title') }}</DialogTitle>
          <DialogDescription class="sr-only">{{ $t('settings.dialog_currency_desc') }}</DialogDescription>
        </DialogHeader>
        <div class="max-h-80 overflow-y-auto py-2 space-y-4">
          <div v-for="group in currencyGroups" :key="group.label">
            <p class="sticky top-0 bg-background/80 backdrop-blur-sm z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {{ group.label }}
            </p>
            <div class="mt-2 space-y-1 px-1">
              <Button
                v-for="c in group.currencies"
                :key="c.value"
                variant="ghost"
                class="w-full justify-between rounded-xl h-11 px-3 transition-all"
                :class="profile.currency === c.value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground/80'"
                @click="selectCurrency(c.value)"
              >
                <span class="text-sm">{{ c.label }}</span>
                <Icon
                  v-if="profile.currency === c.value"
                  name="hugeicons:tick-01"
                  :size="18"
                />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSupabase } from '~/lib/supabase';
import type { CoupleInvitation } from '~/composables/usePartner';

const { toast } = useToast();
const supabase = useSupabase();
const { user, signOut } = useAuth();
const {
  partner,
  sentInvitations,
  receivedInvitations,
  isPartnered,
  partnerDisplayName,
  loading: partnerLoading,
  sending: partnerSending,
  fetchPartner,
  fetchInvitations,
  sendInvite,
  acceptInvite,
  rejectInvite,
  cancelInvite,
  disconnectPartner,
} = usePartner();
const { currencies, currencyGroups } = useCurrency();
const colorMode = useColorMode();
const { locale, setLocale, t } = useI18n();

const loading = ref(true);
const saving = ref(false);
const editName = ref(false);
const editCurrency = ref(false);
const inviteEmail = ref('');

const profile = reactive({
  display_name: '',
  currency: 'IDR',
});

const selectedCurrencyLabel = computed(() => {
  const c = currencies.find((c) => c.value === profile.currency);
  return c ? c.label : 'IDR';
});

const localeLabel = computed(() => {
  const map: Record<string, string> = { id: t('settings.locale_id'), en: t('settings.locale_en') };
  return map[locale.value] ?? t('settings.locale_id');
});

const cycleLanguage = async () => {
  const locales = ['id', 'en'];
  const idx = locales.indexOf(locale.value);
  await setLocale(locales[(idx + 1) % locales.length]);
};

const themeLabel = computed(() => {
  const map: Record<string, string> = {
    light: t('theme.light'),
    dark: t('theme.dark'),
    system: t('theme.system'),
  };
  return map[colorMode.preference] ?? t('theme.system');
});

const cycleTheme = () => {
  const modes = ['system', 'light', 'dark'];
  const idx = modes.indexOf(colorMode.preference);
  colorMode.preference = modes[(idx + 1) % modes.length] || 'system';
};

onMounted(async () => {
  if (!user.value) {
    return;
  }

  const { data } = await supabase
    .from('profiles')
    .select('display_name, currency')
    .eq('id', user.value.id)
    .single();

  if (data) {
    profile.display_name = data.display_name ?? '';
    profile.currency = data.currency ?? 'IDR';
  }
  loading.value = false;

  // Fetch partner data
  await Promise.all([fetchPartner(), fetchInvitations()]);
});

const saveProfile = async () => {
  if (!user.value) {
    return;
  }
  saving.value = true;

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profile.display_name,
      currency: profile.currency,
    })
    .eq('id', user.value.id);

  if (!error) {
    toast.success(t('settings.toast_saved'));
  } else {
    toast.error(t('settings.toast_save_error'));
  }
  saving.value = false;
  editName.value = false;
};

const selectCurrency = async (value: string) => {
  profile.currency = value;
  editCurrency.value = false;
  if (!user.value) {
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ currency: value })
    .eq('id', user.value.id);

  if (!error) {
    toast.success(t('settings.toast_currency_updated'));
  } else {
    toast.error(t('settings.toast_currency_error'));
  }
};

const { exportAllData, exporting } = useExport();
const exportLabel = computed(() =>
  exporting.value ? t('settings.exporting') : t('settings.export'),
);
const exportData = () => {
  exportAllData();
};

const onSignOut = async () => {
  await signOut();
};

// === Couple handlers ===
const onSendInvite = async () => {
  if (!inviteEmail.value) {
    return;
  }
  const { error } = await sendInvite(inviteEmail.value);
  if (!error) {
    inviteEmail.value = '';
  }
};

const onAcceptInvite = async (inv: CoupleInvitation) => {
  await acceptInvite(inv);
};

const onRejectInvite = async (inv: CoupleInvitation) => {
  await rejectInvite(inv);
};

const onCancelInvite = async (inv: CoupleInvitation) => {
  await cancelInvite(inv);
};

const confirmDisconnect = ref(false);

const onDisconnect = async () => {
  if (!confirmDisconnect.value) {
    confirmDisconnect.value = true;
    toast.info(t('settings.disconnect_confirm'));
    setTimeout(() => {
      confirmDisconnect.value = false;
    }, 3000);
    return;
  }
  await disconnectPartner();
  confirmDisconnect.value = false;
};
</script>
