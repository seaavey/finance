# OCR Receipt Scanner — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to scan a receipt photo and auto-fill the transaction form with AI-extracted data.

**Architecture:** Frontend captures a device photo → client-side Canvas compression (max 1920px, JPEG q0.7) → upload to Supabase Storage `receipts/` bucket → get public URL → call Edge Function → Edge Function proxies to GPT-4o-mini via aichatting.net → parse JSON → return `ReceiptData` → auto-fill `TransactionForm.vue`. A composable (`useReceipts.ts`) manages the full state machine (IDLE → UPLOADING → SCANNING → SUCCESS/ERROR).

**Tech Stack:** TypeScript, Vue 3 (Composition API), Supabase Storage, Supabase Edge Functions (Deno), Canvas API, TanStack Vue Query

**Spec:** `OCR-RECEIPT-SPECS.md`

---

### Task 1: Configure `ocr-receipt` Edge Function in supabase/config.toml

**Files:**

- Modify: `supabase/config.toml`

- [ ] **Step 1: Add function config to supabase/config.toml**

Insert after the `[functions.og-image]` block at line 417:

```toml
[functions.ocr-receipt]
verify_jwt = false
```

The function has no database access (pure proxy to external AI API), so JWT verification is not needed.

- [ ] **Step 2: Commit**

```bash
git add supabase/config.toml
git commit -m "feat: add ocr-receipt Edge Function config to supabase/config.toml"
```

---

### Task 2: Add exponential backoff retry to scripts/ocr.ts

**Files:**

- Modify: `scripts/ocr.ts`

- [ ] **Step 1: Add retry logic to `scanReceipt()`**

Wrap the existing `scanReceipt()` body with retry logic. Add a helper `sleep()` and a retryable wrapper at the end of the file:

```ts
/** Sleep for ms milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** HTTP status codes that warrant a retry (server overload / rate limit) */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Scan a receipt image with automatic retry on retryable errors.
 * Retries with exponential backoff: 1s → 4s → 16s on 429/503 responses.
 */
export async function scanReceiptWithRetry(imageUrl: string): Promise<ScanResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await scanReceipt(imageUrl)

    if (result.status === 'ok') return result

    // Only retry on 429 (rate limit) or 503 (service unavailable)
    if (result.error?.includes('429') || result.error?.includes('503')) {
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(4, attempt) // 1s, 4s, 16s
        console.warn(
          `[ocr] Retryable error (attempt ${attempt + 1}/${MAX_RETRIES}), ` +
            `retrying in ${delay}ms: ${result.error}`,
        )
        await sleep(delay)
        continue
      }
      return {
        status: 'error',
        data: null,
        error: `AI API rate limited after ${MAX_RETRIES + 1} attempts. Please try again later.`,
      }
    }

    // Non-retryable error — return immediately
    return result
  }

  // TypeScript exhaustiveness fallback (shouldn't reach here)
  return { status: 'error', data: null, error: 'Unknown retry error' }
}
```

- [ ] **Step 2: Export `scanReceiptWithRetry` and keep the original `scanReceipt` as private**

The existing `export async function scanReceipt` at line ~125 stays unchanged — it does the actual work. The new `scanReceiptWithRetry` wraps it. At the top of the file, ensure `scanReceiptWithRetry` is exported:

```ts
// Already exported at the bottom: export { scanReceiptWithRetry, ... }
```

Update the CLI usage at the bottom of the file (around line 216) to use `scanReceiptWithRetry` instead of `scanReceipt`:

```ts
// --- CLI usage ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const imageUrl =
    process.argv[2] || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg'

  scanReceiptWithRetry(imageUrl)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(JSON.stringify({ status: 'error', data: null, error: e.message }, null, 2))
      process.exit(1)
    })
}
```

- [ ] **Step 3: Commit**

```bash
git add scripts/ocr.ts
git commit -m "feat: add exponential backoff retry to scanReceipt (429/503, 1s→4s→16s)"
```

---

### Task 3: Add localization strings for OCR receipt scanning

**Files:**

- Modify: `src/locales/en.json`
- Modify: `src/locales/id.json`

- [ ] **Step 1: Add English strings to `src/locales/en.json`**

Find the `transaction_form` section (around line 79-97) and add after the `"saving"` key:

```json
    "scan_receipt": "Scan Receipt",
    "scanning": "Reading receipt...",
    "uploading": "Uploading image...",
    "scan_success": "Receipt scanned successfully",
    "scan_error": "Failed to read receipt. Try again with better lighting.",
    "scan_error_format": "Unsupported image format. Use JPEG or PNG.",
    "scan_error_size": "Image exceeds 5MB limit. Please choose a smaller file.",
    "scan_error_network": "Connection failed. Please try again.",
    "scan_error_auth": "Session expired. Please log in again."
```

- [ ] **Step 2: Add Indonesian strings to `src/locales/id.json`**

Find the `transaction_form` section (around line 79-97) and add after the `"saving"` key:

```json
    "scan_receipt": "Scan Struk",
    "scanning": "Membaca struk...",
    "uploading": "Mengupload gambar...",
    "scan_success": "Struk berhasil dibaca",
    "scan_error": "Gagal membaca struk. Coba foto lagi dengan pencahayaan lebih baik.",
    "scan_error_format": "Format gambar tidak didukung. Gunakan JPEG atau PNG.",
    "scan_error_size": "Ukuran gambar melebihi 5MB. Pilih file yang lebih kecil.",
    "scan_error_network": "Koneksi gagal. Silakan coba lagi.",
    "scan_error_auth": "Sesi habis. Silakan login ulang."
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/en.json src/locales/id.json
git commit -m "feat: add OCR receipt scanning localization strings"
```

---

### Task 4: Create `useReceipts` composable

**Files:**

- Create: `src/composables/useReceipts.ts`

This composable manages the full state machine: file selection → compression → upload → scan → result.

- [ ] **Step 1: Create `src/composables/useReceipts.ts` with the full implementation**

```ts
import { ref, type Ref } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'
// Types defined locally (avoids cross-environment dependency with scripts/ocr.ts)
interface ScanResult {
  status: 'ok' | 'error'
  data: ReceiptData | null
  error?: string
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptData {
  type: 'expense' | 'income'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  items: ReceiptItem[] | null
  merchant: string | null
}

export interface UseReceiptsReturn {
  uploading: Ref<boolean>
  scanning: Ref<boolean>
  statusMessage: Ref<string>
  lastResult: Ref<ScanResult | null>
  scanReceiptFromFile: (file: File) => Promise<ReceiptData | null>
  reset: () => void
}

const MAX_IMAGE_DIMENSION = 1920
const JPEG_QUALITY = 0.7
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Load an image File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/**
 * Compress and resize an image file client-side using Canvas.
 * Resizes to max 1920px on the longest side, outputs JPEG at quality 0.7.
 */
async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file)

  let { width, height } = img

  // Resize if larger than MAX_IMAGE_DIMENSION on either axis
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable')
  }

  ctx.drawImage(img, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

/**
 * Validate the selected file before processing.
 * Returns an error message string, or null if valid.
 */
function validateFile(file: File): string | null {
  if (!file) return 'No file selected'

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'scan_error_format'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'scan_error_size'
  }

  return null
}

export const useReceipts = (): UseReceiptsReturn => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()

  const uploading = ref(false)
  const scanning = ref(false)
  const statusMessage = ref('')
  const lastResult = ref<ScanResult | null>(null)

  /**
   * Upload a compressed image blob to Supabase Storage.
   * Returns the public URL or throws on error.
   */
  async function uploadToStorage(blob: Blob): Promise<string> {
    const userId = user.value?.id
    if (!userId) {
      toast.error(t('transaction_form.scan_error_auth'))
      throw new Error('Not authenticated')
    }

    const uuid = crypto.randomUUID()
    const path = `receipts/${userId}/${uuid}.jpg`

    const { error } = await supabase.storage.from('receipts').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

    if (error) {
      if (error.message?.includes('23505')) {
        // Duplicate — extremely unlikely with UUID, but retry once
        const retryUuid = crypto.randomUUID()
        const retryPath = `receipts/${userId}/${retryUuid}.jpg`
        const { error: retryError } = await supabase.storage
          .from('receipts')
          .upload(retryPath, blob, { contentType: 'image/jpeg', upsert: false })
        if (retryError) throw retryError
        const { data: retryUrl } = supabase.storage.from('receipts').getPublicUrl(retryPath)
        return retryUrl.publicUrl
      }

      if (error.message?.includes('401') || error.message?.includes('403')) {
        toast.error(t('transaction_form.scan_error_auth'))
        throw new Error('Auth failed')
      }

      throw error
    }

    const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(path)
    return urlData.publicUrl
  }

  /**
   * Call the ocr-receipt Edge Function with the image URL.
   */
  async function callScanEndpoint(imageUrl: string): Promise<ScanResult> {
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string
    const anonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string

    const res = await fetch(`${supabaseUrl}/functions/v1/ocr-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
      },
      body: JSON.stringify({ imageUrl }),
    })

    const result: ScanResult = await res.json()

    if (!res.ok) {
      if (res.status === 400) {
        return { status: 'error', data: null, error: t('transaction_form.scan_error_format') }
      }
      if (res.status === 422) {
        return {
          status: 'error',
          data: null,
          error: result.error || t('transaction_form.scan_error'),
        }
      }
      return { status: 'error', data: null, error: t('transaction_form.scan_error_network') }
    }

    return result
  }

  /**
   * Main entry point: select file → validate → compress → upload → scan → return data.
   * Returns ReceiptData on success, null on failure (toast already shown).
   */
  async function scanReceiptFromFile(file: File): Promise<ReceiptData | null> {
    // Reset previous state
    lastResult.value = null
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(t(`transaction_form.${validationError}`))
      return null
    }

    // --- COMPRESS ---
    uploading.value = true
    statusMessage.value = t('transaction_form.uploading')

    let compressedBlob: Blob
    try {
      compressedBlob = await compressImage(file)
    } catch {
      // Fallback: upload original file if compression fails
      compressedBlob = file
    }

    // --- UPLOAD ---
    let imageUrl: string
    try {
      imageUrl = await uploadToStorage(compressedBlob)
    } catch (e) {
      uploading.value = false
      toast.error(e instanceof Error ? e.message : t('transaction_form.scan_error_network'))
      return null
    }

    uploading.value = false

    // --- SCAN ---
    scanning.value = true
    statusMessage.value = t('transaction_form.scanning')

    const result = await callScanEndpoint(imageUrl)
    scanning.value = false
    lastResult.value = result

    if (result.status === 'ok' && result.data) {
      toast.success(t('transaction_form.scan_success'))
      return result.data
    }

    toast.error(result.error || t('transaction_form.scan_error'))
    return null
  }

  function reset() {
    uploading.value = false
    scanning.value = false
    statusMessage.value = ''
    lastResult.value = null
  }

  return {
    uploading,
    scanning,
    statusMessage,
    lastResult,
    scanReceiptFromFile,
    reset,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useReceipts.ts
git commit -m "feat: create useReceipts composable (compress → upload → scan state machine)"
```

---

### Task 5: Add scan button and auto-fill to TransactionForm.vue

**Files:**

- Modify: `src/components/TransactionForm.vue`

- [ ] **Step 1: Add the scan button and file input between the type selector and amount card**

In the template, insert after the type selector `</div>` (line ~46) and before the amount card (`<!-- AMOUNT CARD -->` line ~48):

```vue
<!-- SCAN RECEIPT BUTTON -->
<div class="flex justify-center">
      <Button
        variant="outline"
        class="group relative h-12 w-full rounded-2xl border-dashed border-border/50 bg-transparent font-black uppercase tracking-widest text-xs transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
        :disabled="uploading || scanning"
        @click="fileInputRef?.click()"
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
<span>{{ scanning ? $t('transaction_form.scanning') : $t('transaction_form.scan_receipt') }}</span>

<input
  ref="fileInputRef"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  class="hidden"
  @change="onFileSelected"
/>
```

- [ ] **Step 2: Import `useReceipts` composable and add script logic**

In the `<script setup>` block, add the import and compose it:

After the existing imports (around line 211), add:

```ts
import { useReceipts } from '@/composables/useReceipts'
```

In the existing line where `useCategories()` is called:

```diff
- const { fetchCategories } = useCategories();
+ const { categories, fetchCategories } = useCategories();
```

After `const submitting = ref(false)` (around line 263), add the file input ref and receipt scan state:

```ts
const fileInputRef = ref<HTMLInputElement | null>(null)

const { uploading, scanning, scanReceiptFromFile } = useReceipts()

const { categories } = useCategories()

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

  // --- AUTO-FILL FORM ---
  form.type = receiptData.type

  form.amount = receiptData.amount
  form.currency = receiptData.currency

  // Match category name from AI to local category_id
  if (receiptData.category) {
    const match = categories.value.find(
      (c) => c.name.toLowerCase() === receiptData.category!.toLowerCase() && c.type === form.type,
    )
    if (match) {
      form.category_id = match.id
    }
    // If no match found, leave current category (fallback to whatever was selected or empty)
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TransactionForm.vue
git commit -m "feat: add Scan Receipt button and auto-fill to TransactionForm"
```

---

### Task 6: Update Edge Function to use `scanReceiptWithRetry`

**Files:**

- Modify: `supabase/functions/ocr-receipt/index.ts`

- [ ] **Step 1: Update the import and function call**

The Edge Function currently duplicates the `scanReceipt` logic inline. Since it's a Deno function (not Node.js), it cannot import from `scripts/ocr.ts` directly. Instead, replicate the `scanReceiptWithRetry` wrapper pattern inside the Edge Function.

Find the `async function scanReceipt` in the Edge Function and wrap its call with the same retry logic. The `scanReceipt` function body stays unchanged.

Add the `sleep` helper and `isRetryableStatus` at the top of the file (after existing imports):

```ts
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 503
}
```

Wrap the scan call inside `serve()` (around line 241 where `scanReceipt(imageUrl)` is called) with retry logic:

```ts
// Replace:
// const result = await scanReceipt(imageUrl)

// With:
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000
let result: ScanResult
for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
  result = await scanReceipt(imageUrl)
  if (result.status === 'ok') break
  if (result.error?.includes('429') || result.error?.includes('503')) {
    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * Math.pow(4, attempt)
      await sleep(delay)
      continue
    }
    result = {
      status: 'error',
      data: null,
      error: 'AI API rate limited after multiple retries. Please try again later.',
    }
  } else {
    break
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/ocr-receipt/index.ts
git commit -m "feat: add exponential backoff retry to Edge Function scanReceipt"
```
