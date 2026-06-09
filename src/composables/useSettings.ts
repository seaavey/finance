import { useExport } from '@/composables/useExport'
import { useSupabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/vue-query'
import type { CoupleInvitation } from '@/types'

export function useSettings() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const supabase = useSupabase()
  const { user, signOut, getSession } = useAuth()
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
  } = usePartner()
  const { currencies, currencyGroups, defaultCurrency } = useCurrency()
  const colorMode = useColorMode()
  const { locale, setLocale, t } = useI18n()

  const loading = ref(true)
  const saving = ref(false)
  const editName = ref(false)
  const editCurrency = ref(false)
  const inviteEmail = ref('')
  const showDisconnectDialog = ref(false)

  const profile = reactive({
    display_name: '',
    currency: defaultCurrency.value,
  })

  const selectedCurrencyLabel = computed(() => {
    const c = currencies.value.find((c) => c.value === profile.currency)
    return c ? c.label : defaultCurrency.value
  })

  const localeLabel = computed(() => {
    const map: Record<string, string> = { id: t('settings.locale_id'), en: t('settings.locale_en') }
    return map[locale.value] ?? t('settings.locale_id')
  })

  const cycleLanguage = async () => {
    const locales = ['id', 'en']
    const idx = locales.indexOf(locale.value)
    await setLocale(locales[(idx + 1) % locales.length] || 'id')
  }

  const themeLabel = computed(() => {
    const map: Record<string, string> = {
      light: t('theme.light'),
      dark: t('theme.dark'),
      system: t('theme.system'),
    }
    return map[colorMode.preference] ?? t('theme.system')
  })

  const cycleTheme = () => {
    const modes = ['system', 'light', 'dark']
    const idx = modes.indexOf(colorMode.preference)
    colorMode.preference = modes[(idx + 1) % modes.length] || 'system'
  }

  const init = async () => {
    await getSession()
    if (!user.value) {
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('display_name, currency')
      .eq('id', user.value.id)
      .single()

    if (data) {
      profile.display_name = data.display_name ?? ''
      profile.currency = data.currency ?? defaultCurrency.value
    }
    loading.value = false

    // Fetch partner data
    await Promise.all([fetchPartner(), fetchInvitations()])
  }

  const saveProfile = async () => {
    if (!user.value) {
      return
    }
    saving.value = true

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        currency: profile.currency,
      })
      .eq('id', user.value.id)

    if (!error) {
      toast.success(t('settings.toast_saved'))
      queryClient.invalidateQueries({ queryKey: ['myProfile'] })
      loadCurrency()
    } else {
      toast.error(t('settings.toast_save_error'))
    }
    saving.value = false
    editName.value = false
  }

  const selectCurrency = async (value: string) => {
    profile.currency = value
    editCurrency.value = false
    if (!user.value) {
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ currency: value })
      .eq('id', user.value.id)

    if (!error) {
      toast.success(t('settings.toast_currency_updated'))
      loadCurrency()
    } else {
      toast.error(t('settings.toast_currency_error'))
    }
  }

  const { exportAllData, exporting } = useExport()
  const exportLabel = computed(() =>
    exporting.value ? t('settings.exporting') : t('settings.export'),
  )
  const exportData = () => {
    exportAllData()
  }

  const onSignOut = async () => {
    await signOut()
  }

  // === Couple handlers ===
  const onSendInvite = async () => {
    if (!inviteEmail.value) {
      return
    }
    const { error } = await sendInvite(inviteEmail.value)
    if (!error) {
      inviteEmail.value = ''
    }
  }

  const onAcceptInvite = async (inv: CoupleInvitation) => {
    await acceptInvite(inv.id)
  }

  const onRejectInvite = async (inv: CoupleInvitation) => {
    await rejectInvite(inv.id)
  }

  const onCancelInvite = async (inv: CoupleInvitation) => {
    await cancelInvite(inv.id)
  }

  const onConfirmDisconnect = async () => {
    showDisconnectDialog.value = false
    await disconnectPartner()
  }

  return {
    // State
    loading,
    saving,
    editName,
    editCurrency,
    inviteEmail,
    showDisconnectDialog,
    profile,

    // User & partner
    user,
    partner,
    isPartnered,
    partnerDisplayName,
    partnerLoading,
    partnerSending,
    sentInvitations,
    receivedInvitations,

    // Currency
    currencies,
    currencyGroups,
    defaultCurrency,

    // Computed labels
    selectedCurrencyLabel,
    localeLabel,
    themeLabel,

    // Theme & locale
    colorMode,
    cycleTheme,
    cycleLanguage,

    // Profile actions
    saveProfile,
    selectCurrency,

    // Export
    exportLabel,
    exportData,

    // Sign out
    onSignOut,

    // Partner actions
    onSendInvite,
    onAcceptInvite,
    onRejectInvite,
    onCancelInvite,
    onConfirmDisconnect,

    // Init
    init,
  }
}
