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
    // Non-blocking CSS: load stylesheets without blocking render
    {
      name: 'non-blocking-css',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
          `<link rel="stylesheet" href="$1" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>`,
        );
      },
    },
    Pages({
      dirs: 'src/pages',
    }),
    AutoImport({
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
      dirs: ['src/components'],
      deep: true,
      dts: 'src/components.d.ts',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@unovis')) return 'vendor-unovis';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
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
