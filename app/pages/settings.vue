<template>
  <div class="mx-auto max-w-4xl space-y-10">
    <div v-if="loading" class="space-y-8">
      <div class="flex items-center gap-5">
        <Skeleton class="size-20 rounded-full" />
        <div class="space-y-2">
          <Skeleton class="h-5 w-48" />
          <Skeleton class="h-4 w-36" />
        </div>
      </div>
      <div class="space-y-4">
        <Skeleton class="h-14 w-full rounded-3xl" />
        <Skeleton class="h-14 w-full rounded-3xl" />
        <Skeleton class="h-14 w-full rounded-3xl" />
      </div>
    </div>

    <div v-else class="space-y-10">
      <!-- PROFILE HEADER -->
      <div class="flex items-center gap-5">
        <Avatar class="size-20">
          <AvatarImage v-if="user?.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user?.user_metadata?.full_name" />
          <AvatarFallback class="text-2xl font-bold">{{ user?.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
        </Avatar>
        <div>
          <h1 class="text-2xl font-bold">{{ profile.display_name || user?.user_metadata?.full_name }}</h1>
          <p class="mt-0.5 text-muted-foreground">{{ user?.email }}</p>
        </div>
      </div>

      <!-- PREFERENCES -->
      <section>
        <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Preferensi</p>
        <div class="rounded-3xl border border-border/50 bg-card/20">
          <SettingsItem icon="user" label="Nama Tampilan" :value="profile.display_name || 'Belum diatur'" @click="editName = true" />
          <div class="mx-4 border-t border-border/50" />
          <SettingsItem icon="currency" label="Mata Uang" :value="selectedCurrencyLabel" @click="editCurrency = true" />
          <div class="mx-4 border-t border-border/50" />
          <SettingsItem icon="palette" label="Tema" :value="themeLabel" @click="cycleTheme" />
        </div>
      </section>

      <!-- DATA -->
      <section>
        <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Data</p>
        <div class="rounded-3xl border border-border/50 bg-card/20">
          <SettingsItem icon="download" label="Export Data" value="CSV" @click="exportData" />
        </div>
      </section>

      <!-- DANGER ZONE -->
      <section>
        <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Akun</p>
        <div class="rounded-3xl border border-red-500/10 bg-red-500/[0.03] p-2">
          <button
            class="flex w-full items-center justify-between rounded-2xl px-4 py-4 transition hover:bg-red-500/[0.05]"
            @click="onSignOut"
          >
            <div class="flex items-center gap-4">
              <div class="flex size-11 items-center justify-center rounded-2xl bg-red-500/10">
                <HugeiconsIcon :icon="Logout01Icon" :size="20" class="text-red-400" />
              </div>
              <div class="text-left">
                <p class="font-medium text-red-400">Logout</p>
                <p class="text-sm text-muted-foreground">Keluar dari akun saat ini</p>
              </div>
            </div>
            <HugeiconsIcon :icon="ArrowRight01Icon" :size="18" class="text-muted-foreground/40" />
          </button>
        </div>
      </section>

      <p class="text-center text-xs text-muted-foreground/30">v1.0.0</p>
    </div>

    <Dialog v-model:open="editName">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nama Tampilan</DialogTitle>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <Input v-model="profile.display_name" placeholder="Nama kamu" autofocus />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" size="sm" @click="editName = false">Batal</Button>
          <Button size="sm" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editCurrency">
      <DialogContent class="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Mata Uang Default</DialogTitle>
        </DialogHeader>
        <div class="max-h-64 overflow-y-auto py-2">
          <div v-for="group in currencyGroups" :key="group.label" class="mb-3 last:mb-0">
            <p class="sticky top-0 bg-background px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{{ group.label }}</p>
            <button
              v-for="c in group.currencies"
              :key="c.value"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
              :class="profile.currency === c.value && 'bg-accent font-medium'"
              @click="selectCurrency(c.value)"
            >
              <span>{{ c.label }}</span>
              <HugeiconsIcon v-if="profile.currency === c.value" :icon="Tick01Icon" :size="16" class="text-primary" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Logout01Icon, Tick01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useSupabase } from '~/lib/supabase'

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
  const map: Record<string, string> = { light: 'Terang', dark: 'Gelap', system: 'Sistem' }
  return map[colorMode.preference] ?? 'Sistem'
})

const cycleTheme = () => {
  const modes = ['system', 'light', 'dark']
  const idx = modes.indexOf(colorMode.preference)
  colorMode.preference = modes[(idx + 1) % modes.length] || 'system'
}

onMounted(async () => {
  if (!user.value) { return }

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
  if (!user.value) { return }
  saving.value = true

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profile.display_name,
      currency: profile.currency,
    })
    .eq('id', user.value.id)

  if (!error) {
    toast.success('Profil berhasil disimpan')
  } else {
    toast.error('Gagal menyimpan profil')
  }
  saving.value = false
  editName.value = false
}

const selectCurrency = async (value: string) => {
  profile.currency = value
  editCurrency.value = false
  if (!user.value) { return }

  const { error } = await supabase
    .from('profiles')
    .update({ currency: value })
    .eq('id', user.value.id)

  if (!error) {
    toast.success('Mata uang diperbarui')
  } else {
    toast.error('Gagal memperbarui mata uang')
  }
}

const exportData = () => {
  toast.success('Fitur export segera hadir')
}

const onSignOut = async () => {
  await signOut()
}
</script>
