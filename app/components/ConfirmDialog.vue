<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  }>(),
  {
    title: 'Konfirmasi',
    description: 'Apakah kamu yakin?',
    confirmText: 'Hapus',
    cancelText: 'Batal',
    variant: 'destructive',
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
}>();
</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="emit('update:open', false)">{{ cancelText }}</AlertDialogCancel>
        <AlertDialogAction
          :class="variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90' : ''"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
