import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/styles/global.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
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
        'vue-chartjs',
      ],
    },
    plugins: [tailwindcss()],
  },
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  shadcn: {
    prefix: '',
  },
  i18n: {
    locales: [
      { code: 'id', language: 'id', name: 'Bahasa Indonesia', file: 'id.json' },
      { code: 'ms', language: 'ms', name: 'Bahasa Melayu', file: 'ms.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'id',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      redirectOn: 'root',
    },
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },
});