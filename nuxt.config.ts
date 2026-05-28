import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/styles/global.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@hugeicons/core-free-icons',
        '@hugeicons/vue',
        '@internationalized/date',
        '@supabase/supabase-js',
        '@vueuse/core',
        'chart.js',
        'class-variance-authority',
        'clsx',
        'exceljs',
        'reka-ui',
        'reka-ui/date',
        'sortablejs',
        'sortablejs-vue3',
        'tailwind-merge',
        'vue-chartjs',
      ],
    },
    plugins: [tailwindcss()],
  },
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/icon',
  ],
  i18n: {
    langDir: 'locales',
    defaultLocale: 'id',
    locales: [
      { code: 'id', iso: 'id-ID', file: 'id.json', name: 'Indonesia' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
    ],
  },
  ogImage: {
    zeroRuntime: true,
  },
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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