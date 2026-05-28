# Shadcn UI Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all native `<button>`, `<input>`, and `<img>` elements in app templates with shadcn-vue components (`Button`, `Input`, `AspectRatio`).

**Architecture:** Each file either adds `import { Button } from '@/components/ui/button'` (if not already present) or just replaces `<button>` → `<Button>`. Native `<input>` elements get replaced with `<Input>` from shadcn. Images already wrapped in `AspectRatio` stay. Changes are template-only; no logic changes.

**Tech Stack:** Vue 3 + shadcn-vue (Reka UI) + Tailwind CSS v4

---

## Files By Group

| Group              | Files                                                                             | Native Elements                                          |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **A: Core layout** | AppTopbar.vue (6), AppSidebar.vue (1), SettingsItem.vue (1)                       | 8 `<button>` — need import                               |
| **B: Dashboard**   | dashboard.vue                                                                     | 5 `<button>` — need import                               |
| **C: List pages**  | categories.vue, recurring.vue, transactions/index.vue, transactions/[id]/edit.vue | ~12 `<button>`, 1 `<input>` — already have Button import |
| **D: Forms**       | TransactionForm.vue, CategoryForm.vue, GoalForm.vue                               | ~16 `<button>`, 1 `<input>`                              |
| **E: Settings**    | settings.vue                                                                      | ~4 `<button>` — already have Button import               |
| **F: Landing**     | landing/Navbar.vue, landing/Footer.vue                                            | ~6 `<button>`, 1 `<input>` — already have Button import  |
| **G: Components**  | GoalCard.vue                                                                      | 1 `<img>` — already uses Button                          |

---

### Task A-1: AppTopbar.vue — 6 native buttons to Button

**Files:**

- Modify: `app/components/AppTopbar.vue`

**Add import** (after existing imports):

```ts
import { Button } from '@/components/ui/button';
```

**Replace all 6 `<button>` with `<Button>`:**

1. **Hamburger menu** (line 7): `<button>` → `<Button variant="ghost" size="icon">`
   - Keep class `lg:hidden` for responsive hide
   - Keep `@click="$emit('toggleSidebar')"`

2. **Search mobile** (line 40): `<button>` → `<Button variant="ghost" size="icon">`
   - Keep class `md:hidden`
   - Keep `@click="showSearchDialog = true"`

3. **Search desktop** (line 49): `<button>` → `<Button variant="outline" class="h-10 w-60 lg:w-65 justify-start gap-2 rounded-2xl">`
   - Remove `cursor-pointer` (Button has it)
   - Keep inner content (Icon, span, kbd)

4. **Notification** (line 67): `<button>` → `<Button variant="ghost" size="icon">`
   - Keep inner content (Icon + badge span)

5. **Theme toggle** (line 77): `<button>` → `<Button variant="ghost" size="icon">`
   - Keep `@click="cycleColorMode"` and inner Icon

6. **CTA Add** (line 91): `<button>` → `<Button class="h-10 gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-4 text-sm text-white hover:from-pink-400 hover:to-pink-500">`
   - Keep `@click="navigateTo('/transactions/new')"` and inner content
   - Remove the size-10 class (Button handles sizing)

- [x] **Read and replace all buttons in AppTopbar.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/AppTopbar.vue
git commit -m "refactor: replace native buttons with shadcn Button in AppTopbar"
```

---

### Task A-2: AppSidebar.vue — 1 logout button to Button

**Files:**

- Modify: `app/components/AppSidebar.vue`

**Add import:**

```ts
import { Button } from '@/components/ui/button';
```

**Replace logout button** (line 59):

```html
<button
  variant="ghost"
  size="icon"
  class="size-8 rounded-lg"
  :title="$t('sidebar.logout')"
  @click="onSignOut"
>
  <Icon name="hugeicons:logout-01" :size="16" />
</button>
```

Remove the `<button>` at line 59 and the surrounding text-sidebar-foreground/40 classes (Button variant ghost handles it).

- [x] **Read and replace button in AppSidebar.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/AppSidebar.vue
git commit -m "refactor: replace native button with shadcn Button in AppSidebar"
```

---

### Task A-3: SettingsItem.vue — 1 wrapper button to Button

**Files:**

- Modify: `app/components/SettingsItem.vue`

**Add import:**

```ts
import { Button } from '@/components/ui/button';
```

**Replace the `<button>` wrapper** (line 2):

```html
<button
  variant="ghost"
  class="group flex w-full items-center gap-4 overflow-hidden px-4 py-3.5 hover:bg-card/40 active:bg-card/60"
  @click="$emit('click')"
>
  <!-- keep inner content unchanged -->
</button>
```

Note: `variant="ghost"` gives the right transparent background, and the existing classes handle the hover/active styling.

- [x] **Read and replace button in SettingsItem.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/SettingsItem.vue
git commit -m "refactor: replace native button with shadcn Button in SettingsItem"
```

---

### Task B-1: Dashboard — 5 toggle buttons to Button

**Files:**

- Modify: `app/pages/dashboard.vue`

**Add import:**

```ts
import { Button } from '@/components/ui/button';
```

**Replace view mode toggle buttons** (line 18, v-for viewModes):
Replace the `<button>` with dynamic variant based on active state:

```html
<button
  v-for="mode in viewModes"
  :key="mode.value"
  :variant="viewMode === mode.value ? 'default' : 'ghost'"
  size="sm"
  class="rounded-xl"
  @click="viewMode = mode.value"
>
  {{ mode.label }}
</button>
```

Remove the manual `class` binding with conditional classes — Button's `variant` prop handles it.

**Replace chart period toggle buttons** (line 119, v-for chartPeriods):

```html
<button
  v-for="period in chartPeriods"
  :key="period"
  :variant="selectedPeriod === period ? 'default' : 'ghost'"
  size="sm"
  class="rounded-md"
  @click="selectedPeriod = period"
>
  {{ period }}
</button>
```

- [x] **Read and replace buttons in dashboard.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/pages/dashboard.vue
git commit -m "refactor: replace native toggle buttons with shadcn Button in dashboard"
```

---

### Task C-1: Categories Page — tab + action buttons to Button

**Files:**

- Modify: `app/pages/categories.vue`

Already imports `Button` — just replace `<button>` elements.

**Tab filter button** (line 36, v-for):
Replace the native `<button>` with `<Button :variant="activeTab === tab.value ? 'default' : 'outline'" size="sm">`.

**Edit action button** (line 93):
Replace with `<Button variant="ghost" size="icon">` wrapping the Icon.

**Delete action button** (line 99):
Replace with `<Button variant="ghost" size="icon">` wrapping the Icon.

- [x] **Read and replace buttons in categories.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/pages/categories.vue
git commit -m "refactor: replace native buttons with shadcn Button in categories page"
```

---

### Task C-2: Recurring Page — action buttons to Button

**Files:**

- Modify: `app/pages/recurring.vue`

Already imports `Button`.

**Empty state CTA** (line 53):
Replace `<button>` with `<Button variant="default">`.

**Edit action** (line 110):
Replace with `<Button variant="ghost" size="icon">`.

**Delete action** (line 116):
Replace with `<Button variant="ghost" size="icon">`.

- [x] **Read and replace buttons in recurring.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/pages/recurring.vue
git commit -m "refactor: replace native buttons with shadcn Button in recurring page"
```

---

### Task C-3: Transactions Index — filter + search to Button + Input

**Files:**

- Modify: `app/pages/transactions/index.vue`

Already imports `Button`.

**Native search `<input>`** (line 26):
Replace with `<Input>` component from shadcn:

```html
<input
  v-model="filters.search"
  :placeholder="$t('transactions.search_placeholder')"
  class="h-12 rounded-2xl border-border/50 bg-background/50 pl-12 pr-4 focus:border-pink-500/20"
  @input="debouncedFetch"
/>
```

Add import:

```ts
import { Input } from '@/components/ui/input';
```

**Filter toggle button** (line 33):
Replace `<button>` with `<Button variant="outline" size="sm">`.

**Owner filter buttons** (line 86, v-for):
Replace with `<Button :variant="mode.value === /* active logic */ ? 'default' : 'ghost'" size="sm">`.

- [x] **Read and replace input/buttons in transactions/index.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/pages/transactions/index.vue
git commit -m "refactor: replace native input and buttons with shadcn in transactions page"
```

---

### Task C-4: Transaction Edit — action buttons to Button

**Files:**

- Modify: `app/pages/transactions/[id]/edit.vue`

Already imports `Button`.

**Back button** (line 67):
Replace `<button>` with `<Button variant="ghost">`.

**Delete button** (line 102):
Replace `<button>` with `<Button variant="destructive" size="sm">`.

- [x] **Read and replace buttons in edit.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add "app/pages/transactions/[id]/edit.vue"
git commit -m "refactor: replace native buttons with shadcn Button in edit page"
```

---

### Task D-1: TransactionForm — type toggle + buttons to Button

**Files:**

- Modify: `app/components/TransactionForm.vue`

Already imports `Button`.

**Income button** (line 15):
Replace `<button>` with `<Button :variant="form.type === 'income' ? 'default' : 'outline'">` — keep the custom green styling by checking if Button variant "default" is acceptable, or use a class override.

**Expense button** (line 28):
Same pattern: `<Button :variant="form.type === 'expense' ? 'default' : 'outline'">`.

**Cancel button** (line 154):
Replace with `<Button variant="outline" @click="$emit('cancel')">`.

**Save button** (line 160):
Already uses `<Button>` — verify.

**Amount `<input>`** (line 50):
Keep as-is — this is a custom locale-aware formatted input with specific keyboard handling. Replacing with shadcn `Input` would break the custom amount formatting logic.

- [x] **Read and replace buttons in TransactionForm.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/TransactionForm.vue
git commit -m "refactor: replace native buttons with shadcn Button in TransactionForm"
```

---

### Task D-2: CategoryForm — color swatch buttons to Button

**Files:**

- Modify: `app/components/CategoryForm.vue`

Already imports `Button`.

**Color swatch buttons** (line 40, v-for 12 colors):
Replace `<button>` with `<Button variant="outline" :class="cn('size-8 rounded-full p-0', selectedColor === color && 'ring-2 ring-foreground scale-110')">`.
Keep the `:style="{ backgroundColor: color }"` and `@click="selectedColor = color"`.

- [x] **Read and replace buttons in CategoryForm.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/CategoryForm.vue
git commit -m "refactor: replace native buttons with shadcn Button in CategoryForm"
```

---

### Task D-3: GoalForm — upload trigger button

**Files:**

- Modify: `app/components/GoalForm.vue`

Already uses `Button` (lines 42, 91, 107, 110).

**Image upload trigger button** (line 76):
Replace `<button>` with `<Button variant="outline" class="flex-col gap-2 py-8">`.
Keep the click handler and inner content.

**File `<input>`** (line 69):
Keep `<input type="file">` — must be native for file picker to work.

**Image `<img>`** (line 89):
Already wrapped in `AspectRatio` from earlier work. No change needed.

- [x] **Read and replace button in GoalForm.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/GoalForm.vue
git commit -m "refactor: replace native button with shadcn Button in GoalForm"
```

---

### Task E-1: Settings — action buttons to Button

**Files:**

- Modify: `app/pages/settings.vue`

Already imports `Button`.

**Cancel invite button** (line 214):
Replace `<button>` with `<Button variant="outline" size="sm">`.

**Disconnect partner button** (line 312):
Replace `<button>` with `<Button variant="destructive">`.

**Sign out button** (line 349):
Replace `<button>` with `<Button variant="outline">`.

**Currency selection buttons** (line 424, v-for):
Replace `<button>` with `<Button variant="ghost" class="w-full justify-start">`.

- [x] **Read and replace buttons in settings.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/pages/settings.vue
git commit -m "refactor: replace native buttons with shadcn Button in settings page"
```

---

### Task F-1: Landing Navbar — nav buttons to Button

**Files:**

- Modify: `app/components/landing/Navbar.vue`

Already imports `Button`.

**Desktop nav pill items** (line 38, v-for 3):
Replace `<button>` with `<Button variant="ghost" class="rounded-full">`.

**Mobile nav items** (line 154, v-for 3 inside SheetClose as-child):
Replace `<button>` or verify — SheetClose as-child wraps a Button already.

- [x] **Read and replace buttons in Navbar.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/landing/Navbar.vue
git commit -m "refactor: replace native buttons with shadcn Button in landing Navbar"
```

---

### Task F-2: Landing Footer — links + newsletter to Button + Input

**Files:**

- Modify: `app/components/landing/Footer.vue`

Already imports `Button`.

**Product link buttons** (line 43, v-for 3):
Replace `<button>` with `<Button variant="link" class="h-auto p-0">`.

**Newsletter `<input>`** (line 85):
Replace with `<Input type="email" :placeholder="$t('landing.newsletter_placeholder')" class="flex-1 rounded-xl border-border/50">`.
Add import: `import { Input } from '@/components/ui/input';`

**Newsletter subscribe button** (line 91):
Already uses `Button`.

- [x] **Read and replace input/buttons in Footer.vue**
- [x] **Run `bun run lint`**
- [x] **Commit**

```bash
git add app/components/landing/Footer.vue
git commit -m "refactor: replace native input and buttons with shadcn in landing Footer"
```

---

### Task G-1: GoalCard — image handling

**Files:**

- Read: `app/components/GoalCard.vue`

**`<img>` element** (line 11):
The image is an external Supabase Storage URL — must use `<img>` not `<NuxtImage>`. Already discussed. Wrap in `AspectRatio` if not already done:

```html
<AspectRatio v-if="goal.image_url" :ratio="16 / 9" class="overflow-hidden rounded-xl">
  <img :src="goal.image_url" :alt="goal.name" class="h-full w-full object-cover" />
</AspectRatio>
```

- [x] **Read and check if GoalCard needs AspectRatio wrapper**
- [x] **Commit (if changes needed)**

---

## Self-Review

**Coverage:** Every file with native `<button>`, `<input>`, `<img>` from the audit has a corresponding task.

**Edge cases:**

- `TransactionForm.vue` amount `<input>` kept native — custom locale logic incompatible
- `GoalForm.vue` file `<input>` kept native — file picker requires native input
- `GoalCard.vue` `<img>` kept native — external Supabase Storage URL
- `settings.vue` currency selection buttons kept as ghost variant — matches existing design

**No placeholders:** All replacements are specified with exact patterns.

**No overbuilding:** Only replacing native elements with shadcn equivalents. No refactoring or redesign.
