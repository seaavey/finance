<template>
  <header class="flex h-14 items-center justify-between border-b border-border bg-background px-4">
    <div class="flex items-center gap-3">
      <button
        class="rounded-lg p-1.5 text-muted-foreground hover:bg-accent md:hidden"
        @click="$emit('toggleSidebar')"
      >
        <HugeiconsIcon :icon="Menu02Icon" :size="22" />
      </button>
      <h1 class="text-sm font-semibold text-foreground">{{ pageTitle }}</h1>
    </div>

    <ClientOnly>
      <DropdownMenu v-if="user">
        <DropdownMenuTrigger as-child>
          <button class="flex items-center gap-2 rounded-lg p-1 hover:bg-accent">
            <Avatar class="size-8">
              <AvatarImage v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user.user_metadata?.full_name" />
              <AvatarFallback class="text-xs font-medium">{{ user.user_metadata?.full_name?.charAt(0) ?? '?' }}</AvatarFallback>
            </Avatar>
            <span class="hidden text-sm font-medium md:block">{{ user.user_metadata?.full_name }}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium">{{ user.user_metadata?.full_name }}</p>
              <p class="text-xs text-muted-foreground">{{ user.email }}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="navigateTo('/')">
            <HugeiconsIcon :icon="Home01Icon" :size="16" class="mr-2" />
            {{ $t('nav.dashboard') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="navigateTo('/transactions')">
            <HugeiconsIcon :icon="ArrowDataTransferHorizontalIcon" :size="16" class="mr-2" />
            {{ $t('nav.transactions') }}
          </DropdownMenuItem>
          <DropdownMenuItem @click="navigateTo('/settings')">
            <HugeiconsIcon :icon="Settings01Icon" :size="16" class="mr-2" />
            {{ $t('nav.settings') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel class="text-xs font-normal text-muted-foreground">{{ $t('theme.title') }}</DropdownMenuLabel>
          <DropdownMenuItem @click="setColorMode('light')">
            <HugeiconsIcon :icon="Sun01Icon" :size="16" class="mr-2" />
            {{ $t('theme.light') }}
            <span v-if="colorMode.preference === 'light'" class="ml-auto text-xs text-primary">✓</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="setColorMode('dark')">
            <HugeiconsIcon :icon="Moon01Icon" :size="16" class="mr-2" />
            {{ $t('theme.dark') }}
            <span v-if="colorMode.preference === 'dark'" class="ml-auto text-xs text-primary">✓</span>
          </DropdownMenuItem>
          <DropdownMenuItem @click="setColorMode('system')">
            <HugeiconsIcon :icon="ComputerCheckIcon" :size="16" class="mr-2" />
            {{ $t('theme.system') }}
            <span v-if="colorMode.preference === 'system'" class="ml-auto text-xs text-primary">✓</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive focus:text-destructive" @click="onSignOut">
            <HugeiconsIcon :icon="Logout01Icon" :size="16" class="mr-2" />
            {{ $t('settings.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ClientOnly>
  </header>
</template>

<script setup lang="ts">
import { Menu02Icon, Home01Icon, ArrowDataTransferHorizontalIcon, Settings01Icon, Logout01Icon, Sun01Icon, Moon01Icon, ComputerCheckIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

defineEmits<{
  toggleSidebar: []
}>()

const { user, signOut } = useAuth()
const route = useRoute()
const colorMode = useColorMode()
const { t } = useI18n()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'page_titles.dashboard',
    '/transactions': 'page_titles.transactions',
    '/transactions/new': 'page_titles.add_transaction',
    '/categories': 'page_titles.categories',
    '/todos': 'page_titles.todos',
    '/recurring': 'page_titles.recurring',
    '/settings': 'page_titles.settings',
  }
  return t(titles[route.path] ?? 'page_titles.default')
})

const onSignOut = async () => {
  await signOut()
}

const setColorMode = (mode: string) => {
  colorMode.preference = mode
}
</script>
