# Design Spec: Bill Reminders

## 1. Goal

Implement a notification system to remind users of upcoming recurring bills 1 day (H-1) and 7 days (H-7) before their due date. This aims to increase user awareness of their financial obligations without automating the payment process.

## 2. Requirements

- **Criteria**: Reminders are triggered only for active `recurring_transactions` of type `expense`.
- **Timing**: Reminders appear exactly when the `next_date` is 1 day or 7 days away from the current date.
- **Visuals**:
  - **Notification Bell**: Show a red badge with the count of active reminders in the top navigation bar.
  - **Dashboard Card**: A new section in the dashboard listing specific upcoming bills.
  - **Toast Notification**: A one-time informational toast when the user opens the app if new reminders are available.
- **Interaction**:
  - "Only Reminder" flow: Reminders do not automatically create transactions. Users must record transactions manually.
  - **Dismissal**: Users can dismiss a toast or notification, which will be stored in `LocalStorage` to prevent repetitive alerts in the same session/day.

## 3. Architecture

### Data Flow

1. `useReminders` composable fetches data from `useRecurring`.
2. Logic filters transactions where `dateDiff(today, next_date)` is 1 or 7.
3. UI components (`AppTopbar`, `Dashboard`) subscribe to the `reminders` state.

### Components

- **`useReminders.ts`**:
  - `reminders`: Computed array of active reminder objects.
  - `dismissedIds`: State for IDs stored in LocalStorage.
  - `checkReminders()`: Logic to compare dates.
- **`AppTopbar.vue`**: Update the notification bell to show the count and a popover list of reminders.
- **`Dashboard.vue`**: Insert a card before or after the account list to show "Upcoming Bills".
- **`App.vue` or `auth.global.ts`**: Trigger initial check and toast on app load.

## 4. Storage & Persistence

- **Dismissed State**: Stored in `localStorage` as a JSON object: `{ "reminder-id-date": true }`.
- Using a combination of `id` and `date` in the key ensures that if a recurring bill moves to the next month, the reminder will appear again.

## 5. Testing Strategy

- **Unit Tests**: Test the date calculation logic in `useReminders`.
- **UI Tests**: Verify that the badge count matches the number of filtered bills.
- **Manual Verification**: Set a recurring transaction's `next_date` to tomorrow and verify the H-1 reminder appears.
