---
name: redesign-login-page
description: Redesign login page to match dashboard UI and move route to /auth/login
metadata:
  type: project
---

# Design Spec: Redesign Login Page & Routing Change

## Overview

Redesign the existing login page to align with the application's dashboard visual style (cards, rounded corners, specific iconography) and move the route from `/login` to `/auth/login` for better organization.

## Goals

- Improve visual consistency between the authentication flow and the main application.
- Modernize the login experience using existing UI patterns.
- Restructure routing to follow an `/auth/` prefix.

## Proposed Changes

### 1. Routing & File Structure

- **Move**: `app/pages/login.vue` → `app/pages/auth/login.vue`.
- **Nuxt Auto-routing**: The page will be automatically served at `/auth/login`.

### 2. UI Redesign (Pendekatan 1: Card-Focused)

- **Layout**: Keep using `layout: 'blank'`.
- **Background**: Use `bg-background` for the whole page.
- **Card**:
  - Centered on screen.
  - Style: `bg-card`, `border border-border`, `rounded-2xl`, `shadow-sm`, `p-8`.
  - Max width: `max-w-md`.
- **Header Section**:
  - Icon: `hugeicons:wallet-01` in a small themed box (similar to dashboard cards).
  - Title: `$t('auth.login_title')` in `font-heading text-2xl font-bold`.
  - Subtitle: `$t('auth.login_subtitle')` in `text-sm text-muted-foreground`.
- **Action Section**:
  - Login Button: Google Sign-in button using the `Button` component.
  - Icon: `hugeicons:google`.
  - Style: Full width, consistent padding/rounding.
- **Footer Section**:
  - Back link: `$t('auth.back')` using `NuxtLinkLocale`, styled as a clean text link.

### 3. Technical Implementation

- **Component**: Use `@/components/ui/button`.
- **Icons**: Use `<Icon />` with `hugeicons` set.
- **i18n**: Use `$t` for all displayed text.
- **Composables**: Use `useAuth` for `signInWithGoogle`.

## Success Criteria

- [ ] Navigating to `/auth/login` shows the new design.
- [ ] Navigating to `/login` results in a 404 (or redirect if needed, though not explicitly requested).
- [ ] UI looks consistent with the dashboard's card style.
- [ ] Google login still works as expected.
