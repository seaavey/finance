import { computed, reactive, watch, type Ref } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { useColorMode as useVueUseColorMode, type BasicColorMode } from '@vueuse/core'

interface I18nLocale {
  code: string
  name: string
}

/**
 * Provides i18n helpers compatible with Nuxt's `useI18n` interface.
 * Wraps vue-i18n with type-safe locale, translation, and message utilities.
 *
 * @returns Object with `locale`, `locales`, `t`, `tm`, `rt`, and `setLocale` helpers.
 */
export const useI18n = () => {
  const i18n = useVueI18n()

  // Custom interface for the injected properties on i18n instance
  interface CustomI18n {
    locales?: Ref<I18nLocale[]>
    messages?: Ref<Record<string, Record<string, unknown>>>
  }

  const customI18n = i18n as unknown as CustomI18n

  return {
    locale: i18n.locale,
    // Access the locales we injected in src/plugins/i18n.ts
    locales: computed<I18nLocale[]>(() => customI18n.locales?.value || []),
    t: i18n.t,
    // Mock Nuxt's tm (translate message) and rt (resolve translation)
    tm: (key: string): unknown[] => {
      const messages = customI18n.messages?.value || {}
      const currentMessages = messages[i18n.locale.value] || {}

      const keys = key.split('.')
      let result: unknown = currentMessages

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = (result as Record<string, unknown>)[k]
        } else {
          return [] // Return empty array if not found, common for lists
        }
      }
      return Array.isArray(result) ? result : []
    },
    rt: (val: unknown): string => {
      return typeof val === 'string' ? val : val?.toString() || ''
    },
    setLocale: (code: string) => {
      i18n.locale.value = code
    },
  }
}

/**
 * Returns a no-op path resolver that passes the path through unchanged.
 * Compatibility shim for Nuxt's `useLocalePath`.
 *
 * @returns A function that accepts a path string and returns it as-is.
 */
export const useLocalePath = () => {
  return (path: string) => path
}

// Internal state to act as a singleton
interface ColorModeState {
  preference: string
  value: BasicColorMode | string
  unknown: boolean
}

let colorModeState: ColorModeState | null = null

/**
 * Provides a singleton reactive color mode state backed by vueuse.
 * Syncs preference and value bidirectionally with the underlying `useColorMode`.
 *
 * @returns Reactive object with `preference`, `value`, and `unknown` properties.
 */
export const useColorMode = () => {
  if (!colorModeState) {
    // This will only run when useColorMode is first called inside a component/setup
    const mode = useVueUseColorMode({
      emitAuto: true,
      storageKey: 'vueuse-color-scheme',
    })

    const state = reactive<ColorModeState>({
      preference: mode.value as string,
      value: mode.value as BasicColorMode,
      unknown: false,
    })

    // Sync preference change to actual mode
    watch(
      () => state.preference,
      (newPref) => {
        mode.value = newPref as BasicColorMode
      },
    )

    // Update value when mode changes externally
    watch(mode, (newMode) => {
      state.value = newMode
    })

    // Allow external writes to state.value (e.g. toggle dark/light)
    watch(
      () => state.value,
      (newVal) => {
        if (newVal !== mode.value) {
          mode.value = newVal as BasicColorMode
        }
      },
    )

    colorModeState = state
  }

  return colorModeState
}
