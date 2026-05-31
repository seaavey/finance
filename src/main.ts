import './styles/globals.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { RouterLink } from 'vue-router'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import Icon from './components/Icon.vue'
import ClientOnly from './components/ClientOnly.vue'

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(head)

// Register global components to handle Nuxt-specific tags
app.component('Icon', Icon)
app.component('ClientOnly', ClientOnly)
app.component('NuxtLinkLocale', RouterLink)
app.component('NuxtLink', RouterLink)

app.mount('#app')
