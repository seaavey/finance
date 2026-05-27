<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md gap-0 p-0">
      <DialogTitle class="sr-only">Scan Receipt</DialogTitle>
      <DialogDescription class="sr-only"
        >Upload or take a photo of your receipt to auto-fill transaction data</DialogDescription
      >

      <div v-if="!preview" class="p-8">
        <div class="flex flex-col items-center gap-6 text-center">
          <div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <HugeiconsIcon :icon="Camera01Icon" :size="28" class="text-primary" />
          </div>
          <div>
            <p class="font-semibold text-foreground">Scan Receipt</p>
            <p class="mt-1 text-sm text-muted-foreground">Take a photo or upload a receipt image</p>
          </div>
          <label
            class="flex cursor-pointer items-center gap-2 rounded-2xl bg-linear-to-b from-pink-500 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-pink-500/25 transition hover:from-pink-400 hover:to-pink-500"
          >
            <HugeiconsIcon :icon="Camera01Icon" :size="18" />
            <span>{{ ocrLoading ? 'Scanning...' : 'Take Photo' }}</span>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="onFileChange"
            />
          </label>
        </div>
      </div>

      <div v-else class="flex flex-col">
        <div class="relative">
          <img :src="preview" alt="Receipt" class="max-h-64 w-full object-contain bg-muted/20" />
          <div
            v-if="ocrLoading"
            class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80"
          >
            <div
              class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            />
            <p class="text-sm text-muted-foreground">{{ ocrStatus }} ({{ ocrProgress }}%)</p>
          </div>
        </div>

        <div class="flex gap-2 p-4">
          <Button variant="outline" class="flex-1 rounded-xl" @click="reset">
            {{ $t('transaction_form.cancel') }}
          </Button>
          <Button
            v-if="!ocrLoading"
            class="flex-1 rounded-xl bg-linear-to-b from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25 hover:from-pink-400 hover:to-pink-500"
            @click="confirm"
          >
            Use This Photo
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Camera01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/vue';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const emit = defineEmits<{
  scanned: [
    data: { receiptFile: File; total: number | null; date: string | null; description: string },
  ];
}>();

const open = defineModel<boolean>('open', { default: false });

const fileInputRef = ref<HTMLInputElement | null>(null);
const preview = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const ocrProgress = ref(0);
const ocrStatus = ref('');
const ocrLoading = ref(false);
const scanResult = ref<{ total: number | null; date: string | null; description: string } | null>(
  null,
);

const { scanReceipt, progress, status, loading } = useOcr();

watch(progress, (v) => {
  ocrProgress.value = v;
});
watch(status, (v) => {
  ocrStatus.value = v;
});
watch(loading, (v) => {
  ocrLoading.value = v;
});

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) {
    return;
  }

  selectedFile.value = file;
  preview.value = URL.createObjectURL(file);

  const result = await scanReceipt(file);
  if (result) {
    scanResult.value = result;
  }
};

const confirm = () => {
  if (!selectedFile.value) {
    return;
  }
  emit('scanned', {
    receiptFile: selectedFile.value,
    ...scanResult.value!,
  });
  open.value = false;
  reset();
};

const reset = () => {
  preview.value = null;
  selectedFile.value = null;
  scanResult.value = null;
  ocrProgress.value = 0;
  ocrStatus.value = '';
  ocrLoading.value = false;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

watch(open, (val) => {
  if (!val) {
    reset();
  }
});
</script>
