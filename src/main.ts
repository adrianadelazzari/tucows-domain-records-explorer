import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/base.css'
import './assets/styles/utilities.css'

if (import.meta.env.DEV) {
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

createApp(App).mount('#app')
