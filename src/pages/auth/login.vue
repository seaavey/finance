<template>
  <div class="flex min-h-items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <AppIcon name="hugeicons:wallet-01" :size="24" class="text-primary" />
          </div>
          <h1 class="font-heading text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ $t('auth.login_subtitle') }}
          </p>
        </div>

        <div class="mt-8">
          <Button class="w-full gap-2 rounded-xl" size="lg" @click="signInWithGoogle">
            <AppIcon name="hugeicons:google" :size="20" />
            {{ $t('auth.login_google') }}
          </Button>
        </div>

        <!-- Email/password login (for testing only) -->
        <div v-if="enableEmailAuth" class="mt-6">
          <Separator class="my-4" />
          <p class="mb-3 text-center text-xs text-muted-foreground">Email Login (Testing)</p>
          <form class="space-y-3" @submit.prevent="handleEmailLogin">
            <Input v-model="email" placeholder="Email" type="email" required />
            <Input v-model="password" placeholder="Password" type="password" required />
            <Button
              type="submit"
              variant="outline"
              class="w-full rounded-xl"
              size="lg"
              :disabled="emailLoading"
            >
              {{ emailLoading ? 'Logging in...' : 'Sign in with Email' }}
            </Button>
            <p v-if="emailError" class="text-center text-sm text-destructive">{{ emailError }}</p>
          </form>
        </div>
      </div>

      <p class="text-center">
        <router-link
          to="/"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ $t('auth.back') }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesAuthLogin',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const { signInWithGoogle, signInWithPassword, getSession, user, loading } = useAuth()
const router = useRouter()

const enableEmailAuth = import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true'
const email = ref('')
const password = ref('')
const emailLoading = ref(false)
const emailError = ref('')

const handleEmailLogin = async () => {
  emailLoading.value = true
  emailError.value = ''
  try {
    await signInWithPassword(email.value, password.value)
    await router.replace('/dashboard')
  } catch (e: unknown) {
    const err = e as { message?: string }
    emailError.value = err.message || 'Login failed'
  } finally {
    emailLoading.value = false
  }
}

const { t: tSeo } = useI18n()
useSeoMeta({
  title: tSeo('auth.login_title'),
  ogTitle: tSeo('auth.login_title'),
  description: tSeo('auth.login_subtitle'),
  ogDescription: tSeo('auth.login_subtitle'),
})

onMounted(async () => {
  await getSession()
  if (user.value) {
    await router.replace('/dashboard')
  }
})
</script>
