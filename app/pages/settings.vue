<template>
  <div class="mx-auto max-w-md space-y-6">
    <div v-if="loading" class="space-y-4">
      <div class="flex flex-col items-center gap-2 py-6">
        <Skeleton class="size-16 rounded-full" />
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-44" />
      </div>
      <Skeleton class="h-48 rounded-xl" />
      <Skeleton class="h-24 rounded-xl" />
    </div>

    <div v-else class="space-y-5">
      <div class="flex flex-col items-center gap-1.5 py-4">
        <Avatar class="size-16">
          <AvatarImage v-if="user?.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user?.user_metadata?.full_name" />
          <AvatarFallback class="text-xl font-bold">{{ user?.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
        </Avatar>
        <p class="text-base font-semibold">{{ profile.display_name || user?.user_metadata?.full_name }}</p>
        <p class="text-xs text-muted-foreground">{{ user?.email }}</p>
      </div>

      <Card>
        <CardContent class="divide-y divide-border p-0">
          <SettingsItem icon="user" :label="$t('settings.display_name')" :value="profile.display_name || $t('settings.not_set')" @click="editName = true" />
          <SettingsItem icon="currency" :label="$t('settings.currency')" :value="selectedCurrencyLabel" @click="editCurrency = true" />
          <SettingsItem icon="palette" :label="$t('settings.theme')" :value="themeLabel" @click="cycleTheme" />
        </CardContent>
      </Card>

      <Card>
        <CardContent class="divide-y divide-border p-0">
          <SettingsItem icon="download" :label="$t('settings.export_data')" value="CSV" @click="exportData" />
        </CardContent>
      </Card>

      <Card class="border-destructive/20">
        <CardContent class="p-0">
          <button class="flex w-full items-center gap-3 p-3.5 text-destructive active:bg-destructive/5" @click="onSignOut">
            <div class="flex size-8 items-center justify-center rounded-lg bg-destructive/10">
              <HugeiconsIcon :icon="Logout01Icon" :size="18" class="text-destructive" />
            </div>
            <span class="text-sm font-medium">{{ $t('settings.logout') }}</span>
          </button>
        </CardContent>
      </Card>

      <p class="text-center text-[11px] text-muted-foreground">{{ $t('settings.footer') }}</p>
    </div>

    <Dialog v-model:open="editName">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ $t('settings.display_name') }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <Input v-model="profile.display_name" :placeholder="$t('settings.name_placeholder')" autofocus />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="editName = false">{{ $t('common.cancel') }}</Button>
          <Button size="sm" :disabled="saving" @click="saveProfile">
            {{ saving ? $t('common.save_loading') : $t('common.save') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editCurrency">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{{ $t('settings.default_currency') }}</DialogTitle>
        </DialogHeader>
        <div class="max-h-64 overflow-y-auto py-2">
          <div v-for="group in currencyGroups" :key="group.label" class="mb-3 last:mb-0">
            <p class="sticky top-0 bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{{ getGroupLabel(group) }}</p>
            <button
              v-for="c in group.currencies"
              :key="c.value"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              :class="profile.currency === c.value && 'bg-accent font-medium'"
              @click="selectCurrency(c.value)"
            >
              <span>{{ $t('currencies.' + c.value) }}</span>
              <HugeiconsIcon v-if="profile.currency === c.value" :icon="Tick01Icon" :size="16" class="text-primary" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Logout01Icon, Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useSupabase } from '~/lib/supabase'

const { t } = useI18n()
const { toast } = useToast()
const supabase = useSupabase()
const { user, signOut } = useAuth()
const { currencies, currencyGroups } = useCurrency()
const colorMode = useColorMode()

const loading = ref(true)
const saving = ref(false)
const editName = ref(false)
const editCurrency = ref(false)

const profile = reactive({
  display_name: '',
  currency: 'IDR',
})

const selectedCurrencyLabel = computed(() => {
  const c = currencies.find(c => c.value === profile.currency)
  return c ? c.value : 'IDR'
})

const themeLabel = computed(() => {
  const map: Record<string, string> = { light: 'theme.light', dark: 'theme.dark', system: 'theme.system' }
  return t(map[colorMode.preference] ?? 'theme.system')
})

const getGroupLabel = (group: { label: string }) => {
  const map: Record<string, string> = {
    'Asia Tenggara': 'settings.group_southeast_asia',
    'Asia Timur': 'settings.group_east_asia',
    'Asia Selatan': 'settings.group_south_asia',
  }
  return t(map[group.label] ?? group.label)
}

const cycleTheme = () => {
  const modes = ['system', 'light', 'dark']
  const idx = modes.indexOf(colorMode.preference)
  colorMode.preference = modes[(idx + 1) % modes.length]
}

onMounted(async () => {
  if (!user.value) return

  const { data } = await supabase
    .from('profiles')
    .select('display_name, currency')
    .eq('id', user.value.id)
    .single()

  if (data) {
    profile.display_name = data.display_name ?? ''
    profile.currency = data.currency ?? 'IDR'
  }
  loading.value = false
})

const saveProfile = async () => {
  if (!user.value) return
  saving.value = true

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profile.display_name,
      currency: profile.currency,
    })
    .eq('id', user.value.id)

  if (!error) {
    toast.success(t('settings.saved'))
  } else {
    toast.error(t('settings.save_failed'))
  }
  saving.value = false
  editName.value = false
}

const selectCurrency = async (value: string) => {
  profile.currency = value
  editCurrency.value = false
  if (!user.value) return

  const { error } = await supabase
    .from('profiles')
    .update({ currency: value })
    .eq('id', user.value.id)

  if (!error) {
    toast.success(t('settings.currency_updated'))
  } else {
    toast.error(t('settings.currency_update_failed'))
  }
}

const exportData = () => {
  toast.success(t('settings.export_coming_soon'))
}

const onSignOut = async () => {
  await signOut()
}
</script>
