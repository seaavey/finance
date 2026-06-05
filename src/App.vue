<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineAsyncComponent } from 'vue'

const DefaultLayout = defineAsyncComponent(() => import('./layouts/default.vue'))
const BlankLayout = defineAsyncComponent(() => import('./layouts/blank.vue'))
const AppToast = defineAsyncComponent(() => import('./components/AppToast.vue'))

const route = useRoute()
const { locale } = useI18n()

useHead({
  titleTemplate: '%s | Aemy Finance',
  htmlAttrs: {
    lang: locale,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#cf284e' },
  ],
})

const { bills, fetchBills } = useBills()
const { toast } = useToast()

const online = useOnline()

watch(online, (val) => {
  if (!val) {
    toast.error('Koneksi terputus — Beberapa data mungkin tidak tersedia.')
  } else {
    toast.info('Kembali online — Data terbaru telah dimuat.')
  }
})

onMounted(async () => {
  if (route.meta.layout === 'blank') return

  const { useAuth } = await import('@/composables/useAuth')
  const { formatDateSafe } = await import('@/lib/utils')
  const { user } = useAuth()

  watch(
    () => user.value,
    async (newUser) => {
      if (newUser) {
        await fetchBills()
        const today = formatDateSafe(new Date())
        const dueToday = bills.value.filter((b) => b.due_date === today && !b.is_paid)

        if (dueToday.length > 0) {
          toast.info(`You have ${dueToday.length} bill(s) due today!`)
        }
      }
    },
    { immediate: true },
  )
})

const layout = computed(() => {
  if (route.meta.layout === 'blank') {
    return BlankLayout
  }
  return DefaultLayout
})
</script>

<template>
  <!-- Offline notification banner -->
  <div
    v-if="!online"
    class="sticky top-0 z-50 bg-destructive text-destructive-foreground text-center text-sm py-1 px-3"
  >
    Kamu sedang offline — menampilkan data cache
  </div>
  <component :is="layout">
    <router-view />
  </component>
  <AppToast />
</template>
