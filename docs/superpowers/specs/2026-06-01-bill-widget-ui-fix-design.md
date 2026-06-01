# Design Specification: Bill Widget UI Fix

## Overview
Improve the "TAGIHAN" (Bills) dashboard widget to fix premature text truncation and cramped spacing. The current implementation uses a single-line layout that limits the space available for bill titles.

## Problem Statement
- Bill titles (e.g., "Wifi Indihome") are truncated too early (e.g., "Wif...").
- Spacing between title, amount, and the "Mark as Paid" button is too tight.
- The UI feels cluttered on smaller containers.

## Proposed Solution: Stacked Layout (Option 1)
Move from a single-line flex row to a two-row stacked layout within each bill item.

### Layout Structure
Each bill item will have a flex-row container, but the main content will be split into two vertical levels:

1. **Top Row (Main Info):**
   - **Left:** Bill Title (`bill.title`). No truncation until it hits the amount.
   - **Right:** Amount (`bill.amount`). Bold and clearly visible.
2. **Bottom Row (Metadata & Actions):**
   - **Left:** Due Date status (e.g., "Due in 9 days"). Small, muted font with color coding (rose for overdue, amber for soon).
   - **Right:** "Mark as Paid" button. Smaller, refined `outline` variant.

### Visual Refinements
- **Icon:** Keep the calendar icon on the far left as a visual anchor.
- **Spacing:** Increase vertical gap between the top and bottom rows.
- **Typography:** Ensure a clear hierarchy between the title (bold) and metadata (regular/muted).

## Implementation Details
- Component: `src/components/BillDashboardWidget.vue`
- Use Tailwind classes: `flex-col`, `justify-between`, `items-center`.
- Ensure the container handles long titles gracefully by using `truncate` only when necessary or allowing wrapping if height permits.

## Verification Plan
- Manual UI check: Verify names are no longer truncated prematurely.
- Manual UI check: Verify the "Mark as Paid" button is still functional.
- Manual UI check: Verify color coding for due dates is still applied correctly.
