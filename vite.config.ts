import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import Pages from 'vite-plugin-pages'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    Pages({
      dirs: 'src/pages',
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@unhead/vue': ['useHead', 'useSeoMeta'],
          '@vueuse/core': ['useWindowScroll', 'useStorage', 'useDark', 'useToggle'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables', 'src/lib'],
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
  ],
  optimizeDeps: {
    include: ['@unovis/vue', '@unovis/ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
