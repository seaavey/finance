<template>
  <div
    class="mx-auto w-full max-w-2xl space-y-8 overflow-hidden px-4 pb-24 md:px-0 md:pb-8 lg:space-y-10 min-h-dvh"
  >
    <!-- LOADING STATE -->
    <div v-if="loading" class="space-y-8">
      <div
        class="flex flex-col items-center gap-4 rounded-3xl border border-border/50 bg-card/10 p-6 backdrop-blur-sm md:flex-row md:items-start md:gap-6 md:p-8"
      >
        <Skeleton class="size-20 rounded-full md:size-24" />
        <div class="space-y-3 text-center md:text-left">
          <Skeleton class="h-6 w-48 md:w-56" />
          <Skeleton class="h-4 w-36 md:w-44" />
        </div>
      </div>
      <div class="space-y-4">
        <Skeleton class="h-14 w-full rounded-2xl" />
        <Skeleton class="h-14 w-full rounded-2xl" />
        <Skeleton class="h-14 w-full rounded-2xl" />
      </div>
    </div>

    <div
      v-else
      class="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 lg:space-y-10"
    >
      <!-- PROFILE CARD -->
      <section
        class="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/20 p-6 backdrop-blur-md md:p-8"
      >
        <div class="absolute -right-12 -top-12 size-48 rounded-full bg-primary/5 blur-3xl" />
        <div class="absolute -left-12 -bottom-12 size-48 rounded-full bg-primary/5 blur-3xl" />

        <div class="relative flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-8">
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
            <h1 class="text-2xl font-black tracking-tight text-foreground md:text-3xl truncate">
              {{ profile.display_name || user?.user_metadata?.full_name }}
            </h1>
            <p class="mt-1 text-sm font-medium text-muted-foreground/80 truncate">
              {{ user?.email }}
            </p>
            <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <span
                class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
              >
                {{ isPartnered ? 'Couple Mode' : 'Personal Mode' }}
              </span>
              <span
                v-if="user?.app_metadata?.provider"
                class="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {{ user.app_metadata.provider }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- PREFERENCES -->
      <section>
        <h2 class="mb-4 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          {{ $t('settings.preferences') }}
        </h2>
        <div
          class="overflow-hidden rounded-3xl border border-border/50 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
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

      <!-- DATA -->
      <section>
        <h2 class="mb-4 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          {{ $t('settings.data') }}
        </h2>
        <div
          class="overflow-hidden rounded-3xl border border-border/50 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
        >
          <SettingsItem
            icon="download"
            :label="$t('settings.export')"
            :value="exportLabel"
            @click="exportData"
          />
        </div>
      </section>

      <!-- COUPLE -->
      <section>
        <h2 class="mb-4 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          {{ $t('sidebar.partner') }}
        </h2>

        <!-- LOADING: PASANGAN -->
        <div
          v-if="partnerLoading"
          class="flex w-full items-center justify-center rounded-3xl border border-border/50 bg-card/10 py-10 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
            />
            <span class="text-sm font-medium text-muted-foreground">{{ $t('settings.loading_partner') }}</span>
          </div>
        </div>
        <!-- NOT CONNECTED -->
        <div v-else-if="!isPartnered" class="space-y-4">
          <!-- Kirim Undangan -->
          <div
            class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25 md:p-6"
          >
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
              >
                <HugeiconsIcon :icon="MailSend01Icon" :size="20" />
              </div>
              <div>
                <p class="text-sm font-bold text-foreground">
                  {{ $t('settings.invite_partner_title') }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ $t('settings.invite_partner_desc') }}
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Input
                v-model="inviteEmail"
                type="email"
                :placeholder="$t('settings.invite_email_placeholder')"
                class="h-11 flex-1 rounded-xl bg-background/50"
                @keyup.enter="onSendInvite"
              />
              <Button
                size="lg"
                :disabled="partnerSending || !inviteEmail"
                class="h-11 rounded-xl shadow-lg shadow-primary/20"
                @click="onSendInvite"
              >
                {{ partnerSending ? $t('settings.inviting') : $t('settings.invite_button') }}
              </Button>
            </div>
          </div>

          <!-- Undangan Terkirim -->
          <div
            v-if="sentInvitations.length > 0"
            class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
          >
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              {{ $t('settings.sent_invitations_title') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="inv in sentInvitations"
                :key="inv.id"
                class="flex items-center justify-between rounded-2xl bg-card/40 px-4 py-3 border border-border/30"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50"
                  >
                    <HugeiconsIcon :icon="Mail01Icon" :size="18" class="text-muted-foreground" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-foreground">
                      {{ inv.recipient_email }}
                    </p>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {{ inv.status }}
                    </p>
                  </div>
                </div>
                <button
                  v-if="inv.status === 'pending'"
                  class="rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/20 active:scale-95"
                  @click="onCancelInvite(inv)"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>

          <!-- Undangan Masuk -->
          <div
            v-if="receivedInvitations.length > 0"
            class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25"
          >
            <p class="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              {{ $t('settings.received_invitations_title') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="inv in receivedInvitations"
                :key="inv.id"
                class="flex items-center justify-between rounded-2xl bg-card/40 px-4 py-3 border border-border/30"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <Avatar class="size-10 border border-border/30">
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
                    <p class="truncate text-sm font-semibold text-foreground">
                      {{ inv.sender?.display_name || 'Seseorang' }}
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
                    class="rounded-lg font-bold text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    @click="onRejectInvite(inv)"
                  >
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    class="rounded-lg font-bold shadow-md shadow-primary/10"
                    @click="onAcceptInvite(inv)"
                  >
                    Terima
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CONNECTED -->
        <div v-else class="space-y-4">
          <div
            class="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:bg-emerald-500/[0.06] md:p-6"
          >
            <div class="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/10 blur-2xl" />
            <div class="relative flex items-center gap-4">
              <Avatar class="size-14 border-2 border-emerald-500/20 shadow-lg md:size-16">
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
                <p class="truncate text-lg font-black text-emerald-600 md:text-xl">
                  {{ partnerDisplayName }}
                </p>
                <div class="mt-0.5 flex items-center gap-1.5">
                  <div class="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <p class="text-xs font-bold uppercase tracking-wider text-emerald-600/70">
                    {{ $t('settings.connected_status') }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            class="group flex w-full items-center justify-between rounded-3xl border border-red-500/20 bg-red-500/[0.03] px-5 py-4 transition-all duration-300 hover:bg-red-500/[0.08] active:scale-[0.99]"
            :disabled="partnerLoading"
            @click="onDisconnect"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex size-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-transform duration-300 group-hover:scale-110"
              >
                <HugeiconsIcon :icon="UnlinkIcon" :size="20" />
              </div>
              <div class="min-w-0 text-left">
                <p class="text-sm font-bold text-red-500 md:text-base">
                  {{ $t('settings.disconnect_title') }}
                </p>
                <p class="text-xs font-medium text-red-500/60 md:text-sm">
                  {{ $t('settings.disconnect_desc') }}
                </p>
              </div>
            </div>
            <HugeiconsIcon
              :icon="ArrowRight01Icon"
              :size="18"
              class="shrink-0 text-red-500/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-500/60"
            />
          </button>
        </div>
      </section>

      <!-- DANGER ZONE -->
      <section>
        <h2 class="mb-4 px-1 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
          {{ $t('settings.account') }}
        </h2>
        <div
          class="rounded-3xl border border-red-500/20 bg-red-500/[0.02] p-1.5 backdrop-blur-sm transition-all duration-300 hover:bg-red-500/[0.05]"
        >
          <button
            class="group flex w-full items-center justify-between rounded-[1.25rem] px-4 py-4 transition-all duration-300 hover:bg-red-500/5 active:scale-[0.99]"
            @click="onSignOut"
          >
            <div class="flex items-center gap-4">
              <div
                class="flex size-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 transition-transform duration-300 group-hover:scale-110"
              >
                <HugeiconsIcon :icon="Logout01Icon" :size="20" />
              </div>
              <div class="min-w-0 text-left">
                <p class="text-sm font-bold text-red-500 md:text-base">
                  {{ $t('settings.logout') }}
                </p>
                <p class="text-xs font-medium text-red-500/60 md:text-sm">
                  {{ $t('settings.logout_desc') }}
                </p>
              </div>
            </div>
            <HugeiconsIcon
              :icon="ArrowRight01Icon"
              :size="18"
              class="shrink-0 text-red-500/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-500/60"
            />
          </button>
        </div>
      </section>

      <div class="flex flex-col items-center gap-2 pb-8 opacity-40 md:pb-0">
        <p class="text-[10px] font-black uppercase tracking-[0.3em]">
          {{ $t('settings.version') }}
        </p>
        <p class="text-[9px] font-medium tracking-tighter italic text-primary/80">
          {{ $t('dashboard.made_with') }}
        </p>
      </div>
    </div>

    <Dialog v-model:open="editName">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ $t('settings.dialog_name_title') }}</DialogTitle>
          <DialogDescription class="sr-only">
            Update your display name
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <Input
            v-model="profile.display_name"
            :placeholder="$t('settings.name_placeholder')"
            autofocus
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="editName = false">{{
            $t('settings.cancel')
          }}</Button>
          <Button size="sm" :disabled="saving" @click="saveProfile">
            {{ saving ? $t('settings.saving') : $t('settings.save') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editCurrency">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ $t('settings.dialog_currency_title') }}</DialogTitle>
          <DialogDescription class="sr-only">
            Select your preferred currency
          </DialogDescription>
        </DialogHeader>
        <div class="max-h-64 overflow-y-auto py-2">
          <div v-for="group in currencyGroups" :key="group.label" class="mb-3 last:mb-0">
            <p
              class="sticky top-0 bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {{ group.label }}
            </p>
            <button
              v-for="c in group.currencies"
              :key="c.value"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              :class="profile.currency === c.value && 'bg-accent font-medium'"
              @click="selectCurrency(c.value)"
            >
              <span>{{ c.label }}</span>
              <HugeiconsIcon
                v-if="profile.currency === c.value"
                :icon="Tick01Icon"
                :size="16"
                class="text-primary"
              />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Logout01Icon,
  Tick01Icon,
  ArrowRight01Icon,
  Mail01Icon,
  UserIcon,
  UnlinkIcon,
  MailSend01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { useSupabase } from '~/lib/supabase';

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
  const map: Record<string, string> = { id: 'Indonesia', en: 'English' };
  return map[locale.value] ?? 'Indonesia';
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

const onAcceptInvite = async (inv: any) => {
  await acceptInvite(inv);
};

const onRejectInvite = async (inv: any) => {
  await rejectInvite(inv);
};

const onCancelInvite = async (inv: any) => {
  await cancelInvite(inv);
};

const confirmDisconnect = ref(false);

const onDisconnect = async () => {
  if (!confirmDisconnect.value) {
    confirmDisconnect.value = true;
    toast.info('Tekan sekali lagi untuk konfirmasi');
    setTimeout(() => {
      confirmDisconnect.value = false;
    }, 3000);
    return;
  }
  await disconnectPartner();
  confirmDisconnect.value = false;
};
</script>
