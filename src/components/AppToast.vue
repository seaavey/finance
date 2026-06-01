<script setup lang="ts">
import { useToast } from '@/composables/useToast';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const { register } = useToast();
const toasts = ref<Toast[]>([]);
let counter = 0;

const addToast = (message: string, type: ToastType = 'info') => {
  const id = ++counter;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3000);
};

onMounted(() => {
  register(addToast);
});

const iconMap = {
  success: 'hugeicons:checkmark-circle-02',
  error: 'hugeicons:cancel-circle',
  info: 'hugeicons:information-circle',
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

defineExpose({ addToast });
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-9999 flex flex-col gap-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-4"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm"
          :class="colorMap[t.type]"
        >
          <AppIcon :name="iconMap[t.type]" :size="18" />
          <span class="text-sm font-medium">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
