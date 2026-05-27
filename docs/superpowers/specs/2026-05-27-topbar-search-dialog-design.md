# Topbar Search Dialog — Design Spec

> **Approved:** User confirmed dialog + autocomplete approach (command palette style)
> **Status:** Ready for implementation

## Overview

Replace the current functional search input in the topbar with a command-palette-style dialog. Clicking the search bar or pressing ⌘K opens a centered modal with search input and live autocomplete results from transactions.

## Architecture

- **Create:** `app/components/SearchDialog.vue` — the dialog component
- **Modify:** `app/components/AppTopbar.vue` — replace input with trigger button + dialog

## SearchDialog.vue

### UI

- shadcn `Dialog` component (`sm:max-w-xl`, centered)
- Search input at top with search icon, auto-focused on open
- Scrollable results list below (`max-h-80 overflow-y-auto`)
- Each result item: color dot (category) + description + amount (income=green, expense=red) + date
- Keyboard: Arrow Up/Down to navigate, Enter to select, Escape to close
- Dismiss on click outside

### Data Flow

- Separate search fetch that returns `Promise<Transaction[]>` — does NOT update global transactions state
- 300ms debounce on input
- Results fetched from `useTransactions` composable (reuse existing `fetchTransactions` logic, but more targeted)

### Actions

- Click/Enter → `navigateTo('/transactions/{id}/edit')`

## AppTopbar.vue Changes

- Replace `<input>` with a `<button>` styled identically to current search bar
- Click opens `SearchDialog`
- Listen for `⌘K` / `Ctrl+K` keyboard shortcut
- Dialog rendered at end of template

## Files

- Create: `app/components/SearchDialog.vue`
- Modify: `app/components/AppTopbar.vue`
