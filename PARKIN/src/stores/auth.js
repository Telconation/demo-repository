/**
 * PARKIN Demo — Auth Store (localStorage-based)
 *
 * Drop-in replacement untuk src/stores/auth.js.
 * Tidak ada JWT, tidak ada cookie, tidak ada backend.
 * Session disimpan di localStorage['parkin_session'].
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin         = computed(() => user.value?.role === 'admin')

  // LOGIN
  async function login(credentials) {
    const res = await api.post('/auth/login', credentials)
    user.value = res.user
  }

  // REGISTER
  async function register(data) {
    return api.post('/auth/register', data)
  }

  // LOGOUT
  async function logout() {
    try { await api.post('/auth/logout') } catch {}
    user.value = null
  }

  // FETCH PROFILE
  async function fetchProfile() {
    const res  = await api.get('/users/profile')
    user.value = res.data
    return res.data
  }

  // VALIDATE TOKEN — baca dari localStorage session
  async function validateToken() {
    try {
      const raw = localStorage.getItem('parkin_session')
      if (!raw) return false
      const session = JSON.parse(raw)
      if (!session?.isLoggedIn || !session?.user) return false
      user.value = session.user
      return true
    } catch {
      user.value = null
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    validateToken,
  }
})
