<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
  to: RouteLocationRaw;
}>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="transition-colors hover:text-foreground"
  >
    <slot />
  </NuxtLink>
</template>
