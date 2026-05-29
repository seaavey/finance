# Login Page Redesign & Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the login page to follow the dashboard's card-focused style and move its route to `/auth/login`.

**Architecture:** Move the existing login page to a new directory for nested routing. Update the template to use a centered card layout with themed components (`Button`, `Icon`) and standard CSS classes for consistency with the dashboard.

**Tech Stack:** Nuxt 3, Tailwind CSS, Shadcn UI (Button), i18n, Hugeicons.

---

### Task 1: Move File and Update Routing

**Files:**

- Create: `app/pages/auth/login.vue`
- Delete: `app/pages/login.vue`

- [ ] **Step 1: Create the new directory**

Run: `mkdir -p app/pages/auth`

- [ ] **Step 2: Move the file to the new location**

Run: `mv app/pages/login.vue app/pages/auth/login.vue`

- [ ] **Step 3: Verify the route change**

Run: `ls app/pages/auth/login.vue`
Expected: File exists at the new path. (Manual check in browser at `/auth/login` after dev server starts).

- [ ] **Step 4: Commit**

```bash
git add app/pages/login.vue app/pages/auth/login.vue
git commit -m "refactor: move login page to /auth/login"
```

### Task 2: Implement Base Card Layout

**Files:**

- Modify: `app/pages/auth/login.vue`

- [ ] **Step 1: Update the template to use a centered card**

Replace the current template with the base card structure.

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <!-- Content will go here -->
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/auth/login.vue
git commit -m "ui: implement base card layout for login page"
```

### Task 3: Redesign Header Section

**Files:**

- Modify: `app/pages/auth/login.vue`

- [ ] **Step 1: Add the themed header inside the card**

Update the card content to include the icon and title.

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="hugeicons:wallet-01" :size="24" class="text-primary" />
          </div>
          <h1 class="font-heading text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ $t('auth.login_subtitle') }}
          </p>
        </div>

        <!-- Button section will go here -->
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/auth/login.vue
git commit -m "ui: add themed header to login card"
```

### Task 4: Redesign Action and Footer Section

**Files:**

- Modify: `app/pages/auth/login.vue`

- [ ] **Step 1: Add the Google login button and footer link**

```vue
<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div class="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon name="hugeicons:wallet-01" :size="24" class="text-primary" />
          </div>
          <h1 class="font-heading text-2xl font-bold tracking-tight text-foreground">
            {{ $t('auth.login_title') }}
          </h1>
          <p class="mt-2 text-sm text-muted-foreground">
            {{ $t('auth.login_subtitle') }}
          </p>
        </div>

        <div class="mt-8">
          <Button class="w-full gap-2 rounded-xl" size="lg" @click="signInWithGoogle">
            <Icon name="hugeicons:google" :size="20" />
            {{ $t('auth.login_google') }}
          </Button>
        </div>
      </div>

      <p class="text-center">
        <NuxtLinkLocale
          to="/"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ $t('auth.back') }}
        </NuxtLinkLocale>
      </p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/auth/login.vue
git commit -m "ui: add login action and footer to login page"
```

### Task 5: Final Review and Cleanup

**Files:**

- Modify: `app/pages/auth/login.vue`

- [ ] **Step 1: Ensure all imports and script setup are correct**

The script section should remain as it was in the old file, just ensuring imports are clean.

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button';

definePageMeta({ layout: 'blank' });

const { signInWithGoogle } = useAuth();
</script>
```

- [ ] **Step 2: Final Verification**

Check the final structure of the file.

- [ ] **Step 3: Commit**

```bash
git add app/pages/auth/login.vue
git commit -m "chore: final cleanup of login page"
```
