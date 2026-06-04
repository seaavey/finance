<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10"
      >
        <AppIcon
          name="hugeicons:loading-04"
          :size="24"
          class="text-primary animate-spin"
        />
      </div>
      <p class="text-sm text-muted-foreground">
        {{ $t('auth.authenticating') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/lib/supabase'

defineOptions({
  name: 'PagesAuthCallback',
})

const router = useRouter()
const supabase = useSupabase()

onMounted(async () => {
  // Handle the OAuth callback — Supabase PKCE tokens are in the URL hash.
  // Listen for auth state change and redirect accordingly.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await router.replace('/dashboard')
  } else {
    // If no session yet, wait for the auth state change event (PKCE flow
    // processes the code exchange asynchronously).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        await router.replace('/dashboard')
      }
    })

    // Timeout fallback — if nothing happens in 10s, go back to login
    setTimeout(async () => {
      subscription.unsubscribe()
      await router.replace('/auth/login')
    }, 10000)
  }
})
</script>
