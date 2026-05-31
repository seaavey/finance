<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div>
        <h2 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('activities.title') }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          {{ total }} aktivitas tercatat
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && logs.length === 0" class="space-y-4">
      <!-- Summary Cards Skeleton -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-28 rounded-3xl bg-muted/50" />
      </div>
      <!-- Filter Skeleton -->
      <Skeleton class="h-12 w-full rounded-2xl bg-muted/50 sm:w-96" />
      <!-- Activity Items Skeleton -->
      <div class="space-y-3">
        <div
          v-for="i in 6"
          :key="i"
          class="flex animate-pulse items-center gap-4 rounded-2xl border border-border/50 bg-card p-4"
        >
          <Skeleton class="size-10 shrink-0 rounded-xl bg-muted/50" />
          <div class="min-w-0 flex-1 space-y-2">
            <Skeleton class="h-4 w-48 rounded-md bg-muted/50" />
            <Skeleton class="h-3 w-24 rounded-md bg-muted/50" />
          </div>
          <Skeleton class="h-4 w-16 rounded-md bg-muted/50" />
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Icon name="hugeicons:note-01" :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {{ $t('activities.title') }}
              </p>
              <p class="text-xl font-black tracking-tighter text-foreground">{{ total }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 shadow-sm dark:text-sky-400">
              <Icon name="hugeicons:calendar-01" :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Hari Ini
              </p>
              <p class="text-xl font-black tracking-tighter text-foreground">{{ todayCount }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400">
              <Icon name="hugeicons:arrow-left-right" :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Transaksi
              </p>
              <p class="text-xl font-black tracking-tighter text-foreground">{{ transactionCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (only when no activities at all) -->
      <div
        v-if="logs.length === 0 && !loading"
        class="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
          <Icon name="hugeicons:note-01" :size="32" class="text-muted-foreground/30" />
        </div>
        <div>
          <p class="text-base font-black text-foreground tracking-tight">
            {{ $t('activities.empty') }}
          </p>
          <p class="mt-1 text-sm font-medium text-muted-foreground">
            Mulai catat transaksi atau buat kategori untuk melihat aktivitas
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Filter Tabs -->
        <div class="mb-6 flex flex-wrap gap-2">
          <div class="flex w-fit gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md">
            <Button
              v-for="tab in filterTabs"
              :key="tab.value"
              :variant="activeTab === tab.value ? 'default' : 'ghost'"
              size="sm"
              class="rounded-xl px-4 text-xs font-bold transition-all"
              :class="activeTab === tab.value ? 'shadow-sm' : 'text-muted-foreground'"
              @click="activeTab = tab.value; applyFilters()"
            >
              <Icon v-if="tab.icon" :name="tab.icon" :size="14" class="mr-1.5" />
              {{ tab.label }}
            </Button>
          </div>

          <!-- Quick action filters -->
          <div class="flex w-fit gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md">
            <Button
              :variant="filterAction === '' ? 'default' : 'ghost'"
              size="sm"
              class="rounded-xl px-3 text-xs font-bold transition-all"
              :class="filterAction === '' ? 'shadow-sm' : 'text-muted-foreground'"
              @click="filterAction = ''; applyFilters()"
            >
              Semua
            </Button>
            <Button
              :variant="filterAction === 'created' ? 'default' : 'ghost'"
              size="sm"
              class="rounded-xl px-3 text-xs font-bold transition-all"
              :class="filterAction === 'created' ? 'shadow-sm' : 'text-muted-foreground'"
              @click="filterAction = 'created'; applyFilters()"
            >
              <Icon name="hugeicons:add-01" :size="14" class="mr-1" />
              Baru
            </Button>
            <Button
              :variant="filterAction === 'deleted' ? 'default' : 'ghost'"
              size="sm"
              class="rounded-xl px-3 text-xs font-bold transition-all"
              :class="filterAction === 'deleted' ? 'shadow-sm' : 'text-muted-foreground'"
              @click="filterAction = 'deleted'; applyFilters()"
            >
              <Icon name="hugeicons:delete-01" :size="14" class="mr-1" />
              Hapus
            </Button>
          </div>
        </div>

        <!-- Activity Feed Bento Card -->
        <div class="rounded-4xl border border-border/50 bg-card shadow-sm">
          <!-- Feed Header -->
          <div class="flex items-center justify-between border-b border-border/50 p-6 md:p-8">
            <div>
              <h3 class="text-xl font-black tracking-tighter text-foreground">
                {{ $t('activities.title') }}
              </h3>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('dashboard.latest_activity') }}
              </p>
            </div>
            <div v-if="loading" class="text-xs text-muted-foreground/60">
              Memuat...
            </div>
          </div>

          <div class="p-4 md:p-6">
            <!-- Loading Overlay (for refresh) -->
            <div v-if="loading && logs.length > 0" class="space-y-3">
              <div
                v-for="i in 4"
                :key="i"
                class="flex animate-pulse items-center gap-4 rounded-2xl border border-border/50 p-4"
              >
                <Skeleton class="size-10 shrink-0 rounded-xl bg-muted/50" />
                <div class="min-w-0 flex-1 space-y-2">
                  <Skeleton class="h-4 w-48 rounded-md bg-muted/50" />
                  <Skeleton class="h-3 w-24 rounded-md bg-muted/50" />
                </div>
                <Skeleton class="h-4 w-16 rounded-md bg-muted/50" />
              </div>
            </div>

            <!-- Grouped Timeline -->
            <div v-else-if="groupedLogs.length > 0" class="space-y-8">
              <div v-for="group in groupedLogs" :key="group.date" class="space-y-2">
                <!-- Date Header -->
                <div class="flex items-center gap-4 px-2">
                  <span class="whitespace-nowrap text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    {{ group.label }}
                  </span>
                  <div class="h-px w-full bg-border/40" />
                </div>

                <!-- Activity Items -->
                <div class="relative space-y-1">
                  <!-- Timeline Line -->
                  <div class="absolute bottom-0 left-[23px] top-3 w-px bg-border/40" />

                  <div
                    v-for="log in group.items"
                    :key="log.id"
                    class="group relative flex items-start gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-muted/30"
                  >
                    <!-- Timeline Dot -->
                    <div
                      class="relative z-10 mt-1 flex size-[14px] shrink-0 items-center justify-center"
                    >
                      <div
                        class="size-[14px] rounded-full border-2"
                        :class="getDotClass(log.action)"
                      />
                    </div>

                    <!-- Icon Badge -->
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-xl"
                      :class="getBadgeClass(log.entity_type)"
                    >
                      <Icon
                        :name="getActivityIcon(log.entity_type, log.action)"
                        :size="16"
                      />
                    </div>

                    <!-- Content -->
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-foreground">
                        {{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}
                      </p>
                      <p class="mt-0.5 text-xs font-medium text-muted-foreground/60">
                        {{ formatTime(log.created_at) }}
                      </p>
                    </div>

                    <!-- Action Badge -->
                    <span
                      class="shrink-0 self-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      :class="getActionBadgeClass(log.action)"
                    >
                      {{ log.action }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty within feed (filtered) -->
            <div
              v-else
              class="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
                <Icon name="hugeicons:search-01" :size="32" class="text-muted-foreground/30" />
              </div>
              <div>
                <p class="text-sm font-bold text-muted-foreground">Tidak ada hasil untuk filter ini</p>
                <p class="mt-1 text-xs font-medium text-muted-foreground/60">Coba ubah filter atau reset</p>
              </div>
            </div>

            <!-- Load More -->
            <div v-if="hasMore" class="flex justify-center pt-6 pb-4">
              <Button
                variant="outline"
                class="rounded-2xl px-8 font-bold"
                :disabled="loadingMore"
                @click="loadMore"
              >
                <Icon v-if="loadingMore" name="hugeicons:loading-01" :size="16" class="mr-2 animate-spin" />
                <Icon v-else name="hugeicons:arrow-down-01" :size="16" class="mr-2" />
                {{ $t('activities.load_more') }}
              </Button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { EntityType, ActionType } from '@/composables/useActivityLog'

const { logs, loading, total, fetchAll } = useActivityLog()

const activeTab = ref<string>('all')
const filterAction = ref<string>('')
const currentPage = ref(1)
const loadingMore = ref(false)

const pageSize = 50
const hasMore = computed(() => logs.value.length < total.value)

const filterTabs = [
  { value: 'all', label: 'Semua', icon: 'hugeicons:note-01' },
  { value: 'auth', label: 'Auth', icon: 'hugeicons:user' },
  { value: 'transaction', label: 'Transaksi', icon: 'hugeicons:arrow-left-right' },
  { value: 'category', label: 'Kategori', icon: 'hugeicons:grid-view' },
  { value: 'budget', label: 'Budget', icon: 'hugeicons:wallet-03' },
  { value: 'goal', label: 'Goal', icon: 'hugeicons:target-02' },
  { value: 'bill', label: 'Tagihan', icon: 'hugeicons:calendar-03' },
  { value: 'account', label: 'Akun', icon: 'hugeicons:bank' },
  { value: 'recurring', label: 'Rutin', icon: 'hugeicons:repeat' },
  { value: 'partner', label: 'Partner', icon: 'hugeicons:user' },
]

const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return logs.value.filter(l => l.created_at.startsWith(today)).length
})

const transactionCount = computed(() => {
  return logs.value.filter(l => l.entity_type === 'transaction').length
})

interface LogGroup {
  date: string
  label: string
  items: typeof logs.value
}

const groupedLogs = computed(() => {
  const groups: Record<string, typeof logs.value> = {}
  for (const log of logs.value) {
    const date = log.created_at.slice(0, 10)
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
  }
  return Object.entries(groups).map(([date, items]) => ({
    date,
    label: formatGroupLabel(date),
    items,
  }))
})

const formatGroupLabel = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hari Ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

const getActivityIcon = (entityType: EntityType, action: ActionType): string => {
  const icons: Record<string, string> = {
    'auth.login': 'hugeicons:user',
    'auth.logout': 'hugeicons:logout-01',
    'transaction.created': 'hugeicons:arrow-left-right',
    'transaction.updated': 'hugeicons:edit-01',
    'transaction.deleted': 'hugeicons:delete-01',
    'category.created': 'hugeicons:grid-view',
    'category.updated': 'hugeicons:edit-01',
    'category.deleted': 'hugeicons:delete-01',
    'budget.created': 'hugeicons:wallet-03',
    'budget.updated': 'hugeicons:edit-01',
    'budget.deleted': 'hugeicons:delete-01',
    'goal.created': 'hugeicons:target-02',
    'goal.updated': 'hugeicons:edit-01',
    'goal.deleted': 'hugeicons:delete-01',
    'bill.created': 'hugeicons:calendar-03',
    'bill.updated': 'hugeicons:edit-01',
    'bill.deleted': 'hugeicons:delete-01',
    'account.created': 'hugeicons:bank',
    'account.updated': 'hugeicons:edit-01',
    'account.deleted': 'hugeicons:delete-01',
    'recurring.created': 'hugeicons:repeat',
    'recurring.updated': 'hugeicons:edit-01',
    'recurring.deleted': 'hugeicons:delete-01',
    'partner.connected': 'hugeicons:user',
    'partner.disconnected': 'hugeicons:user',
  }
  return icons[`${entityType}.${action}`] || 'hugeicons:note-01'
}

const getDotClass = (action: ActionType): string => {
  if (action === 'created' || action === 'login' || action === 'connected') {
    return 'border-emerald-500 bg-emerald-500'
  }
  if (action === 'deleted' || action === 'logout' || action === 'disconnected') {
    return 'border-rose-400 bg-rose-400'
  }
  return 'border-amber-400 bg-amber-400'
}

const getBadgeClass = (entityType: EntityType): string => {
  const classes: Record<string, string> = {
    auth: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    transaction: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    category: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    budget: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    goal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    bill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    account: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    recurring: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    partner: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }
  return classes[entityType] || 'bg-muted/50 text-muted-foreground'
}

const getActionBadgeClass = (action: ActionType): string => {
  if (action === 'created' || action === 'login' || action === 'connected') {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  }
  if (action === 'deleted' || action === 'logout' || action === 'disconnected') {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  }
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins}m lalu`
  if (diffHours < 24) return `${diffHours}j lalu`
  if (diffDays < 7) return `${diffDays}h lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

const applyFilters = () => {
  currentPage.value = 1
  fetchAll({
    page: 1,
    limit: pageSize,
    entityType: (activeTab.value !== 'all' ? activeTab.value as EntityType : undefined),
    action: (filterAction.value as ActionType) || undefined,
  })
}

const loadMore = async () => {
  loadingMore.value = true
  currentPage.value++
  await fetchAll({
    page: currentPage.value,
    limit: pageSize,
    entityType: (activeTab.value !== 'all' ? activeTab.value as EntityType : undefined),
    action: (filterAction.value as ActionType) || undefined,
  })
  loadingMore.value = false
}

applyFilters()
</script>
