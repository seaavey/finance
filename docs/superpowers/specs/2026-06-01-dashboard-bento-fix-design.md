# Design Specification: Dashboard Bento Grid Alignment

## Overview
Realign the dashboard's "Bento" grid to fix vertical imbalance. The current layout has a right column (sidebar) that is significantly taller than the left column (chart), creating empty space and a disjointed appearance.

## Problem Statement
- Redundant bill sections: Both "Upcoming Bills" (inline) and `BillDashboardWidget` are displayed.
- Height mismatch: The `ChartsMonthlyBar` container is too short compared to the stacked widgets in the right column.
- Cluttered sidebar: Too many widgets (Bills, Budget, Accounts) are crammed into the 2-column sidebar.

## Proposed Solution: Balanced Bento Layout
Reorganize the grid components to synchronize heights and improve visual flow.

### 1. Unified Billing
- Remove the inline `activeReminders` section from `src/pages/dashboard.vue`.
- Exclusively use the refactored `BillDashboardWidget`.

### 2. Vertical Synchronization
- Increase the height of the Expense Chart container (Left column, `lg:col-span-4`) to better match the height of two widgets in the right column.
- Target height for chart container: `h-[480px]` (adjusted from `h-80`).

### 3. Widget Relocation
- Move the **Quick Accounts** widget from the sidebar to a new position.
- Proposed position: Below the Recent Transactions or as a horizontal strip to distribute weight.
- Alternative: If kept in sidebar, limit the number of items shown to maintain alignment.

### 4. Layout Refinements
- Ensure consistent `gap-4` and `rounded-4xl` across all cards.
- Align "Quick Actions" (Add Transaction, Manage Categories) to be more cohesive with the bottom of the grid.

## Verification Plan
- Visual Check: Ensure the bottom of the chart container aligns closely with the bottom of the sidebar widgets.
- Responsive Check: Verify the layout remains functional on mobile (stacked) and tablet (md) views.
