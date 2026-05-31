<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from './layouts/default.vue'
import BlankLayout from './layouts/blank.vue'

const route = useRoute()

const layout = computed(() => {
  if (route.meta.layout === 'blank') {
    return BlankLayout
  }
  return DefaultLayout
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
