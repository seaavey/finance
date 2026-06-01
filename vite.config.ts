import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import type { LogLevel, RolldownLog } from 'rolldown'
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
      exclude: ['**/*.spec.*', '**/*.test.*', '**/__tests__/**'],
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]dist[\\/]/],
      imports: [
        'vue',
        'vue-router',
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
      include: [/\.vue$/, /\.vue\?vue/],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]dist[\\/]/],
      dirs: ['src/components'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        entryFileNames: '[hash:12].js',
        chunkFileNames: '[hash:12].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const match = id.match(/[\\/]node_modules[\\/]((?:@[^\\/]+[\\/])?[^\\/]+)[\\/]/)
            if (match) {
              const pkg = match[1].replace('/', '-')
              return `vendor-${pkg}`
            }
          }
        },
      },
      onLog(level: LogLevel, log: RolldownLog) {
        if (log.code === 'INVALID_ANNOTATION' && log.message.includes('@vueuse/core')) {
          return
        }
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['@unovis/vue', '@unovis/ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
