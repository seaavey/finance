# OCR Receipt Scanner — Design Spec

> Date: 2026-06-02
> Status: Draft
> Depends on: GPT-4o-mini (via aichatting.net free API), Supabase Edge Functions

## Problem

Users currently have to fill out the transaction form manually every time they make an expense or income entry. For users with high daily transaction volume (food stalls, fuel, groceries), this introduces significant friction:

- Must remember every transaction detail (amount, date, category, merchant)
- Prone to input errors (incorrect amounts, wrong categories)
- No mechanism to process receipt photos directly from a phone

**Goal:** users simply take a photo of a receipt, and the system automatically fills in the transaction form (or saves directly if confidence is high).

## Solution Overview

Two layers:

1. **Core OCR Engine** (`scripts/ocr.ts`) — the `scanReceipt()` function, callable from CLI or importable. Sends an image to AI Vision (GPT-4o-mini via the aichatting.net API) and extracts structured data.
2. **Edge Function** (`supabase/functions/ocr-receipt/`) — an HTTP wrapper that receives an `imageUrl`, calls `scanReceipt()`, and returns JSON results. The bridge between the mobile app/frontend and the AI.

**Future:** Frontend integration — a "Scan Receipt" button in the transaction form that uploads a photo to Supabase Storage, calls the Edge Function, and auto-fills the form.

## 1. Core OCR Engine — `scripts/ocr.ts`

### Dependencies

- Node.js `crypto` (RSA encryption for session tokens)
- `fetch` (built-in Node 18+/global)
- GPT-4o-mini via aichatting.net API (free, no API key required)

### API: aichatting.net (Reverse-Engineered)

Underlying technology: a free AI Chatting web service that provides access to GPT-4o-mini. We leverage its SSE endpoint (`/aigc/chat/v2/professional/stream`) as follows:

1. **Session creation** — generate a random visitor ID + encrypt with RSA public key → `vtoken`
2. **Request** — POST with `messages[]` containing the system prompt + image as a `data:` URL
3. **Stream parsing** — parse Server-Sent Events (SSE), accumulate the response, strip `--@DONE@--` and `-=-n--` markers

### Export Functions

| Function                | Input                                 | Output                               |
| ----------------------- | ------------------------------------- | ------------------------------------ |
| `scanReceipt(imageUrl)` | `string` (public image URL, JPEG/PNG) | `Promise<ScanResult>`                |
| `toDataUrl(url)`        | `string` (image URL)                  | `Promise<string>` (base64 data URL)  |
| `streamToString(res)`   | `Response` (SSE stream)               | `Promise<string>` (AI response text) |

### Data Model

```ts
interface ScanResult {
  status: 'ok' | 'error'
  data: ReceiptData | null
  error?: string
}

interface ReceiptData {
  type: 'expense' | 'income'
  amount: number
  currency: string // ISO 4217, default "IDR"
  category: string // mapped to Indonesian category
  description: string | null // "[merchant] — [item summary]"
  date: string // YYYY-MM-DD
  items: ReceiptItem[] | null
  merchant: string | null
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}
```

### System Prompt (AI Instructions)

The prompt consists of 9 rules directing GPT-4o-mini:

| Rule | Description                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| 1    | Output JSON only — no markdown, code fences, or explanations                                                  |
| 2    | Locale: `id` (Indonesian). Receipts may be in Indonesian or English                                           |
| 3    | All monetary values as numbers (not strings)                                                                  |
| 4    | If undetermined → `null` (do not omit the field)                                                              |
| 5    | `type` = expense or income. Default to expense                                                                |
| 6    | `category` mapped to Indonesian categories: Makanan, Transport, Belanja, Tagihan, Hiburan, Kesehatan, Lainnya |
| 7    | `description` format: `"[merchant] — [item summary]"` in Indonesian                                           |
| 8    | `currency` 3-letter ISO code. Default IDR for Indonesian receipts, USD for US receipts                        |
| 9    | `date` in YYYY-MM-DD format. Use the receipt date, or today if unclear                                        |

### Error Handling

- Image fetch failure (HTTP error / invalid content-type) → throw error with status code
- Non-JPEG/PNG image format → throw with Indonesian error message
- API HTTP error → `ScanResult.status = 'error'` with response body
- Empty response body → `ScanResult.status = 'error'`
- JSON parsing failure / AI returns invalid data → catch `JSON.parse` error → `ScanResult.status = 'error'`

## 2. Edge Function — `supabase/functions/ocr-receipt/`

### Runtime

Deno (native Supabase Edge Runtime). Deploy via Supabase CLI.

### Endpoint

```
POST /functions/v1/ocr-receipt
```

### Request

```json
{
  "imageUrl": "https://example.com/receipt.jpg"
}
```

### Response (Success — 200)

```json
{
  "status": "ok",
  "data": {
    "type": "expense",
    "amount": 75000,
    "currency": "IDR",
    "category": "Makanan",
    "description": "Warung Sate — 10 chicken satay skewers, 2 iced teas",
    "date": "2026-06-02",
    "items": [
      { "name": "Chicken Satay", "quantity": 10, "price": 5000 },
      { "name": "Iced Tea", "quantity": 2, "price": 5000 }
    ],
    "merchant": "Warung Sate Bahari"
  }
}
```

### Response (Error — 422)

```json
{
  "status": "error",
  "data": null,
  "error": "Unsupported image format: image/webp"
}
```

### Endpoint Behavior

| Condition                  | Status | Response                                                             |
| -------------------------- | ------ | -------------------------------------------------------------------- |
| OPTIONS                    | 204    | CORS preflight headers                                               |
| Not POST                   | 405    | `{ status: "error", error: "Method not allowed" }`                   |
| `imageUrl` missing/invalid | 400    | `{ status: "error", error: "Missing required field: imageUrl" }`     |
| `imageUrl` not HTTP(S)     | 400    | `{ status: "error", error: "imageUrl must be a valid HTTP(S) URL" }` |
| AI processing failed       | 422    | `{ status: "error", data: null, error: "<message>" }`                |
| JSON parsing error         | 400    | `{ status: "error", error: "Invalid request body" }`                 |
| Success                    | 200    | `{ status: "ok", data: ReceiptData }`                                |

### CORS

```ts
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
```

### Security Notes

- The Edge Function has no authentication guard (`verify_jwt = false` by default). Since it only proxies to an external AI API and does not touch the database, risk is low. JWT verification can be added later if needed.
- `imageUrl` must be a remote URL (public image). The function does not accept direct uploads — uploads are handled by the frontend to Supabase Storage, then the URL is sent to this function.

## 3. Frontend Integration (Future)

### Entry Point: TransactionForm.vue

A **"Scan Receipt"** button in the transaction form, triggered via a hidden file input:

```vue
<!-- Scan button -->
<Button
  variant="outline"
  class="..."
  :disabled="uploading || scanning"
  @click="fileInputRef?.click()"
>
  <AppIcon name="hugeicons:camera-01" :size="16" />
  {{ scanning ? $t('transaction_form.scanning') : $t('transaction_form.scan_receipt') }}
</Button>

<!-- Hidden file input -->
<input
  ref="fileInputRef"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  class="hidden"
  @change="onFileSelected"
/>
```

**Placement:** Above the form grid (between the type selector and the amount card), or beside the right side of the header. Final design pending UX approval.

**Note:** No `capture` attribute on the input — `accept` + file picker is sufficient. On mobile browsers, the camera option will be offered automatically.

### Upload Flow (Device File → URL)

#### Complete Flow

```
[User] taps "Scan Receipt"
    │
    ▼
[Browser] Opens file picker / camera (mobile)
    │  accept="image/jpeg,image/png,image/webp"
    ▼
[File] User selects/captures receipt photo
    │
    ├── Client-side validation:
    │   ├── File exists?                           → error "No file selected"
    │   ├── MIME type image/*?                      → error "Unsupported format"
    │   ├── Size ≤ 5MB?                             → error "File too large (max 5MB)"
    │   └── (Optional) Minimum 100×100 pixels?      → error "Image too small"
    │
    ▼
[Compression] Client-side resize using Canvas
    │
    ├── Read EXIF orientation (rotation)
    ├── Resize: max 1920px on the longest side (maintain aspect ratio)
    ├── Canvas: drawImage → toBlob()
    ├── JPEG quality: 0.7 (adjustable if needed)
    └── Output: new Blob (phone photo: 3-5MB → ~200-400KB)
    │
    ▼
[Upload] Upload to Supabase Storage
    │
    ├── Path: /receipts/{userId}/{uuid}.{ext}
    │   ├── userId → from useAuth()
    │   ├── uuid  → crypto.randomUUID()
    │   └── ext   → "jpg" (always JPEG after compression)
    │
    ├── supabase.storage.from('receipts').upload(path, compressedBlob, {
    │     contentType: 'image/jpeg',
    │     upsert: false,
    │   })
    │
    ├── Success → Get public URL via getPublicUrl(path)
    │
    └── Failure → Error toast:
        ├── "23505" (duplicate) → retry with new UUID
        ├── "401/403"          → "Session expired, please log in again"
        └── other              → "Upload failed, please try again"
    │
    ▼
[Scan] Call Edge Function
    │
    ├── POST {supabaseUrl}/functions/v1/ocr-receipt
    ├── Body: { "imageUrl": publicUrl }
    ├── Header: apikey: supabaseAnonKey (auth not strictly required)
    │
    ├── Success (200) → Auto-fill form
    └── Failure:
        ├── 400       → Validation error (bad request)
        ├── 422       → AI failed to read receipt
        └── network   → "Failed to connect to server"
    │
    ▼
[Auto-fill] Map scan results to TransactionForm
    │
    └── User reviews → taps "Save" (or edits manually)
```

#### Client-Side Compression Detail

```ts
// Pseudo-code — implementation in useReceipts.ts
async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(URL.createObjectURL(file))

  // Read EXIF orientation (rotation)
  const orientation = await getOrientation(file)
  const { width, height } = applyOrientation(img, orientation)

  // Calculate new dimensions: max 1920px
  const MAX = 1920
  let newW = width,
    newH = height
  if (width > MAX || height > MAX) {
    const ratio = Math.min(MAX / width, MAX / height)
    newW = Math.round(width * ratio)
    newH = Math.round(height * ratio)
  }

  // Canvas resize
  const canvas = document.createElement('canvas')
  canvas.width = newW
  canvas.height = newH
  const ctx = canvas.getContext('2d')!

  // Handle EXIF rotation
  ctx.translate(newW / 2, newH / 2)
  ctx.rotate((orientation * 90 * Math.PI) / 180)
  ctx.drawImage(img, -newW / 2, -newH / 2, newW, newH)

  // Output JPEG quality 0.7
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.7))
}
```

#### Client-Side Validation

| Condition                     | Reaction                                            |
| ----------------------------- | --------------------------------------------------- |
| `!file`                       | Cancel, no action                                   |
| `file.size > 5 * 1024 * 1024` | Toast "Image size exceeds 5MB limit"                |
| MIME not image/jpeg/png/webp  | Toast "Unsupported image format"                    |
| Canvas render fails           | Fallback: upload original file without compression  |
| Upload 401/403                | Toast "Session expired, please log in again"        |
| Upload timeout (>30s)         | Toast "Slow connection, please try again"           |
| Edge function error           | Toast according to error type (see UX States table) |

#### Advantages of This Flow

1. **Edge Function unchanged** — still receives `imageUrl`, no code modification needed
2. **File persisted** — can be used to view the original receipt, debugging, audit trail
3. **Client-side compression** — file size drops significantly (3MB → 200KB), faster upload
4. **Private bucket** — only the owner can access files via RLS

### Storage Bucket

`receipts` bucket — private (RLS by user_id), auto-expire after 30 days (scan results don't need permanent storage).

| Property           | Value                                   |
| ------------------ | --------------------------------------- |
| Bucket ID          | `receipts`                              |
| Public             | `false` (private, access via RLS)       |
| File size limit    | 5,242,880 bytes (5MB)                   |
| Allowed MIME types | `image/png`, `image/jpeg`, `image/webp` |

**Note:** Because the bucket is private, `getPublicUrl()` will return a publicly accessible URL for non-public buckets. Alternative: use `createSignedUrl(path, 60)` for a URL that expires in 60 seconds — more secure, but requires the Edge Function to process before the URL expires.

### Composable: `useReceipts.ts`

Interface for the composable that handles the entire upload + scan flow:

```ts
interface UseReceiptsReturn {
  /** Currently uploading to storage? */
  uploading: Ref<boolean>
  /** Currently scanning via AI? */
  scanning: Ref<boolean>
  /** Progress message displayed to the user */
  statusMessage: Ref<string>
  /** Last scan result (null if not yet / failed) */
  lastResult: Ref<ScanResult | null>
  /** Main trigger: select file → compress → upload → scan → return data */
  scanReceiptFromFile: (file: File) => Promise<ReceiptData | null>
  /** Reset state */
  reset: () => void
}
```

#### State Machine

```
IDLE → (user selects file) → UPLOADING → SCANNING → SUCCESS
                                │            │
                                │            └→ ERROR (AI failed)
                                └→ ERROR (upload failed)

Every ERROR can return to IDLE (user taps "Try Again").
SUCCESS → form filled, state returns to IDLE.
```

### Auto-fill Mapping

| AI Field      | Form Field      | Behavior                                                      |
| ------------- | --------------- | ------------------------------------------------------------- |
| `type`        | Type selector   | Set expense/income                                            |
| `amount`      | Amount input    | Format according to currency                                  |
| `currency`    | Currency select | Auto-select                                                   |
| `category`    | CategoryPicker  | Match category name with local database (fallback: "Lainnya") |
| `description` | Notes textarea  | Fill description                                              |
| `date`        | Date picker     | Set transaction date                                          |
| `items`       | —               | Reserved for future expansion (item details)                  |
| `merchant`    | (optional)      | Appended to description if present                            |

### UX States

| State                 | Component Behavior                                              |
| --------------------- | --------------------------------------------------------------- |
| Idle                  | "Scan Receipt" button visible                                   |
| Uploading             | Loading spinner + "Uploading image..."                          |
| Scanning              | Progress indicator + "Reading receipt..."                       |
| Success               | Fields auto-populated; toast "Receipt scanned successfully"     |
| Error (network)       | Toast "Connection failed" + retry button                        |
| Error (invalid image) | Toast "Unsupported image format. Use JPEG or PNG."              |
| Error (AI failed)     | Toast "Could not read receipt. Try again with better lighting." |
| Partial success       | Populate available fields; leave the rest manual                |

## 4. Integration Points

| Layer         | File                                       | Changes                                                      |
| ------------- | ------------------------------------------ | ------------------------------------------------------------ |
| Core Engine   | `scripts/ocr.ts`                           | **Done.** Exports `scanReceipt`, `ReceiptData`, `ScanResult` |
| Edge Function | `supabase/functions/ocr-receipt/index.ts`  | **Done.** Deploy to Supabase                                 |
| Storage       | Supabase `receipts` bucket                 | Needs creation (private, RLS)                                |
| Frontend      | `src/components/TransactionForm.vue`       | Add scan button + upload flow                                |
| Frontend      | `src/composables/useReceipts.ts` **(new)** | Upload logic + Edge Function call                            |
| Translation   | `locales/`                                 | Add "scan_receipt", "uploading", "scanning", error messages  |

## 5. Error & Edge Cases

- **Image too large (>5MB):** Compress/client-side resize before upload. Supabase Storage default limit is 10MB.
- **Unclear/blurry receipt:** AI may return empty/null data. Inform user to retake the photo.
- **Receipt in foreign language (other than Indonesian/English):** AI extraction may be inaccurate. Fallback to manual input.
- **Category mismatch:** AI returns an Indonesian category string. Must map to `category_id` from the database. If no match → fallback to "Lainnya".
- **Multi-currency receipt:** Receipts from abroad. AI detects currency from symbol/context (`$`, `€`, `¥`).
- **Rate limiting:** The aichatting.net API is undocumented — it may throttle unexpectedly. Edge Function should handle 429/503 with exponential backoff (1s, 4s, 16s — max 3 retries).
- **Receipt without merchant name:** AI will set `merchant: null`. Description will use the category as fallback ("Belanja — item summary").
- **Date parsing fails:** AI falls back to today's date. User can adjust manually.
- **Network timeout:** Edge Function has a default timeout (60 seconds in Supabase). Upload + scan must complete within that window.
- **Expired image URL:** If the storage URL has an expired signed token, the Edge Function's image fetch will fail → error response.
- **Receipt item details not displayed:** The `items` array is stored for future expansion (analytics, per-item breakdown) but is not shown in the form at this stage.

## 6. Out of Scope (First Iteration)

- **Batch scanning** (multiple receipts in one request) — future iteration
- **Offline OCR / on-device ML** — too heavy for a PWA
- **Save receipt image as transaction attachment** — storage cost not yet justified
- **Auto-categorization learning** (refine categories based on user history) — future iteration
- **Receipt email forwarding** (user forwards receipt emails to an app inbox) — far future
- **QR Code / barcode scanning** from receipts — different use case
- **WebSocket streaming** for scan progress — HTTP polling is sufficient

## Files Changed

| #   | Action     | File                                                               |
| --- | ---------- | ------------------------------------------------------------------ |
| 1   | **Done**   | `scripts/ocr.ts` (core scan engine)                                |
| 2   | **Done**   | `supabase/functions/ocr-receipt/index.ts` (Edge Function)          |
| 3   | **Create** | `supabase/functions/ocr-receipt/deno.json` (deno config, optional) |
| 4   | **Edit**   | `supabase/config.toml` (add ocr-receipt function config)           |
| 5   | **Create** | `src/composables/useReceipts.ts` (frontend upload + scan logic)    |
| 6   | **Edit**   | `src/components/TransactionForm.vue` (add scan button + flow)      |
| 7   | **Edit**   | `locales/en.json` (scan receipt translations)                      |
| 8   | **Edit**   | `locales/id.json` (scan receipt translations)                      |
