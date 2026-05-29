# Design Spec: FAQ Accordion UI Fix

## Problem Statement

The current FAQ accordion implementation displays two icons (up and down arrow) simultaneously or misaligned icons, leading to a cluttered and broken UI. The user wants a clean, single-icon approach where the arrow rotates based on the open/closed state.

## Proposed Changes

### 1. `app/components/ui/accordion/AccordionTrigger.vue`

Refactor the base component to use a single icon with CSS-based rotation.

- **Icon**: Use `hugeicons:arrow-down-01` exclusively.
- **Animation**: Add `transition-transform duration-200`.
- **Logic**: Use Tailwind's `group-data-[state=open]/accordion-trigger:rotate-180` to handle the rotation automatically when the accordion state changes.
- **Slot**: Keep the `icon` slot but simplify the default content.

### 2. `app/components/landing/Faq.vue`

Clean up the manual rotation logic that conflicts with the base component.

- Remove `[&[data-state=open]>svg]:rotate-180` from `AccordionTrigger` class.
- Ensure the container uses `flex items-center` for consistent vertical alignment of category icon, question text, and the trigger icon.

## Success Criteria

- Only one arrow icon is visible at all times.
- The arrow icon rotates smoothly (180 degrees) when opening/closing.
- All elements (category icon, text, and arrow) are vertically centered.
- No layout shifts or double icons visible in the UI.

## Testing Plan

- Manually verify the FAQ section on the landing page.
- Check both mobile and desktop views for alignment.
- Verify that clicking the accordion trigger rotates the icon and expands the content correctly.
