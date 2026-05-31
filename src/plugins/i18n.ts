import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import id from '../locales/id.json';
import en from '../locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: 'id',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    id,
    en,
  },
});

// Inject locales into the global instance so our useI18n mock can find them
// This mimics how Nuxt I18n works
(i18n.global as any).locales = ref([
  { code: 'id', name: 'Indonesia' },
  { code: 'en', name: 'English' }
]);

export default i18n;
