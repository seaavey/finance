<template>
  <footer class="border-t border-border/40 px-6 py-6">
    <div class="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-bold tracking-tight">Finance</span>
        <span class="text-xs text-muted-foreground">{{ $t('landing.footer_text') }}</span>
      </div>
      <p class="text-xs text-muted-foreground">
        &copy; {{ new Date().getFullYear() }} Finance. All rights reserved.
      </p>
    </div>
  </footer>
</template>