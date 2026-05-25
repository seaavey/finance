# Dashboard UI/UX Redesign

## Overview
Complete visual redesign of the finance dashboard to achieve a premium modern fintech aesthetic inspired by Linear, Stripe, and Vercel.

## Design Tokens
All colors use existing shadcn-vue CSS variables (dark mode). No hardcoded colors.
- Background: `bg-background` (`oklch(0.141 0.005 285.823)`)
- Cards: `bg-card` + `border-border` + `rounded-2xl`
- Sidebar: `bg-sidebar` + `border-sidebar-border`
- Typography: Inter font (replacing DM Sans + JetBrains Mono)

## Components

### 1. AppSidebar.vue
- Sticky/full-height sidebar layout
- Logo section with `bg-sidebar-primary` icon
- Section labels: "Menu" and "Lainnya" (`text-xs uppercase tracking-wider text-sidebar-foreground/40`)
- Nav items with active indicator: left border `border-l-2 border-sidebar-primary` + `bg-sidebar-accent`
- Hover: `hover:bg-sidebar-accent hover:text-sidebar-foreground` with 150ms transition
- Profile section at bottom: clickable trigger with chevron icon
- Profile dropdown: popover with Settings (navigate to `/settings`) and Logout (destructive color)
- Nav scrollable with `overflow-y-auto min-h-0`

### 2. AppTopbar.vue
- Sticky: `sticky top-0 z-30 bg-background/80 backdrop-blur-sm`
- Left: hamburger (mobile only) + page title
- Right group (gap-2):
  - Search bar: `border border-border bg-card rounded-lg px-3 py-1.5 w-48` with ⌘K badge
  - Notification bell: icon button with red dot indicator
  - Theme toggle: single button cycling dark/system/light
  - Quick action primary button: `bg-primary text-primary-foreground` → navigates to `/transactions/new`
- No profile in topbar (profile moved to sidebar dropdown)

### 3. Dashboard Stats Cards
- 3-column grid: `grid grid-cols-1 md:grid-cols-3 gap-3`
- Each card: `bg-card border border-border rounded-2xl p-4`
- Icon container: 36x36 rounded-xl with tinted background (`rgba(color, 0.1)`)
- Trend percentage badge: pill-shaped `rounded-full px-2 py-0.5 text-xs font-semibold`
- Balance card: subtle gradient overlay + blurred orb accent
- Hover: `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`

### 4. Charts Section
- 2-column grid: donut chart (left) + bar chart (right)
- Filter tabs: 7d / 30d / 90d pills, active gets `bg-primary text-primary-foreground`
- Card: `bg-card border border-border rounded-2xl p-4`
- Category legend: colored dot + name + amount, `text-xs`
- Monthly bar chart: stacked bars (green for income, red for expense)

### 5. Transaction List
- Card header: "Transaksi Terakhir" title + "Lihat semua →" link
- Each row: `flex items-center gap-3 p-3 border-b border-border last:border-b-0`
- Icon: 36x36 rounded-xl, green tint for income, red for expense
- Description + metadata row: relative date + category badge
- Category badge: `text-xs px-2 py-0.5 rounded-md font-medium` with category color tint
- Amount: `font-bold text-sm`, green for income, red for expense
- Hover: `hover:bg-accent/50 transition-colors`

### 6. Quick Actions
- 2-column grid compact cards
- Row layout: icon (40x40) + title + description
- Click navigates to respective pages
- Subtle hover lift animation

### 7. Empty States
- Centered illustration placeholder
- Descriptive text
- CTA button to create first transaction

## Responsive Behavior
- Mobile: sidebar slides in as overlay, topbar shows hamburger
- Tablet: same as mobile until md breakpoint
- Desktop: sidebar fixed left, content fills remaining width
- Stats: 1 col mobile → 3 col desktop
- Charts: 1 col mobile → 2 col desktop

## Files to Modify
1. `app/components/AppSidebar.vue` — restructure with profile dropdown
2. `app/components/AppTopbar.vue` — add search, notifications, quick action
3. `app/layouts/default.vue` — verify backdrop blur on topbar
4. `app/pages/dashboard.vue` — update stats, charts, transactions, actions styling
5. `app/styles/global.css` — switch font to Inter, add utility classes
6. `nuxt.config.ts` — update font configuration
