# Design Spec: Premium Fintech Dashboard Redesign

## 1. Goal

Redesign and refactor the `/dashboard` page and supporting components (`Sidebar`, `Topbar`, `Charts`) to achieve a premium, modern SaaS aesthetic inspired by Stripe, Linear, and Vercel.

## 2. Visual Identity

- **Palette**: Zinc/Neutral background, Fuchsia/Pink accents, Emerald success, Rose danger, Cyan info.
- **Surface**: `rounded-2xl` or `rounded-3xl` for cards, `border-border/50` (thin borders), `shadow-sm` with `hover:shadow-md` transitions.
- **Glassmorphism**: Topbar with `backdrop-blur-xl` and `bg-background/80`.
- **Typography**:
  - Balances: `text-3xl` or `text-4xl`, `font-bold`, `tracking-tighter`.
  - Secondary: `text-[10px]` or `text-xs`, `font-medium`, `text-muted-foreground`.

## 3. Architecture & Components

### 3.1. Layout: Bento Grid

The dashboard will use a CSS Grid-based "Bento" layout for desktop:

- **Header**: Greeting + Month picker + Partner toggle.
- **Grid Container**: `grid-cols-1 md:grid-cols-6 gap-4`.
  - **Main Balance (Span 3)**: The primary highlight card. Includes a mini sparkline chart.
  - **Secondary Cards (Span 1 each)**: Income, Expense, Net Worth.
  - **Analytics Area (Span 4)**: Monthly Cashflow Bar Chart.
  - **Side Stats (Span 2)**: Budget Progress & Accounts list.
  - **Bottom List (Span 6)**: Recent Transactions in a clean, high-density table format.

### 3.2. Library Shift: Shadcn Charts (Unovis)

- Migrate from `vue-chartjs` to **Unovis** (integrated via `shadcn-vue` chart components).
- **Styles**:
  - Area gradients for line charts.
  - Zero-border, rounded-top bars.
  - Premium custom tooltips with indicator dots.

### 3.3. Sidebar & Topbar

- **Sidebar**:
  - Active state: `bg-accent` with a high-contrast left indicator or specialized icon color.
  - Grouping: "Main", "Finance", "Personal" sections.
- **Topbar**:
  - Search: Command-style input with `kbd` shortcut visible.
  - Glass effect: Permanent blur on scroll.

## 4. Key Improvements

- **Data Dominance**: Financial values will be significantly larger than labels.
- **Trend Indicators**: Modern "up/down" arrows with pill-shaped background tags.
- **Micro-interactions**: Subtle `scale-95` on click, `hover:-translate-y-1` on main cards.

## 5. Implementation Path (Phased)

1. **Foundation**: Update Tailwind config (if needed) and add Unovis dependencies.
2. **Components**: Refactor `Sidebar` and `Topbar` first to set the frame.
3. **Core Page**: Rewrite `dashboard.vue` template with the new Bento Grid.
4. **Charts**: Implement new Shadcn/Unovis chart components to replace old ones.
5. **Polish**: Add transitions, shadows, and final typography tweaks.

## 6. Self-Review Checklist

- [ ] No generic admin template feel?
- [ ] Visual hierarchy leads eyes to "Saldo Bulan Ini"?
- [ ] Mobile responsiveness maintained?
- [ ] Typography clean and tight?
