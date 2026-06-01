<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { defineAsyncComponent } from 'vue'

// Lazy load layouts — each is only needed in specific routes
const DefaultLayout = defineAsyncComponent(() => import('./layouts/default.vue'))
const BlankLayout = defineAsyncComponent(() => import('./layouts/blank.vue'))

const route = useRoute()
const { locale } = useI18n()

// Global SEO Configuration
useHead({
  titleTemplate: '%s | Aemy Finance',
  htmlAttrs: {
    lang: locale,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#cf284e' }
  ]
})

const { user } = useAuth()

// Defer bills + toast imports — only needed for authenticated users
watch(() => user.value, async (newUser) => {
  if (newUser) {
    const { useBills } = await import('@/composables/useBills')
    const { useToast } = await import('@/composables/useToast')
    const { bills, fetchBills } = useBills()
    const { toast } = useToast()
    await fetchBills()
    const today = new Date().toISOString().split('T')[0]
    const dueToday = bills.value.filter(b => b.due_date === today && !b.is_paid)

    if (dueToday.length > 0) {
      toast.info(`You have ${dueToday.length} bill(s) due today!`)
    }
  }
}, { immediate: true })

const layout = computed(() => {
  if (route.meta.layout === 'blank') {
    return BlankLayout
  }
  return DefaultLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
  <AppToast />
</template>
