import './styles/globals.css'
import { createApp } from 'vue'
import { RouterLink } from 'vue-router'
import { createHead } from '@unhead/vue/client'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import Icon from './components/Icon.vue'
import ClientOnly from './components/ClientOnly.vue'

// Reusable components
import PageHeader from './components/PageHeader.vue'
import EmptyState from './components/EmptyState.vue'
import StatCard from './components/StatCard.vue'
import CurrencyInput from './components/CurrencyInput.vue'
import ListItemAction from './components/ListItemAction.vue'
import StatusBadge from './components/StatusBadge.vue'
import BaseDialog from './components/BaseDialog.vue'

const app = createApp(App)
const head = createHead()

app.use(router)
app.use(i18n)
app.use(head)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  },
})

// Register global components to handle Nuxt-specific tags
app.component('AppIcon', Icon)
app.component('ClientOnly', ClientOnly)
app.component('NuxtLinkLocale', RouterLink)
app.component('NuxtLink', RouterLink)

// Register new reusable components
app.component('PageHeader', PageHeader)
app.component('EmptyState', EmptyState)
app.component('StatCard', StatCard)
app.component('CurrencyInput', CurrencyInput)
app.component('ListItemAction', ListItemAction)
app.component('StatusBadge', StatusBadge)
app.component('BaseDialog', BaseDialog)

app.mount('#app')
