import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import router from './router'
import App from './App.vue'
import './plugins/icons.js'
import './style.css'

// ── Demo Init ─────────────────────────────────────────────────────────────────
import { seedDemoData } from './utils/demoData.js'
seedDemoData() // Seed localStorage jika belum ada data

// ── App Bootstrap ─────────────────────────────────────────────────────────────
const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

// Init theme sebelum mount (prevents FOUC)
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.init()

app.mount('#app')
