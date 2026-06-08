<template>
  <div class="mx-auto w-full space-y-5 md:space-y-8">
    <!-- HEADER -->
    <div class="text-center md:text-left">
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ isEdit ? $t('transaction_form.title_edit') : $t('transaction_form.title_new') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ isEdit ? $t('transaction_form.subtitle_edit') : $t('transaction_form.subtitle') }}
      </p>
    </div>

    <!-- TYPE SELECTOR -->
    <div class="grid grid-cols-3 gap-3 md:gap-4">
      <Button
        variant="ghost"
        class="group relative h-auto flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
        :class="
          form.type === 'income'
            ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 border-emerald-500'
            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'
        "
        @click="form.type = 'income'"
      >
        <div
          class="flex size-10 md:size-12 items-center justify-center rounded-2xl transition-colors"
          :class="
            form.type === 'income'
              ? 'bg-white/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          "
        >
          <AppIcon name="hugeicons:arrow-down-01" :size="28" />
        </div>
        <span class="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">{{
          $t('transaction_form.income')
        }}</span>
      </Button>

      <Button
        variant="ghost"
        class="group relative h-auto flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
        :class="
          form.type === 'expense'
            ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 border-rose-500'
            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'
        "
        @click="form.type = 'expense'"
      >
        <div
          class="flex size-10 md:size-12 items-center justify-center rounded-2xl transition-colors"
          :class="
            form.type === 'expense'
              ? 'bg-white/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          "
        >
          <AppIcon name="hugeicons:arrow-up-01" :size="28" />
        </div>
        <span class="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">{{
          $t('transaction_form.expense')
        }}</span>
      </Button>

      <Button
        variant="ghost"
        class="group relative h-auto flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
        :class="
          form.type === 'transfer'
            ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20 border-blue-500'
            : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'
        "
        @click="form.type = 'transfer'"
      >
        <div
          class="flex size-10 md:size-12 items-center justify-center rounded-2xl transition-colors"
          :class="
            form.type === 'transfer'
              ? 'bg-white/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          "
        >
          <AppIcon name="hugeicons:exchange-01" :size="28" />
        </div>
        <span class="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">{{
          $t('transaction_form.transfer')
        }}</span>
      </Button>
    </div>

    <!-- SCAN RECEIPT BUTTON -->
    <div v-if="form.type !== 'transfer'" class="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="group relative h-12 w-full rounded-2xl border-dashed border-border/50 bg-transparent font-black uppercase tracking-widest text-xs transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
            :disabled="uploading || scanning"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20"
              >
                <AppIcon
                  :name="scanning ? 'hugeicons:loading-03' : 'hugeicons:camera-01'"
                  :size="16"
                  :class="scanning ? 'animate-spin' : ''"
                />
              </div>
              <span>{{
                scanning ? $t('transaction_form.scanning') : $t('transaction_form.scan_receipt')
              }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" class="min-w-48 p-2">
          <DropdownMenuItem
            class="rounded-xl px-3 py-2.5 cursor-pointer"
            @select.prevent="cameraDialogOpen = true"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <AppIcon name="hugeicons:camera-01" :size="16" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold">{{ $t('transaction_form.scan_camera') }}</span>
                <span class="text-xs text-muted-foreground">{{
                  $t('transaction_form.scan_camera_desc')
                }}</span>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            class="rounded-xl px-3 py-2.5 cursor-pointer"
            @select.prevent="fileInputRef?.click()"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <AppIcon name="hugeicons:folder-01" :size="16" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold">{{ $t('transaction_form.scan_gallery') }}</span>
                <span class="text-xs text-muted-foreground">{{
                  $t('transaction_form.scan_gallery_desc')
                }}</span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Camera capture dialog -->
      <CameraCapture v-model:open="cameraDialogOpen" @captured="onCameraCaptured" />
    </div>

    <!-- AMOUNT CARD -->
    <div
      class="relative overflow-hidden rounded-3xl md:rounded-4xl border border-border/50 bg-card/20 p-5 md:p-8 backdrop-blur-md shadow-2xl transition-all hover:border-border/80"
    >
      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
        $t('transaction_form.amount')
      }}</Label>
      <div class="mt-3 md:mt-4 flex items-center gap-3 md:gap-4">
        <div
          class="flex h-11 md:h-14 items-center justify-center rounded-xl md:rounded-2xl bg-muted/50 px-4 md:px-5 text-base md:text-xl font-black text-foreground shadow-inner"
        >
          {{ form.currency }}
        </div>
        <CurrencyInput
          v-model="form.amount"
          :currency="form.currency"
          :placeholder="$t('transaction_form.amount_placeholder')"
          class="w-full border-none bg-transparent text-4xl md:text-6xl font-black tracking-tighter text-foreground outline-none placeholder:text-muted-foreground/20 shadow-none focus-visible:ring-0"
        />
      </div>
      <div v-if="convertedAmount" class="mt-2 flex items-center gap-2 justify-center">
        <AppIcon name="hugeicons:arrow-right-01" :size="14" class="text-primary" />
        <span class="text-sm font-black text-primary">{{ convertedAmount }}</span>
        <span class="text-[10px] font-medium text-muted-foreground/60"
          >({{ $t('transaction_form.estimated_receive') }})</span
        >
      </div>
      <p
        v-if="hasDecimals(form.currency) && !convertedAmount"
        class="mt-2 text-[10px] font-medium text-muted-foreground/60 text-center"
      >
        {{
          $t('transaction_form.cents_hint', {
            value: '50000',
            formatted: formatNumberOnly(500, form.currency),
          })
        }}
      </p>
    </div>

    <!-- DETAIL FORM GRID -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Category & Account (Left Side) -->
      <div class="space-y-4">
        <!-- Category Picker (Hidden for Transfer) -->
        <div
          v-if="form.type !== 'transfer'"
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:grid-view" :size="12" />
            {{ $t('transaction_form.category') }}
          </Label>
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('transaction_form.select_category')"
            class="w-full"
          />
        </div>

        <!-- From Account / Main Account -->
        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:wallet-01" :size="12" />
            {{
              form.type === 'transfer'
                ? $t('transaction_form.from_account')
                : $t('transaction_form.select_account')
            }}
          </Label>
          <Select v-model="form.account_id">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue
                :placeholder="
                  form.type === 'transfer'
                    ? $t('transaction_form.from_account')
                    : $t('transaction_form.select_account')
                "
              />
            </SelectTrigger>
            <SelectContent class="rounded-2xl p-2">
              <SelectItem
                v-for="acct in accounts"
                :key="acct.id"
                :value="acct.id"
                :text-value="acct.name"
                class="rounded-xl px-3 py-2.5"
                :disabled="form.type === 'transfer' && acct.id === form.to_account_id"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="size-2 rounded-full"
                    :style="{ backgroundColor: acct.color || undefined }"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold">{{ acct.name }}</span>
                    <span class="text-[10px] opacity-60">{{ acct.currency }}</span>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- To Account (Only for Transfer) -->
        <div
          v-if="form.type === 'transfer'"
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:wallet-01" :size="12" />
            {{ $t('transaction_form.to_account') }}
          </Label>
          <Select v-model="form.to_account_id">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue :placeholder="$t('transaction_form.to_account')" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl p-2">
              <SelectItem
                v-for="acct in accounts"
                :key="acct.id"
                :value="acct.id"
                :text-value="acct.name"
                class="rounded-xl px-3 py-2.5"
                :disabled="acct.id === form.account_id"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="size-2 rounded-full"
                    :style="{ backgroundColor: acct.color || undefined }"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold">{{ acct.name }}</span>
                    <span class="text-[10px] opacity-60">{{ acct.currency }}</span>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Currency & Date (Right Side) -->
      <div class="space-y-4">
        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:coins-swap" :size="12" />
            {{ $t('transaction_form.currency') }}
          </Label>
          <Select v-model="form.currency">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="max-h-[300px] rounded-2xl p-2">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel
                  class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
                >
                  {{ group.label }}
                </SelectLabel>
                <SelectItem
                  v-for="c in group.currencies"
                  :key="c.value"
                  :value="c.value"
                  :text-value="c.value"
                  class="rounded-xl px-3 py-2.5"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-black text-foreground">{{ c.value }}</span>
                    <span class="text-xs text-muted-foreground opacity-60">
                      - {{ c.label.split(' - ')[1] }}</span
                    >
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:calendar-01" :size="12" />
            {{ $t('transaction_form.select_date') }}
          </Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                class="h-11 w-full justify-between rounded-2xl border-border/50 bg-background/50 px-4 font-bold transition-all hover:bg-background/80"
                :class="!form.date && 'text-muted-foreground'"
              >
                {{
                  form.date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('transaction_form.select_date')
                }}
                <AppIcon name="hugeicons:arrow-down-01" :size="16" class="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-auto p-0 rounded-3xl border-border/50 shadow-2xl backdrop-blur-xl"
            >
              <Calendar v-model="calendarDate" initial-focus class="rounded-3xl" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <!-- Notes (Full Width) -->
      <div
        class="col-span-1 space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30 md:col-span-2"
      >
        <Label
          class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
        >
          <AppIcon name="hugeicons:note-01" :size="12" />
          {{ $t('transaction_form.note_optional') }}
        </Label>
        <Textarea
          v-model="form.description"
          :placeholder="$t('transaction_form.note_optional')"
          rows="2"
          class="min-h-[68px] md:min-h-[80px] rounded-2xl border-border/50 bg-background/50 p-4 font-medium transition-all hover:bg-background/80 focus-visible:ring-primary/20"
        />
      </div>

      <!-- Attachment (Full Width) -->
      <div
        class="col-span-1 space-y-3 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30 md:col-span-2"
      >
        <Label
          class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
        >
          <AppIcon name="hugeicons:image-01" :size="12" />
          {{ $t('transaction_form.attachment') }}
        </Label>
        <p class="text-xs text-muted-foreground">{{ $t('transaction_form.attachment_desc') }}</p>

        <!-- Existing image preview -->
        <div
          v-if="form.image_url && !uploadingImage"
          class="relative overflow-hidden rounded-2xl border border-border/50"
        >
          <img
            :src="form.image_url"
            alt="Transaction attachment"
            class="max-h-48 w-full object-cover"
          />
          <div class="absolute right-2 top-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              class="h-8 rounded-xl px-3 text-xs font-bold shadow-sm backdrop-blur-sm"
              @click="changeAttachment"
            >
              {{ $t('transaction_form.attachment_change') }}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              class="h-8 rounded-xl px-3 text-xs font-bold shadow-sm backdrop-blur-sm"
              @click="removeAttachment"
            >
              {{ $t('transaction_form.attachment_remove') }}
            </Button>
          </div>
        </div>

        <!-- Upload area -->
        <div v-else-if="!uploadingImage" class="flex items-center gap-3">
          <input
            ref="attachmentInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden"
            @change="onAttachmentSelected"
          />
          <Button
            variant="outline"
            class="h-10 rounded-2xl border-dashed border-border/50 px-5 text-xs font-bold"
            @click="attachmentInputRef?.click()"
          >
            <AppIcon name="hugeicons:upload-01" :size="14" class="mr-1" />
            {{ $t('transaction_form.attachment_add') }}
          </Button>
        </div>

        <!-- Uploading state -->
        <div v-else class="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3">
          <AppIcon name="hugeicons:loading-03" :size="18" class="animate-spin text-primary" />
          <span class="text-xs font-medium text-muted-foreground">
            {{ $t('transaction_form.attachment_uploading') }}
          </span>
        </div>
      </div>
    </div>

    <!-- SPLIT TRANSACTION -->
    <div
      v-if="form.type !== 'transfer'"
      class="space-y-4 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:share-07" :size="12" />
            {{ $t('transaction_form.split_transaction') }}
          </Label>
          <p class="mt-1 text-xs text-muted-foreground">{{ $t('transaction_form.split_desc') }}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="h-8 rounded-xl px-3 text-xs font-bold shrink-0"
          :class="splitEnabled ? 'border-primary/40 bg-primary/5 text-primary' : ''"
          @click="toggleSplit"
        >
          {{
            splitEnabled
              ? $t('transaction_form.split_disable')
              : $t('transaction_form.split_enable')
          }}
        </Button>
      </div>

      <template v-if="splitEnabled">
        <div
          v-for="(split, index) in splitItems"
          :key="index"
          class="flex flex-col gap-2 rounded-2xl border border-border/30 bg-background/30 p-3 md:flex-row md:items-center"
        >
          <div class="flex-1">
            <CategoryPicker
              v-model="split.category_id"
              :type="form.type"
              :placeholder="$t('transaction_form.split_category')"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="relative flex-1 md:w-36">
              <span
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground"
              >
                {{ form.currency }}
              </span>
              <input
                v-model="split.amount"
                type="text"
                inputmode="numeric"
                :placeholder="$t('transaction_form.split_amount')"
                class="h-10 w-full rounded-xl border border-border/50 bg-background/50 pl-10 pr-3 text-sm font-bold outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                @keydown="onNumberKeydown"
                @input="onSplitAmountInput($event, index)"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
              @click="removeSplit(index)"
            >
              <AppIcon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <div
            v-if="splitItems.length > 0"
            class="flex items-center gap-2 text-xs font-medium"
            :class="splitTotalMismatch ? 'text-destructive' : 'text-muted-foreground'"
          >
            <AppIcon
              :name="splitTotalMismatch ? 'hugeicons:alert-circle' : 'hugeicons:tick-01'"
              :size="14"
            />
            {{ formattedSplitTotal }} / {{ formattedAmount }}
          </div>
          <div class="flex-1" />
          <Button
            variant="outline"
            size="sm"
            class="h-8 rounded-xl border-dashed px-3 text-xs font-bold"
            @click="addSplit"
          >
            <AppIcon name="hugeicons:plus-sign" :size="14" class="mr-1" />
            {{ $t('transaction_form.split_add') }}
          </Button>
        </div>
      </template>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3 md:gap-4 pt-4">
      <Button
        variant="ghost"
        class="h-11 md:h-12 rounded-2xl px-6 md:px-8 font-black uppercase tracking-widest transition-all hover:bg-secondary/50"
        @click="$emit('cancel')"
      >
        {{ $t('transaction_form.cancel') }}
      </Button>
      <Button
        class="h-11 md:h-12 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 md:px-10 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        :disabled="submitting || !form.amount || !form.date"
        @click="onSubmit"
      >
        {{ submitting ? $t('transaction_form.saving') : $t('transaction_form.save') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import type { TransactionType, Transaction, TransactionFilters, SplitItem } from "@/types"


import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateSafe } from '@/lib/utils'
import { useReceipts } from '@/composables/useReceipts'
import { useBudgets } from '@/composables/useBudgets'

const { locale, t } = useI18n()

const props = defineProps<{
  transaction?: Transaction
}>()

const emit = defineEmits<{
  cancel: []
  saved: []
  dirty: [value: boolean]
}>()

const {
  currencyGroups,
  formatNumberOnly,
  parseLocalizedNumber,
  defaultCurrency,
  hasDecimals,
  formatCurrency,
  convertTo,
} = useCurrency()
const { toast } = useToast()

const { addTransaction, addTransfer, updateTransaction } = useTransactions()
const { uploadTransactionImage, deleteTransactionImage } = useTransactions()
const { accounts, fetchAccounts } = useAccounts()
const { checkBudgetAlerts } = useBudgets()

onMounted(() => {
  fetchAccounts()
})

const isEdit = computed(() => !!props.transaction)

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
})

const todayDate = today(getLocalTimeZone()).toString()

const form = reactive({
  type: (props.transaction?.type as TransactionType) ?? ('expense' as TransactionType),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? defaultCurrency.value,
  category_id: props.transaction?.category_id ?? '',
  account_id: props.transaction?.account_id ?? '',
  to_account_id: (props.transaction as any)?.to_account_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? todayDate,
  image_url: props.transaction?.image_url ?? (null as string | null),
})

const submitting = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)
const attachmentInputRef = ref<HTMLInputElement | null>(null)

const { uploading, scanning, scanReceiptFromFile } = useReceipts()

const { categories } = useCategories()

const cameraDialogOpen = ref(false)

/**
 * Auto-fill the form fields from scanned receipt data.
 * Shared by file selection and camera capture flows.
 */
function autoFillForm(receiptData: {
  type: TransactionType
  amount: number
  currency: string
  category: string | null
  description: string | null
  date: string | null
  merchant: string | null
}) {
  form.type = receiptData.type

  form.amount = receiptData.amount
  form.currency = receiptData.currency

  // Match category name from AI to local category_id
  if (receiptData.category) {
    const categoryName = receiptData.category.toLowerCase()
    const match = categories.value.find(
      (c: { name: string; type: string }) =>
        c.name.toLowerCase() === categoryName && c.type === form.type,
    )
    if (match) {
      form.category_id = match.id
    }
  }

  if (receiptData.description) {
    form.description = receiptData.description
  }

  if (receiptData.date) {
    form.date = receiptData.date
  }

  // merchant is appended to description if it exists and description doesn't already include it
  if (
    receiptData.merchant &&
    receiptData.description &&
    !receiptData.description.includes(receiptData.merchant)
  ) {
    form.description = `${receiptData.merchant} — ${receiptData.description}`
  }
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const receiptData = await scanReceiptFromFile(file)

  // Reset file input so the same file can be selected again
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (!receiptData) return

  autoFillForm(receiptData)
}

async function onCameraCaptured(file: File) {
  const receiptData = await scanReceiptFromFile(file, { skipCompression: true })
  if (!receiptData) return
  autoFillForm(receiptData)
}

async function onAttachmentSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingImage.value = true
  try {
    const url = await uploadTransactionImage(file)
    if (url) {
      form.image_url = url
    }
  } finally {
    uploadingImage.value = false
    if (attachmentInputRef.value) {
      attachmentInputRef.value.value = ''
    }
  }
}

function changeAttachment() {
  attachmentInputRef.value?.click()
}

async function removeAttachment() {
  if (form.image_url) {
    await deleteTransactionImage(form.image_url)
  }
  form.image_url = null
}

// --- Split transaction logic ---
const splitEnabled = ref(false)
const splitItems = ref<SplitItem[]>([])

const splitTotal = computed(() =>
  splitItems.value.reduce((sum: number, s) => sum + (Number(s.amount) || 0), 0),
)

const splitTotalMismatch = computed(
  () => splitItems.value.length > 0 && splitTotal.value !== Number(form.amount),
)

const formattedSplitTotal = computed(() => formatCurrency(splitTotal.value, form.currency))
const formattedAmount = computed(() => formatCurrency(form.amount, form.currency))

const convertedAmount = computed(() => {
  if (form.type !== 'transfer' || !form.to_account_id) return null
  const toAccount = accounts.value.find((a) => a.id === form.to_account_id)
  const toCurrency = toAccount?.currency || form.currency
  if (toCurrency === form.currency) return null

  const converted = convertTo(Number(form.amount), form.currency, toCurrency)
  if (converted === null) return null
  return formatCurrency(converted, toCurrency)
})

function toggleSplit() {
  splitEnabled.value = !splitEnabled.value
  if (!splitEnabled.value) {
    splitItems.value = []
  }
}

function addSplit() {
  splitItems.value.push({ category_id: '', amount: 0 })
}

function removeSplit(index: number) {
  splitItems.value.splice(index, 1)
}

function onSplitAmountInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
  const item = splitItems.value[index]
  if (item) {
    splitItems.value[index] = {
      ...item,
      amount: Number(input.value) || 0,
    }
  }
}

// Initialize splits from existing transaction
watch(
  () => props.transaction,
  (tx) => {
    const splits = (tx?.splits as unknown as SplitItem[]) || []
    if (splits.length > 0) {
      splitItems.value = splits.map((s) => ({ ...s }))
      splitEnabled.value = true
    }
  },
  { immediate: true },
)

const calendarDate = computed({
  get: () => (form.date ? parseDate(form.date) : undefined),
  set: (val) => {
    if (val) {
      form.date = val.toString()
    }
  },
})

watch(
  () => ({ ...form }),
  (newForm) => {
    if (!props.transaction) {
      return
    }
    const initial = {
      type: props.transaction.type,
      amount: props.transaction.amount,
      currency: props.transaction.currency,
      category_id: props.transaction.category_id,
      description: props.transaction.description,
      date: props.transaction.date,
    }
    const changed =
      newForm.type !== initial.type ||
      Number(newForm.amount) !== Number(initial.amount) ||
      newForm.currency !== initial.currency ||
      newForm.category_id !== (initial.category_id ?? '') ||
      newForm.account_id !== ((initial as Record<string, unknown>).account_id ?? '') ||
      newForm.description !== (initial.description ?? '') ||
      newForm.date !== initial.date
    emit('dirty', changed)
  },
  { deep: true, immediate: true },
)

const onAmountInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  // Strip non-digits from paste via context menu / middle-click
  input.value = input.value.replace(/\D/g, '')
}

const onSubmit = async () => {
  if (submitting.value) {
    return
  }

  submitting.value = true
  try {
    if (splitEnabled.value && splitTotalMismatch.value) {
      toast.error(t('transaction_form.split_total_mismatch'))
      submitting.value = false
      return
    }
    const payload = {
      type: form.type,
      amount: Number(form.amount),
      currency: form.currency,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      description: form.description || null,
      date: form.date!,
      image_url: form.image_url,
      splits: splitEnabled.value ? splitItems.value : [],
    }

    let result
    if (form.type === 'transfer') {
      if (!form.account_id || !form.to_account_id) {
        toast.error(t('transaction_form.error_transfer_accounts'))
        submitting.value = false
        return
      }

      const toAccount = accounts.value.find((a) => a.id === form.to_account_id)
      const toCurrency = toAccount?.currency || form.currency

      let toAmount = Number(form.amount)
      if (toCurrency !== form.currency) {
        const converted = convertTo(Number(form.amount), form.currency, toCurrency)
        if (converted !== null) {
          toAmount = converted
        }
      }

      result = await addTransfer({
        from_account_id: form.account_id,
        to_account_id: form.to_account_id,
        amount: Number(form.amount),
        to_amount: toAmount,
        currency: form.currency,
        to_currency: toCurrency,
        date: form.date!,
        description: form.description || undefined,
      })
    } else {
      result = props.transaction
        ? await updateTransaction(props.transaction.id, payload as any)
        : await addTransaction(payload as any)
    }

    if (!result.error) {
      emit('saved')
      // Fire-and-forget: check budget thresholds without blocking navigation
      const now = new Date()
      const monthStr = formatDateSafe(new Date(now.getFullYear(), now.getMonth(), 1))
      checkBudgetAlerts(monthStr).catch(() => {})
    }
  } finally {
    submitting.value = false
  }
}
</script>
