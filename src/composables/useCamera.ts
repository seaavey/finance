import { ref, type Ref, onUnmounted } from 'vue'

export interface UseCameraReturn {
  /** Reactive video stream from camera */
  stream: Ref<MediaStream | null>
  /** Whether camera is currently active */
  isActive: Ref<boolean>
  /** Error message if camera access fails */
  error: Ref<string | null>
  /** Current facing mode */
  facingMode: Ref<'environment' | 'user'>
  /** Whether the device likely has a camera */
  hasCameraSupport: Ref<boolean>
  /** Start the camera. facingMode overrides the current setting. */
  startCamera: (facingModeOverride?: 'environment' | 'user') => Promise<void>
  /** Stop the camera and release all tracks */
  stopCamera: () => void
  /** Capture a single frame as a JPEG Blob */
  captureImage: () => Promise<Blob>
  /** Toggle between front and rear camera */
  switchCamera: () => Promise<void>
  /** Register the <video> element for capture (set by the component) */
  setVideoElement: (el: HTMLVideoElement | null) => void
}

/**
 * Camera composable using navigator.mediaDevices.getUserMedia.
 *
 * Provides reactive state for live preview, snapshot capture,
 * and camera toggling (front / rear).
 *
 * @example
 * ```ts
 * const { stream, isActive, error, startCamera, stopCamera, captureImage } = useCamera()
 * await startCamera()
 * // <video :srcObject="stream" autoplay />
 * const blob = await captureImage()
 * const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' })
 * ```
 */
export function useCamera(): UseCameraReturn {
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<string | null>(null)
  const facingMode = ref<'environment' | 'user'>('environment')

  /** Check if the browser supports camera access */
  const hasCameraSupport = ref(!!navigator.mediaDevices?.getUserMedia)

  /** Internal reference to the video element for capture */
  let videoElement: HTMLVideoElement | null = null

  /**
   * Register a video element so `captureImage` can draw from it.
   * Called by the CameraCapture component on mount.
   */
  function setVideoElement(el: HTMLVideoElement | null) {
    videoElement = el
  }

  /**
   * Start the camera stream.
   */
  async function startCamera(facingModeOverride?: 'environment' | 'user'): Promise<void> {
    // Clean up any previous stream
    stopCamera()
    error.value = null

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'camera_error_unsupported'
      return
    }

    if (facingModeOverride) {
      facingMode.value = facingModeOverride
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode.value,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      stream.value = mediaStream
      isActive.value = true

      // Auto-attach to a video element if it was registered
      if (videoElement) {
        videoElement.srcObject = mediaStream
      }
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      isActive.value = false
    }
  }

  /**
   * Stop the camera and release all tracks.
   */
  function stopCamera(): void {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    if (videoElement) {
      videoElement.srcObject = null
    }
    isActive.value = false
  }

  /**
   * Capture the current video frame as a JPEG Blob.
   * Must be called while the camera is active and a video element is connected.
   */
  function captureImage(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const el = videoElement
      if (!el || !stream.value) {
        reject(new Error('Camera is not active'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = el.videoWidth || 1920
      canvas.height = el.videoHeight || 1080
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'))
        return
      }

      // Draw the current video frame
      ctx.drawImage(el, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.85,
      )
    })
  }

  /**
   * Toggle between front and rear camera.
   */
  async function switchCamera(): Promise<void> {
    const next = facingMode.value === 'environment' ? 'user' : 'environment'
    facingMode.value = next
    await startCamera(next)
  }

  /**
   * Map getUserMedia errors to user-facing keys.
   */
  function getErrorMessage(err: unknown): string {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          return 'camera_error_not_allowed'
        case 'NotFoundError':
          return 'camera_error_not_found'
        case 'NotReadableError':
          return 'camera_error_busy'
        case 'OverconstrainedError':
          return 'camera_error_constraint'
        default:
          return 'camera_error_generic'
      }
    }
    return 'camera_error_generic'
  }

  // Clean up on unmount
  onUnmounted(() => {
    stopCamera()
  })

  return {
    stream,
    isActive,
    error,
    facingMode,
    hasCameraSupport,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    setVideoElement,
  }
}
