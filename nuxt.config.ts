import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/styles/global.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteUrl: '',
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@hugeicons/core-free-icons',
        '@hugeicons/vue',
        '@supabase/supabase-js',
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'class-variance-authority',
        'clsx',
        'reka-ui',
        'tailwind-merge',
        'sortablejs-vue3',
        'sortablejs',
        'chart.js',
        'exceljs',
        'vue-chartjs',
      ],
    },
    plugins: [tailwindcss()],
  },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode', '@nuxtjs/seo', '@nuxtjs/i18n', '@nuxt/fonts'],
  i18n: {
    langDir: 'locales',
    defaultLocale: 'id',
    locales: [
      { code: 'id', iso: 'id-ID', file: 'id.json', name: 'Indonesia' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
    ],
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://seaavey.site',
    name: 'Finance',
    description: 'Catat keuangan sendiri atau bareng pasangan. Simpel, cepat, tanpa ribet.',
    defaultLocale: 'id',
  },
  sitemap: {
    zeroRuntime: true,
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  shadcn: {
    prefix: '',
  },
});
