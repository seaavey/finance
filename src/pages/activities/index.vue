<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">{{ $t('activities.title') }}</h1>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <select
        v-model="filterEntity"
        class="rounded-xl border border-border/40 bg-card px-3 py-2 text-sm"
        @change="applyFilters"
      >
        <option value="">{{ $t('activities.filter_entity') }}</option>
        <option value="auth">Auth</option>
        <option value="transaction">Transaction</option>
        <option value="category">Category</option>
        <option value="budget">Budget</option>
        <option value="goal">Goal</option>
        <option value="bill">Bill</option>
        <option value="account">Account</option>
        <option value="recurring">Recurring</option>
        <option value="partner">Partner</option>
      </select>

      <select
        v-model="filterAction"
        class="rounded-xl border border-border/40 bg-card px-3 py-2 text-sm"
        @change="applyFilters"
      >
        <option value="">{{ $t('activities.filter_action') }}</option>
        <option value="created">Created</option>
        <option value="updated">Updated</option>
        <option value="deleted">Deleted</option>
        <option value="login">Login</option>
        <option value="logout">Logout</option>
        <option value="connected">Connected</option>
        <option value="disconnected">Disconnected</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in 10"
        :key="i"
        class="h-14 animate-pulse rounded-xl bg-muted/30"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="logs.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <Icon name="hugeicons:timeline-01" :size="48" class="text-muted-foreground/30" />
      <p class="mt-4 text-sm text-muted-foreground">{{ $t('activities.empty') }}</p>
    </div>

    <!-- Activity List -->
    <div v-else class="space-y-1">
      <div
        v-for="log in logs"
        :key="log.id"
        class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/30"
      >
        <Icon
          :name="getActivityIcon(log.entity_type, log.action)"
          :size="18"
          class="shrink-0 text-muted-foreground/60"
        />
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            {{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}
          </p>
        </div>
        <time class="shrink-0 text-xs text-muted-foreground/60">
          {{ formatTime(log.created_at) }}
        </time>
      </div>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="flex justify-center py-4">
      <Button variant="outline" :disabled="loadingMore" @click="loadMore">
        {{ $t('activities.load_more') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { EntityType, ActionType } from '@/composables/useActivityLog'

const { logs, loading, total, fetchAll } = useActivityLog()

const filterEntity = ref('')
const filterAction = ref('')
const currentPage = ref(1)
const loadingMore = ref(false)

const pageSize = 50
const hasMore = computed(() => logs.value.length < total.value)

const getActivityIcon = (entityType: EntityType, action: ActionType): string => {
  const icons: Record<string, string> = {
    'auth.login': 'hugeicons:login-01',
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
  return icons[`${entityType}.${action}`] || 'hugeicons:timeline-01'
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
    entityType: (filterEntity.value as EntityType) || undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
}

const loadMore = async () => {
  loadingMore.value = true
  currentPage.value++
  await fetchAll({
    page: currentPage.value,
    limit: pageSize,
    entityType: (filterEntity.value as EntityType) || undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
  loadingMore.value = false
}

// Initial fetch
applyFilters()
</script>
