import { ref, type Ref, onUnmounted } from 'vue'

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking'

export interface UseCameraReturn {
  /** Reactive video stream from camera */
  stream: Ref<MediaStream | null>
  /** Whether camera is currently active */
  isActive: Ref<boolean>
  /** Error message key if camera access fails */
  error: Ref<string | null>
  /** Current facing mode */
  facingMode: Ref<'environment' | 'user'>
  /** Whether the device likely has a camera API */
  hasCameraSupport: boolean
  /** Whether the permission query API is available */
  permissionQuerySupported: boolean
  /** Current permission state detected via navigator.permissions.query */
  permissionState: Ref<CameraPermissionState>
  /** Whether we are checking permission right now */
  permissionLoading: Ref<boolean>
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
  /** Proactively check camera permission without starting the stream */
  checkPermission: () => Promise<CameraPermissionState>
  /** Reset error state so the user can retry */
  clearError: () => void
}

/**
 * Camera composable using navigator.mediaDevices.getUserMedia.
 *
 * Provides reactive state for live preview, snapshot capture,
 * camera toggling (front / rear), and proactive permission detection
 * via navigator.permissions.query.
 *
 * Permission detection improves UX on Android Chrome and other mobile
 * browsers by surfacing the permanent "denied" state early so we can
 * show recovery instructions instead of a generic error.
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
  const permissionState = ref<CameraPermissionState>('prompt')
  const permissionLoading = ref(false)

  /** Check if the browser supports camera access */
  const hasCameraSupport = !!navigator.mediaDevices?.getUserMedia

  /** Check if the browser supports the Permissions API for camera */
  const permissionQuerySupported = !!navigator.permissions?.query

  /** Internal reference to the video element for capture */
  let videoElement: HTMLVideoElement | null = null

  /** Reference to the PermissionStatus object so we can remove the listener on unmount */
  let permissionStatus: PermissionStatus | null = null

  /**
   * Register a video element so `captureImage` can draw from it.
   * Called by the CameraCapture component on mount.
   */
  function setVideoElement(el: HTMLVideoElement | null) {
    videoElement = el
  }

  /**
   * Proactively check camera permission without starting the stream.
   *
   * Uses navigator.permissions.query({ name: 'camera' }) to detect
   * whether the user has permanently granted or denied camera access.
   *
   * - 'granted'  → camera can be started immediately (skip the start button)
   * - 'prompt'   → permission has not been asked yet (show start button)
   * - 'denied'   → user permanently blocked camera (show recovery UI)
   * - 'unsupported' → Permission API not available (fall back to old flow)
   */
  async function checkPermission(): Promise<CameraPermissionState> {
    permissionLoading.value = true

    if (!navigator.permissions?.query) {
      permissionState.value = 'unsupported'
      permissionLoading.value = false
      return 'unsupported'
    }

    try {
      // Clean up previous listener before creating a new one
      if (permissionStatus) {
        permissionStatus.onchange = null
      }

      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      permissionStatus = result
      const state = result.state as CameraPermissionState

      permissionState.value = state

      // Listen for future changes (e.g. user changes it in browser settings)
      result.onchange = () => {
        permissionState.value = result.state as CameraPermissionState
      }

      permissionLoading.value = false
      return state
    } catch {
      // navigator.permissions.query({ name: 'camera' }) can throw
      // on some browsers that don't support the 'camera' permission name.
      permissionState.value = 'unsupported'
      permissionLoading.value = false
      return 'unsupported'
    }
  }

  /**
   * Start the camera stream.
   */
  async function startCamera(facingModeOverride?: 'environment' | 'user'): Promise<void> {
    // Clean up any previous stream
    stopCamera()
    clearError()

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

      // After a successful getUserMedia call, sync the permission state
      if (permissionQuerySupported) {
        permissionState.value = 'granted'
      }

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

      // Guard: reject if video has no decoded frame yet
      if (el.videoWidth === 0 || el.videoHeight === 0) {
        reject(new Error('Video not ready — no frame available'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = el.videoWidth
      canvas.height = el.videoHeight
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

  /** Reset error state so the user can retry */
  function clearError(): void {
    error.value = null
  }

  /**
   * Map getUserMedia errors to user-facing keys.
   *
   * On Android Chrome:
   * - First denial → NotAllowedError (state sticks as 'denied' in permissions API)
   * - Subsequent attempts also throw NotAllowedError without prompting
   * - The only fix is navigating to browser site settings
   */
  function getErrorMessage(err: unknown): string {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          // If we already know permission is permanently denied, use the
          // stronger "blocked" message with recovery instructions.
          if (permissionState.value === 'denied') {
            return 'camera_error_blocked'
          }
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
    if (permissionStatus) {
      permissionStatus.onchange = null
      permissionStatus = null
    }
  })

  return {
    stream,
    isActive,
    error,
    facingMode,
    hasCameraSupport,
    permissionQuerySupported,
    permissionState,
    permissionLoading,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    setVideoElement,
    checkPermission,
    clearError,
  }
}
