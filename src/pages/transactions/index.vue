<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 class="text-4xl font-bold tracking-tighter text-foreground">
          {{ $t('transactions.title') }}
        </h2>
        <p class="mt-1 font-medium text-muted-foreground">
          {{ filteredTransactions.length }} {{ $t('transactions.title').toLowerCase() }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          class="flex items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
          @click="router.push('/transactions/new')"
        >
          <AppIcon name="hugeicons:add-01" :size="18" />
          <span>{{ $t('topbar.add') }}</span>
        </Button>
      </div>
    </div>

    <!-- Transactions Table Card -->
    <div class="rounded-4xl border border-border/50 bg-card shadow-sm">
      <!-- Card Header -->
      <div class="flex items-center justify-between border-b border-border/50 p-6 md:p-8">
        <div>
          <h3 class="text-xl font-black tracking-tighter text-foreground">
            {{ $t('transactions.title') }}
          </h3>
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t('dashboard.latest_activity') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ $t('transactions.difference') }}
          </p>
          <div v-for="(total, cur) in balanceByCurrency" :key="cur">
            <p
              class="text-lg font-black tracking-tighter"
              :class="
                total >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ formatCurrency(total, cur) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Table Area -->
      <div class="p-0 md:p-0">
        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 md:px-6">
          <Select v-model="categoryFilter">
            <SelectTrigger class="h-8 w-44 rounded-xl text-xs font-medium">
              <SelectValue :placeholder="$t('transactions.all_categories')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                <span class="text-muted-foreground">{{ $t('transactions.all_categories') }}</span>
              </SelectItem>

              <SelectGroup>
                <SelectLabel
                  class="text-[11px] font-bold text-emerald-600 tracking-wider uppercase px-2 py-1.5"
                >
                  {{ $t('transactions.income') }}
                </SelectLabel>
                <SelectItem
                  v-for="cat in incomeCategories"
                  :key="cat.id"
                  :value="cat.id"
                  class="w-full"
                >
                  <div class="flex w-full items-center gap-2">
                    <div
                      class="size-2.5 shrink-0 rounded-full"
                      :style="{ backgroundColor: cat.color }"
                    />
                    <span class="truncate">{{ cat.name }}</span>
                    <span class="ml-auto text-xs font-bold text-muted-foreground/50">{{
                      categoryCounts[cat.id] || 0
                    }}</span>
                  </div>
                </SelectItem>
              </SelectGroup>

              <SelectSeparator class="mx-2 my-1" />

              <SelectGroup>
                <SelectLabel
                  class="text-[11px] font-bold text-rose-600 tracking-wider uppercase px-2 py-1.5"
                >
                  {{ $t('transactions.expense') }}
                </SelectLabel>
                <SelectItem
                  v-for="cat in expenseCategories"
                  :key="cat.id"
                  :value="cat.id"
                  class="w-full"
                >
                  <div class="flex w-full items-center gap-2">
                    <div
                      class="size-2.5 shrink-0 rounded-full"
                      :style="{ backgroundColor: cat.color }"
                    />
                    <span class="truncate">{{ cat.name }}</span>
                    <span class="ml-auto text-xs font-bold text-muted-foreground/50">{{
                      categoryCounts[cat.id] || 0
                    }}</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select v-if="isPartnered" v-model="ownerFilter">
            <SelectTrigger class="h-8 w-fit min-w-[100px] rounded-xl text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {{ $t('transactions.owner_filter_all') }}
              </SelectItem>
              <SelectItem value="mine">
                <div class="flex items-center gap-2">
                  <Avatar class="size-5">
                    <AvatarImage :src="user?.user_metadata?.avatar_url ?? ''" />
                    <AvatarFallback class="text-[9px]">
                      {{ user?.email?.charAt(0)?.toUpperCase() || 'S' }}
                    </AvatarFallback>
                  </Avatar>
                  {{ $t('transactions.owner_filter_mine') }}
                </div>
              </SelectItem>
              <SelectItem value="partner">
                <div class="flex items-center gap-2">
                  <Avatar class="size-5">
                    <AvatarImage :src="partner?.avatar_url ?? ''" />
                    <AvatarFallback class="text-[9px]">
                      {{ partnerInitial }}
                    </AvatarFallback>
                  </Avatar>
                  {{ partnerDisplayName || $t('transactions.owner_filter_partner') }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="sm"
                class="h-8 gap-1.5 rounded-xl border-border/50 text-xs font-medium"
                :class="
                  dateRange.start || dateRange.end
                    ? 'border-primary/30 text-primary'
                    : 'text-muted-foreground'
                "
              >
                <AppIcon name="hugeicons:calendar-01" :size="14" />
                <span v-if="dateRange.start || dateRange.end" class="hidden sm:inline">
                  {{ formatRangeLabel }}
                </span>
                <span v-else class="hidden sm:inline">{{
                  $t('transactions.select_date_range')
                }}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <RangeCalendar
                v-model="dateRange"
                :number-of-months="2"
                @update:model-value="onDateRangeChange"
              />
            </PopoverContent>
          </Popover>
        </div>

        <!-- Top bar: info + per page -->
        <div class="flex items-center justify-between border-b border-border/50 px-4 py-2 md:px-6">
          <p class="text-sm font-medium text-muted-foreground">
            <template v-if="totalCount > 0">
              {{
                $t('transactions.pagination', {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, totalCount),
                  total: totalCount,
                })
              }}
            </template>
            <template v-else>
              {{ totalCount }} {{ $t('transactions.title').toLowerCase() }}
            </template>
          </p>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-muted-foreground/60">{{
              $t('transactions.per_page')
            }}</span>
            <Select :model-value="pageSize" @update:model-value="pageSize = Number($event)">
              <SelectTrigger class="h-7 w-16 rounded-lg text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="n in [5, 10, 20, 50, 100]" :key="n" :value="n" class="text-xs">
                  {{ n }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3 p-6">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-2xl" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredTransactions.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
            <AppIcon name="hugeicons:inbox" :size="32" class="text-muted-foreground/30" />
          </div>
          <div>
            <p class="text-base font-black text-foreground tracking-tight">
              {{ $t('transactions.empty') }}
            </p>
            <p class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.empty_desc') }}
            </p>
          </div>
        </div>

        <!-- Table -->
        <div v-else>
          <Table>
            <TableHeader>
              <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <TableHead
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :style="{ width: header.getSize() !== 150 ? header.getSize() + 'px' : undefined }"
                  class="px-0"
                  :class="header.column.columnDef.meta?.headerClass"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                :data-state="row.getIsSelected() ? 'selected' : undefined"
                class="cursor-pointer hover:bg-muted/30 transition-colors"
                @click="viewTransaction(row.original.id)"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :style="{
                    width: cell.column.getSize() !== 150 ? cell.column.getSize() + 'px' : undefined,
                  }"
                  class="px-0"
                  :class="cell.column.columnDef.meta?.cellClass"
                >
                  <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <!-- Pagination -->
          <div class="flex items-center justify-center border-t border-border/50 px-4 py-4 md:px-6">
            <Pagination
              v-if="totalPages > 1"
              :total="totalCount"
              :items-per-page="pageSize"
              :page="currentPage"
              :sibling-count="1"
              :show-edges="true"
              @update:page="goToPage"
            >
              <PaginationFirst />
              <PaginationPrev />
              <PaginationContent v-slot="{ items }">
                <template
                  v-for="item in items"
                  :key="item.type === 'page' ? `p-${item.value}` : `e-${Math.random()}`"
                >
                  <PaginationItem
                    v-if="item.type === 'page'"
                    :value="item.value"
                    :is-active="item.value === currentPage"
                  >
                    <span class="text-xs font-bold">{{ item.value }}</span>
                  </PaginationItem>
                  <PaginationEllipsis v-else />
                </template>
              </PaginationContent>
              <PaginationNext />
              <PaginationLast />
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Floating bulk action bar -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-4 opacity-0"
  >
    <div
      v-if="table.getSelectedRowModel().rows.length > 0"
      class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div
        class="flex items-center gap-3 rounded-3xl border border-border/50 bg-card/95 px-5 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl"
      >
        <span class="mr-2 whitespace-nowrap text-sm font-bold text-muted-foreground">
          {{ $t('transactions.bulk_selected', { count: table.getSelectedRowModel().rows.length }) }}
        </span>

        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-2xl border-border/50 text-xs font-bold"
          @click="showBulkCategoryDialog = true"
        >
          <AppIcon name="hugeicons:folder-01" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_edit_category') }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-2xl border-border/50 text-xs font-bold"
          @click="showBulkAccountDialog = true"
        >
          <AppIcon name="hugeicons:bank" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_move_account') }}
        </Button>

        <div class="mx-1 h-8 w-px bg-border/50" />

        <Button
          variant="destructive"
          size="sm"
          class="h-9 rounded-2xl text-xs font-bold"
          @click="showBulkDeleteDialog = true"
        >
          <AppIcon name="hugeicons:delete-01" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_delete') }}
        </Button>
      </div>
    </div>
  </Transition>

  <!-- Bulk Edit Category Dialog -->
  <Dialog v-model:open="showBulkCategoryDialog">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('transactions.bulk_edit_category') }}</DialogTitle>
        <DialogDescription>
          {{ $t('transactions.bulk_selected', { count: table.getSelectedRowModel().rows.length }) }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <CategoryPicker v-model="bulkCategoryId" :placeholder="$t('transactions.category')" />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showBulkCategoryDialog = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button @click="applyBulkCategory">
          {{ $t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Bulk Move Account Dialog -->
  <Dialog v-model:open="showBulkAccountDialog">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('transactions.bulk_move_account') }}</DialogTitle>
        <DialogDescription>
          {{ $t('transactions.bulk_selected', { count: table.getSelectedRowModel().rows.length }) }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <Select v-model="bulkAccountId">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="$t('transactions.all_accounts')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id">
              <div class="flex items-center gap-2">
                <div class="size-3 rounded-full" :style="{ backgroundColor: acc.color }" />
                {{ acc.name }}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showBulkAccountDialog = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button @click="applyBulkAccount">
          {{ $t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Bulk Delete Confirmation -->
  <ConfirmDialog
    v-model:open="showBulkDeleteDialog"
    :title="
      $t('transactions.bulk_confirm_delete', { count: table.getSelectedRowModel().rows.length })
    "
    :description="$t('transactions.bulk_confirm_delete_desc')"
    :confirm-text="$t('transactions.bulk_delete')"
    variant="destructive"
    @confirm="applyBulkDelete"
  />
</template>

<script setup lang="ts">
import { h, type VNode, type Ref } from 'vue'
import {
  FlexRender,
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
} from '@tanstack/vue-table'
import type { RowData, SortingState } from '@tanstack/vue-table'
import type { DateRange } from 'reka-ui'
import { getLocalTimeZone } from '@internationalized/date'
import type { Transaction } from '@/composables/useTransactions'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AppIcon from '@/components/Icon.vue'

declare module '@tanstack/vue-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClass?: string
    cellClass?: string
  }
}

defineOptions({
  name: 'PagesTransactionsIndex',
})

const {
  transactions,
  loading,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  fetchTransactions,
  goToPage,
  bulkUpdateTransactions,
  bulkDeleteTransactions,
} = useTransactions()
const { fetchCategories } = useCategories()
const { partner, isPartnered, fetchPartner, partnerDisplayName } = usePartner()
const { accounts } = useAccounts()

const router = useRouter()
const { t } = useI18n()
const { formatCurrency, defaultCurrency } = useCurrency()
const { user, getSession } = useAuth()
const { categories } = useCategories()

const ownerFilter = ref<'all' | 'mine' | 'partner'>('all')
const sorting = ref<SortingState>([])
const categoryFilter = ref('')
const dateRange: Ref<DateRange> = shallowRef({ start: undefined, end: undefined } as DateRange)

const filteredTransactions = computed(() => {
  let all = transactions.value

  // Owner filter
  if (isPartnered.value && ownerFilter.value !== 'all') {
    all = all.filter((tx) =>
      ownerFilter.value === 'mine'
        ? tx.user_id === user.value?.id
        : tx.user_id === partner.value?.id,
    )
  }

  // Category filter
  if (categoryFilter.value && categoryFilter.value !== '__all__') {
    all = all.filter((tx) => tx.category_id === categoryFilter.value)
  }

  // Date range filter
  if (dateRange.value.start) {
    const startDate = dateRange.value.start.toDate(getLocalTimeZone())
    all = all.filter((tx) => new Date(tx.date) >= startDate)
  }
  if (dateRange.value.end) {
    const end = dateRange.value.end.toDate(getLocalTimeZone())
    end.setHours(23, 59, 59, 999)
    all = all.filter((tx) => new Date(tx.date) <= end)
  }

  return all
})

const formatRangeLabel = computed(() => {
  const start = dateRange.value.start
  const end = dateRange.value.end
  if (!start && !end) return ''
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  if (start && end) {
    const startDate = start.toDate(getLocalTimeZone())
    const endDate = end.toDate(getLocalTimeZone())
    const sameMonth =
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    if (sameMonth && startDate.getFullYear() === new Date().getFullYear()) {
      return `${startDate.toLocaleDateString('id-ID', opts)} – ${endDate.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })}`
    }
    return `${startDate.toLocaleDateString('id-ID', opts)} – ${endDate.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })}`
  }
  if (start)
    return start
      .toDate(getLocalTimeZone())
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  if (end)
    return end
      .toDate(getLocalTimeZone())
      .toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  return ''
})

const onDateRangeChange = () => {
  // Triggered when range calendar selection changes
}

const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'))
const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'))

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const tx of transactions.value) {
    if (tx.category_id) {
      counts[tx.category_id] = (counts[tx.category_id] || 0) + 1
    }
  }
  return counts
})

// Category helpers
function getCategoryColor(categoryId: string | null) {
  if (!categoryId) return null
  return categories.value.find((c) => c.id === categoryId)?.color ?? null
}

function getCategoryName(categoryId: string | null) {
  if (!categoryId) return null
  return categories.value.find((c) => c.id === categoryId)?.name ?? null
}

function getAccountName(accountId: string | null) {
  if (!accountId) return null
  return accounts.value.find((a) => a.id === accountId)?.name ?? null
}

function formatRowDate(date: string) {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)

  if (diff === 0) return t('transactions.today')
  if (diff === 1) return t('transactions.yesterday')
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

const partnerInitial = computed(() => partner.value?.display_name?.charAt(0)?.toUpperCase() || 'P')

// Bulk Dialogs
const showBulkCategoryDialog = ref(false)
const showBulkAccountDialog = ref(false)
const showBulkDeleteDialog = ref(false)
const bulkCategoryId = ref('')
const bulkAccountId = ref('')

function getSelectedIds() {
  return table.getSelectedRowModel().rows.map((r) => r.original.id)
}

const applyBulkCategory = async () => {
  if (!bulkCategoryId.value) return
  const ids = getSelectedIds()
  await bulkUpdateTransactions(ids, { category_id: bulkCategoryId.value })
  showBulkCategoryDialog.value = false
  bulkCategoryId.value = ''
  table.resetRowSelection()
}

const applyBulkAccount = async () => {
  if (!bulkAccountId.value) return
  const ids = getSelectedIds()
  await bulkUpdateTransactions(ids, { account_id: bulkAccountId.value })
  showBulkAccountDialog.value = false
  bulkAccountId.value = ''
  table.resetRowSelection()
}

const applyBulkDelete = async () => {
  const ids = getSelectedIds()
  showBulkDeleteDialog.value = false
  await bulkDeleteTransactions(ids)
  table.resetRowSelection()
}

const incomeByCurrency = computed(() => {
  const totals: Record<string, number> = {}
  for (const tx of filteredTransactions.value) {
    if (tx.type === 'income') {
      const cur = tx.currency || defaultCurrency.value
      totals[cur] = (totals[cur] || 0) + tx.amount
    }
  }
  return totals
})

const expenseByCurrency = computed(() => {
  const totals: Record<string, number> = {}
  for (const tx of filteredTransactions.value) {
    if (tx.type === 'expense') {
      const cur = tx.currency || defaultCurrency.value
      totals[cur] = (totals[cur] || 0) + tx.amount
    }
  }
  return totals
})

const balanceByCurrency = computed(() => {
  const totals: Record<string, number> = { ...incomeByCurrency.value }
  for (const [cur, total] of Object.entries(expenseByCurrency.value)) {
    totals[cur] = (totals[cur] || 0) - total
  }
  return totals
})

onMounted(async () => {
  await getSession()
  await Promise.all([fetchCategories(), fetchPartner(), fetchTransactions()])
})

watch(pageSize, () => {
  fetchTransactions()
})

const viewTransaction = (id: string) => {
  router.push(`/transactions/${id}/edit`)
}

// --- TanStack Table Columns ---
const columnHelper = createColumnHelper<Transaction>()

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        'onUpdate:checked': () => table.toggleAllRowsSelected(),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': () => {
          row.toggleSelected()
        },
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
        },
      }),
    enableSorting: false,
    size: 48,
    meta: {
      headerClass: 'pl-4 w-[48px]',
      cellClass: 'pl-4 w-[48px]',
    },
  }),
  columnHelper.accessor('date', {
    header: ({ column }) =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground transition-colors ' +
            (column.getIsSorted() ? 'text-foreground' : ''),
          onClick: () => column.toggleSorting(),
        },
        [
          t('transactions.date'),
          h(AppIcon, {
            name:
              column.getIsSorted() === 'asc' ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01',
            size: 14,
            class:
              'text-muted-foreground/40' + (column.getIsSorted() ? ' opacity-100' : ' opacity-0'),
          }),
        ],
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-sm font-medium text-muted-foreground' },
        formatRowDate(row.original.date),
      ),
    size: 100,
    meta: {
      headerClass: 'hidden lg:table-cell',
      cellClass: 'hidden lg:table-cell',
    },
  }),
  columnHelper.accessor('description', {
    header: () =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors',
        },
        t('transactions.description_label'),
      ),
    cell: ({ row }) => {
      const description = row.original.description || t('transactions.no_description')
      const accountName = getAccountName(row.original.account_id)
      const catName = getCategoryName(row.original.category_id)
      const catColor = getCategoryColor(row.original.category_id)
      const isPartnerTx = isPartnered.value && row.original.user_id === partner.value?.id

      const children: (VNode | false)[] = [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'truncate font-bold text-foreground' }, description),
          isPartnerTx &&
            h(
              'div',
              {
                class:
                  'flex size-4 shrink-0 items-center justify-center rounded-full bg-sidebar-accent',
                title: t('transactions.owned_by', { name: partnerDisplayName.value }),
              },
              [
                h(
                  'span',
                  { class: 'text-[8px] font-black text-sidebar-foreground' },
                  partnerInitial.value,
                ),
              ],
            ),
        ]),
      ]

      const subItems: VNode[] = []

      // Mobile-only: Date
      subItems.push(h('span', { class: 'lg:hidden' }, formatRowDate(row.original.date)))

      // Mobile-only: Account
      if (accountName) {
        subItems.push(
          h('span', { class: 'lg:hidden' }, [
            h('span', { class: 'mx-1 opacity-50' }, '·'),
            accountName,
          ]),
        )
      }

      // Mobile-only: Category
      if (catName) {
        subItems.push(
          h('span', { class: 'lg:hidden' }, [
            h('span', { class: 'mx-1 opacity-50' }, '·'),
            h('span', { style: { color: catColor || undefined } }, catName),
          ]),
        )
      }

      if (subItems.length > 0) {
        children.push(
          h(
            'div',
            {
              class:
                'flex items-center text-[11px] font-medium text-muted-foreground/60 mt-0.5 lg:hidden',
            },
            subItems,
          ),
        )
      }

      return h('div', { class: 'flex flex-col min-w-0 py-1' }, children)
    },
    size: 300,
    meta: {
      headerClass: 'pl-4 lg:pl-0',
      cellClass: 'pl-4 lg:pl-0',
    },
  }),
  columnHelper.display({
    id: 'attachment',
    header: () => null,
    cell: ({ row }) => {
      const tx = row.original
      if (!tx.image_url) return null
      return h('div', { class: 'flex justify-center' }, [
        h('img', {
          src: tx.image_url,
          class: 'size-7 rounded-lg object-cover border border-border/50',
          alt: '',
        }),
      ])
    },
    size: 36,
    meta: {
      headerClass: 'w-[36px]',
      cellClass: 'px-0',
    },
  }),
  columnHelper.accessor('category_id', {
    header: () =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors',
        },
        t('transactions.category'),
      ),
    cell: ({ row }) => {
      const catColor = getCategoryColor(row.original.category_id)
      const catName = getCategoryName(row.original.category_id) || '—'
      const bgColor = (catColor ?? '#6b7280') + '20'

      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'div',
          {
            class: 'flex size-6 items-center justify-center rounded-lg shrink-0',
            style: { backgroundColor: bgColor },
          },
          [
            h('div', {
              class: 'size-2 rounded-full',
              style: { backgroundColor: catColor ?? '#6b7280' },
            }),
          ],
        ),
        h('span', { class: 'truncate text-sm font-medium text-muted-foreground' }, catName),
      ])
    },
    size: 160,
    meta: {
      headerClass: 'hidden lg:table-cell',
      cellClass: 'hidden lg:table-cell',
    },
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap ml-auto hover:text-foreground transition-colors ' +
            (column.getIsSorted() ? 'text-foreground' : ''),
          onClick: () => column.toggleSorting(),
        },
        [
          t('transactions.amount'),
          h(AppIcon, {
            name:
              column.getIsSorted() === 'asc'
                ? 'hugeicons:arrow-up-01'
                : column.getIsSorted() === 'desc'
                  ? 'hugeicons:arrow-down-01'
                  : 'hugeicons:arrow-up-down',
            size: 14,
            class: 'text-muted-foreground/40',
          }),
        ],
      ),
    cell: ({ row }) => {
      const isIncome = row.original.type === 'income'
      const symbol = isIncome ? '+' : '-'
      const colorClass = isIncome ? 'text-emerald-600' : 'text-red-600'
      const amount = formatCurrency(Number(row.original.amount), row.original.currency || undefined)

      return h('div', { class: 'text-right' }, [
        h('p', { class: `text-base font-bold tabular-nums ${colorClass}` }, `${symbol}${amount}`),
        h(
          'p',
          {
            class: 'mt-0.5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider',
          },
          isIncome ? t('transactions.income') : t('transactions.expense'),
        ),
      ])
    },
    size: 140,
    meta: {
      headerClass: 'pr-4 lg:pr-0',
      cellClass: 'pr-4 lg:pr-0',
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(
          'button',
          {
            class:
              'flex size-9 items-center justify-center rounded-xl text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              router.push(`/transactions/${row.original.id}/edit`)
            },
          },
          [h(AppIcon, { name: 'hugeicons:pencil-edit-01', size: 18 })],
        ),
      ]),
    enableSorting: false,
    size: 60,
    meta: {
      headerClass: 'pr-4 w-[60px] hidden md:table-cell',
      cellClass: 'pr-4 w-[60px] hidden md:table-cell',
    },
  }),
]

const table = useVueTable({
  get data() {
    return filteredTransactions.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableRowSelection: true,
  enableMultiRowSelection: true,
  getRowId: (tx: Transaction) => tx.id,
  state: {
    rowSelection: {},
    get sorting() {
      return sorting.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
})
</script>
