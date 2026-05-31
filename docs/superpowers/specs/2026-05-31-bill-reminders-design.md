# Design Specification: Bill Reminders Feature

## Overview

This feature introduces proactive bill tracking and management to the Aemy Finance application, helping users avoid missed payments. It integrates a dashboard widget, a dedicated calendar view, and proactive toast notifications.

## Components

1.  **Database (`bills` table):**
    - `id` (uuid, pk)
    - `user_id` (uuid, fk)
    - `title` (text)
    - `amount` (numeric)
    - `due_date` (date)
    - `is_paid` (boolean, default: false)
    - `recurrence` (text: 'none', 'weekly', 'monthly')

2.  **Frontend:**
    - `DashboardWidget.vue`: Displays upcoming bills (due in < 7 days).
    - `BillsPage.vue`: Dedicated calendar view using `shadcn-vue/calendar`.
    - `NotificationSystem`: Logic in `App.vue` or a dedicated composable to trigger `AppToast` for bills due today.

## Implementation Steps

1.  Add `bills` table to Supabase.
2.  Implement `useBills` composable for API interaction.
3.  Create `DashboardWidget.vue`.
4.  Create `BillsPage.vue`.
5.  Implement notification logic.

## Self-Review

- [ ] Placeholders: None identified.
- [ ] Consistency: Architecture aligns with existing Supabase/Vue patterns.
- [ ] Scope: Well-defined MVP.
- [ ] Ambiguity: None identified.
