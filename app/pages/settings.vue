<template>
  <div class="space-y-6">
    <h2 class="text-xl font-bold">Setelan</h2>

    <div v-if="loading" class="space-y-4">
      <Card>
        <CardContent class="flex items-center gap-4 p-4">
          <Skeleton class="size-14 rounded-full" />
          <div class="space-y-2">
            <Skeleton class="h-4 w-36" />
            <Skeleton class="h-3 w-48" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="space-y-4 p-4">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-9 rounded-md" />
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-9 rounded-md" />
        </CardContent>
      </Card>
    </div>

    <div v-else class="space-y-6">
      <Card>
        <CardContent class="flex items-center gap-4 p-4">
          <Avatar class="size-14">
            <AvatarImage v-if="user?.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user?.user_metadata?.full_name" />
            <AvatarFallback class="text-lg font-bold">{{ user?.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="truncate text-base font-semibold">{{ user?.user_metadata?.full_name }}</p>
            <p class="truncate text-sm text-muted-foreground">{{ user?.email }}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-semibold">Profil</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="display-name">Nama Tampilan</Label>
            <div class="relative">
              <HugeiconsIcon :icon="UserIcon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="display-name" v-model="profile.display_name" placeholder="Nama kamu" class="pl-9" />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Mata Uang Default</Label>
            <Select v-model="profile.currency">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button class="w-full" @click="saveProfile" :disabled="saving">
        <HugeiconsIcon :icon="Tick01Icon" :size="18" />
        {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </Button>

      <Card class="border-destructive/20">
        <CardContent class="flex items-center justify-between p-4">
          <div>
            <p class="text-sm font-medium">Keluar</p>
            <p class="text-xs text-muted-foreground">Logout dari akun kamu</p>
          </div>
          <Button variant="destructive" size="sm" @click="onSignOut">
            <HugeiconsIcon :icon="Logout01Icon" :size="16" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserIcon, Tick01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useSupabase } from '~/lib/supabase'


const { toast } = useToast()
const supabase = useSupabase()
const { user, signOut } = useAuth()
const { currencies } = useCurrency()

const loading = ref(true)
const saving = ref(false)

const profile = reactive({
  display_name: '',
  currency: 'IDR',
})

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
    toast.success('Profil berhasil disimpan')
  } else {
    toast.error('Gagal menyimpan profil')
  }
  saving.value = false
}

const onSignOut = async () => {
  await signOut()
}
</script>
