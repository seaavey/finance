<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCamera } from '@/composables/useCamera'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineOptions({
  name: 'CameraCapture',
})

const emit = defineEmits<{
  captured: [file: File]
  close: []
}>()

const { t } = useI18n()

const {
  isActive,
  error: cameraError,
  hasCameraSupport,
  startCamera,
  stopCamera,
  captureImage,
  switchCamera,
  setVideoElement,
} = useCamera()

const open = defineModel<boolean>('open', { required: true })

const videoRef = ref<HTMLVideoElement | null>(null)
const photoCaptured = ref(false)
const previewUrl = ref<string | null>(null)
const capturedBlob = ref<Blob | null>(null)
const flashVisible = ref(false)

/** Open camera when dialog opens, stop when closed */
watch(open, async (val) => {
  if (val) {
    photoCaptured.value = false
    previewUrl.value = null
    capturedBlob.value = null

    await nextTick()
    // Register video element for the composable
    if (videoRef.value) {
      setVideoElement(videoRef.value)
    }
    await startCamera()
  } else {
    stopCamera()
    setVideoElement(null)
  }
})

/** Capture a photo from the video stream */
async function capture() {
  if (!isActive.value) return

  try {
    const blob = await captureImage()
    capturedBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
    photoCaptured.value = true

    // Flash effect
    flashVisible.value = true
    setTimeout(() => {
      flashVisible.value = false
    }, 200)
  } catch {
    // Toast or silent — user can retry
  }
}

/** Revoke the preview blob URL if one exists */
function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

/** Retake — go back to live view */
function retake() {
  revokePreview()
  photoCaptured.value = false
  previewUrl.value = null
  capturedBlob.value = null
}

/** Confirm and emit the captured file */
function confirm() {
  if (!capturedBlob.value) return

  const file = new File([capturedBlob.value], 'receipt.jpg', {
    type: 'image/jpeg',
  })
  revokePreview()
  emit('captured', file)
  open.value = false
}

/** Close handler */
function handleClose() {
  revokePreview()
  open.value = false
  emit('close')
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogTitle class="sr-only">{{ t('transaction_form.scan_receipt') }}</DialogTitle>
    <DialogContent
      class="sm:max-w-lg p-0 overflow-hidden rounded-3xl border-border/50"
      :show-close-button="false"
    >
      <!-- Unsupported: no camera support -->
      <div v-if="!hasCameraSupport" class="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div class="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <AppIcon name="hugeicons:camera-off-01" :size="28" class="text-muted-foreground" />
        </div>
        <p class="font-bold text-foreground">{{ t('transaction_form.camera_error_unsupported') }}</p>
        <Button variant="secondary" class="rounded-2xl" @click="handleClose">
          {{ t('transaction_form.cancel') }}
        </Button>
      </div>

      <!-- Camera live preview -->
      <div v-else-if="!photoCaptured" class="relative aspect-[4/3] w-full bg-black">
        <!-- Video element -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="h-full w-full object-cover"
          :class="{ hidden: !isActive && !cameraError }"
        />

        <!-- Loading state -->
        <div
          v-if="!isActive && !cameraError"
          class="absolute inset-0 flex items-center justify-center bg-black/60"
        >
          <AppIcon name="hugeicons:loading-03" :size="32" class="animate-spin text-white" />
        </div>

        <!-- Camera error -->
        <div
          v-if="cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-8 text-center"
        >
          <AppIcon name="hugeicons:camera-off-01" :size="32" class="text-white/60" />
          <p class="font-bold text-white">{{ t('transaction_form.' + cameraError) }}</p>
          <Button variant="secondary" class="rounded-2xl" @click="handleClose">
            {{ t('transaction_form.cancel') }}
          </Button>
        </div>

        <!-- Flash overlay -->
        <div
          v-if="flashVisible"
          class="pointer-events-none absolute inset-0 bg-white/80 transition-opacity duration-150"
        />

        <!-- Top bar -->
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Button variant="ghost" size="icon-sm" class="rounded-full bg-black/40 text-white hover:bg-black/60" @click="handleClose">
            <AppIcon name="hugeicons:cancel-01" :size="20" />
          </Button>
          <span class="rounded-full bg-black/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
            {{ t('transaction_form.scan_receipt') }}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            class="rounded-full bg-black/40 text-white hover:bg-black/60"
            :disabled="!isActive"
            @click="switchCamera"
          >
            <AppIcon name="hugeicons:flip-camera" :size="20" />
          </Button>
        </div>

        <!-- Bottom capture button -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-center p-6">
          <button
            class="flex size-16 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            :disabled="!isActive"
            @click="capture"
          >
            <div class="size-12 rounded-full bg-white" />
          </button>
        </div>
      </div>

      <!-- Captured photo preview -->
      <div v-else class="relative aspect-[4/3] w-full bg-black">
        <img
          :src="previewUrl!"
          alt="Captured receipt"
          class="h-full w-full object-contain"
        />

        <!-- Top bar in preview -->
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Button variant="ghost" size="icon-sm" class="rounded-full bg-black/40 text-white hover:bg-black/60" @click="handleClose">
            <AppIcon name="hugeicons:cancel-01" :size="20" />
          </Button>
          <span class="rounded-full bg-black/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
            {{ t('transaction_form.camera_preview') }}
          </span>
          <div class="size-9" />
        </div>

        <!-- Bottom action buttons -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 p-6">
          <Button
            variant="ghost"
            class="rounded-2xl bg-black/40 px-6 font-black uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black/60"
            @click="retake"
          >
            <div class="flex items-center gap-2">
              <AppIcon name="hugeicons:refresh-01" :size="16" />
              {{ t('transaction_form.camera_retake') }}
            </div>
          </Button>
          <Button
            class="rounded-2xl bg-primary px-8 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
            @click="confirm"
          >
            <div class="flex items-center gap-2">
              <AppIcon name="hugeicons:tick-01" :size="16" />
              {{ t('transaction_form.camera_use') }}
            </div>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
