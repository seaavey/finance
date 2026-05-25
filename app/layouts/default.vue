<template>
  <div class="flex min-h-screen">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-1 flex-col">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-3 md:p-4 overflow-y-auto">
        <slot />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 md:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false);
</script>
