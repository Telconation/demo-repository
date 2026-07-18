<template>
  <div class="min-h-screen flex items-start sm:items-center justify-center py-6 px-4 relative overflow-y-auto"
       :style="{ background: 'var(--login-bg)' }">
    <!-- Background pattern -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/5"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl"></div>
    </div>

    <!-- Login Card -->
    <div class="card-glass max-w-md w-full space-y-3 relative z-10 my-auto">
      <!-- Theme Toggle -->
      <div class="flex justify-end">
        <button @click="themeStore.toggle()" class="p-2 rounded-xl transition-all" style="background: var(--surface-bg);">
          <font-awesome-icon :icon="themeStore.isDark ? ['fas', 'sun'] : ['fas', 'moon']" />
        </button>
      </div>

      <!-- Logo -->
      <div class="text-center">
        <img src="../assets/Logo.png" alt="PARKIN" class="mx-auto w-auto object-contain" />
        <p class="text-sm" style="color: var(--surface-muted);">Login untuk melanjutkan</p>
      </div>

      <!-- Demo Credentials Box -->
      <div class="rounded-xl p-3 text-xs space-y-1.5" style="background: var(--surface-bg); border: 1px dashed var(--surface-border);">
        <p class="font-bold text-center mb-2" style="color: var(--surface-muted);">
          <font-awesome-icon :icon="['fas', 'user-lock']" class="mr-1" /> Akun Demo
        </p>
        <div class="flex justify-between items-center my-2">
          <span style="color: var(--surface-muted);">
              <font-awesome-icon :icon="['fas', 'user-tie']" class="mr-1" />
            Admin</span>
          <button @click="fillAdmin" class="font-mono px-2 py-0.5 rounded-lg cursor-pointer transition-all hover:opacity-80"
                  style="background: var(--surface-border); color: var(--surface-text);">
            admin / demo123
          </button>
        </div>
        <div class="flex justify-between items-center py-2">
          <span style="color: var(--surface-muted);">
          <font-awesome-icon :icon="['fas', 'user-shield']" class="mr-1"/>  Security
          </span>
          <button @click="fillSecurity" class="font-mono px-2 py-0.5 rounded-lg cursor-pointer transition-all hover:opacity-80"
                  style="background: var(--surface-border); color: var(--surface-text);">
            security / demo123
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Username</label>
          <input v-model="form.username" type="text" class="input text-base py-3"
                 placeholder="Masukkan username" required autocomplete="username" />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style="color: var(--surface-muted);">Password</label>
          <input v-model="form.password" type="password" class="input text-base py-3"
                 placeholder="Masukkan password" required autocomplete="current-password" />
        </div>

        <button type="submit" class="btn btn-primary w-full py-3.5 text-base" :disabled="loading">
          <font-awesome-icon v-if="loading" :icon="['fas', 'spinner']" spin class="mr-1" />
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>

        <p v-if="error" class="text-status-danger text-sm text-center bg-status-danger/10 rounded-lg py-2 px-3">
          {{ error }}
        </p>

        <p class="text-center text-sm pt-1" style="color: var(--surface-muted);">
          Belum punya akun?
          <router-link to="/register" class="text-brand-primary-light hover:underline font-medium">
            Daftar disini
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useParkingStore } from '../stores/parking'
import { useThemeStore } from '../stores/theme'

const router       = useRouter()
const authStore    = useAuthStore()
const parkingStore = useParkingStore()
const themeStore   = useThemeStore()

const form    = ref({ username: '', password: '' })
const loading = ref(false)
const error   = ref('')

// Quick-fill buttons
function fillAdmin()    { form.value = { username: 'admin',    password: 'demo123' } }
function fillSecurity() { form.value = { username: 'security', password: 'demo123' } }

async function handleLogin() {
  loading.value = true
  error.value   = ''
  try {
    await authStore.login(form.value)
    await authStore.fetchProfile()
    parkingStore.connectWebSocket()
    router.push('/dashboard/home')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
