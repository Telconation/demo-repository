<template>
  <div class="min-h-screen flex flex-col lg:flex-row">

    <!-- SIDEBAR (Desktop) -->
    <aside
      class="hidden lg:flex lg:flex-col lg:w-64 fixed h-full z-40"
      style="background: var(--surface-card); border-right: 1px solid var(--surface-border);"
    >
      <!-- Logo -->
      <div class="p-5" style="border-bottom: 1px solid var(--surface-border);">
        <div class="flex items-center gap-3">
          <img src="/images/icons/maskable_icon_x96.png" alt="PARKIN" class="w-10 h-10 rounded-xl" />
          <div>
            <h1 class="font-bold text-lg" style="color: var(--surface-text);">PARKIN</h1>
            <p class="text-[10px] tracking-wider uppercase" style="color: var(--surface-muted);">Sistem Parkir Cerdas</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-link"
          active-class="active"
        >
          <font-awesome-icon :icon="route.icon" class="w-4 h-4" />
          <span>{{ route.name }}</span>
        </router-link>
      </nav>

      <!-- Theme Toggle + User Info + Demo Controls -->
      <div class="p-4" style="border-top: 1px solid var(--surface-border);">
        <!-- Theme Toggle -->
        <button
          @click="themeStore.toggle()"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl mb-3 transition-all duration-200 cursor-pointer"
          style="background: var(--surface-bg);"
        >
          <font-awesome-icon :icon="themeStore.isDark ? ['fas', 'moon'] : ['fas', 'sun']" class="w-4 h-4" />
          <span class="text-sm font-medium" style="color: var(--surface-text);">
            {{ themeStore.isDark ? 'Dark Mode' : 'Light Mode' }}
          </span>
          <div class="ml-auto theme-toggle" :class="{ 'is-dark': themeStore.isDark }"></div>
        </button>

        <!-- Demo Simulator Controls -->
        <div class="mb-3 p-3 rounded-xl" style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.25);">
          <p class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color: #818cf8;">
            <font-awesome-icon :icon="['fas', 'robot']" class="mr-1" /> Demo Simulator
          </p>
          <div class="flex gap-1.5">
            <button @click="toggleSim"
                    class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all"
                    :style="parkingStore.simulatorActive
                      ? 'background: rgba(239,68,68,0.15); color: #f87171;'
                      : 'background: rgba(34,197,94,0.15); color: #4ade80;'">
              <font-awesome-icon :icon="parkingStore.simulatorActive ? ['fas', 'stop'] : ['fas', 'play']" class="mr-1" />
              {{ parkingStore.simulatorActive ? 'Stop' : 'Start' }}
            </button>
            <button @click="doReset"
                    class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all"
                    style="background: var(--surface-border); color: var(--surface-muted);">
              <font-awesome-icon :icon="['fas', 'rotate-left']" class="mr-1" /> Reset
            </button>
          </div>
        </div>

        <!-- User Info + Connection Status -->
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold text-sm">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color: var(--surface-text);">{{ user?.nama }}</p>
            <p class="text-[10px] uppercase tracking-wider" style="color: var(--surface-muted);">{{ user?.role }}</p>
          </div>
          <span :class="statusDotClass" :title="statusLabel"></span>
        </div>

        <button @click="handleLogout" class="btn btn-ghost btn-sm w-full">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-2" />
          Logout
        </button>
      </div>
    </aside>

    <!-- MOBILE HEADER — identik dengan production, ditambah sim controls -->
    <header
      class="lg:hidden sticky top-0 z-50 backdrop-blur-md"
      style="background: color-mix(in srgb, var(--surface-card) 95%, transparent); border-bottom: 1px solid var(--surface-border);"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-2.5">
          <img src="/images/icons/maskable_icon_x96.png" alt="PARKIN" class="w-8 h-8 rounded-lg" />
          <div>
            <h1 class="font-bold text-sm" style="color: var(--surface-text);">PARKIN</h1>
            <p class="text-[9px]" style="color: var(--surface-muted);">{{ user?.nama }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Theme -->
          <button
            @click="themeStore.toggle()"
            class="p-1.5 rounded-lg transition-all"
            style="background: var(--surface-bg);"
            :title="themeStore.isDark ? 'Dark Mode' : 'Light Mode'"
          >
            <font-awesome-icon :icon="themeStore.isDark ? ['fas', 'moon'] : ['fas', 'sun']" />
          </button>

          <!-- Demo Sim Start/Stop (icon only) -->
          <button @click="toggleSim"
                  class="p-1.5 rounded-lg transition-all text-xs"
                  :style="parkingStore.simulatorActive
                    ? 'background: rgba(239,68,68,0.15); color: #f87171;'
                    : 'background: rgba(34,197,94,0.15); color: #4ade80;'"
                  :title="parkingStore.simulatorActive ? 'Stop Simulator' : 'Start Simulator'">
            <font-awesome-icon :icon="parkingStore.simulatorActive ? ['fas', 'stop'] : ['fas', 'play']" />
          </button>

          <!-- Status badge -->
          <span :class="['badge text-[10px]', statusBadgeClass]">
            {{ statusLabel }}
          </span>

          <button @click="handleLogout" class="btn btn-ghost btn-sm py-1 px-2 text-xs">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="flex-1 lg:ml-64 pb-20 lg:pb-6">
      <div class="max-w-6xl mx-auto px-4 py-5 lg:py-6">
        <router-view />
      </div>
    </main>

    <!-- BOTTOM TAB BAR (Mobile) -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom backdrop-blur-md"
      style="background: color-mix(in srgb, var(--surface-card) 95%, transparent); border-top: 1px solid var(--surface-border);"
    >
      <div class="flex justify-around">
        <router-link
          v-for="route in navRoutes"
          :key="route.path"
          :to="route.path"
          class="bottom-tab"
          active-class="active"
        >
          <font-awesome-icon :icon="route.icon" class="tab-icon" />
          <span>{{ route.shortName || route.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useParkingStore } from '../stores/parking'
import { useThemeStore } from '../stores/theme'
import { resetDemoData } from '../utils/demoData'

const router       = useRouter()
const authStore    = useAuthStore()
const parkingStore = useParkingStore()
const themeStore   = useThemeStore()

const user = computed(() => authStore.user)

// Status — demo: simulator aktif = Live, tidak aktif = Ready
const isLive = computed(() => parkingStore.simulatorActive || parkingStore.wsConnected)

const statusLabel = computed(() => {
  if (parkingStore.simulatorActive) return '● Live'
  return '● Ready'
})

const statusDotClass = computed(() => [
  'w-2 h-2 rounded-full',
  parkingStore.simulatorActive ? 'bg-status-ok animate-pulse-slow' : 'bg-yellow-400',
])

const statusBadgeClass = computed(() =>
  parkingStore.simulatorActive
    ? 'bg-status-ok/15 text-status-ok'
    : 'bg-yellow-400/15 text-yellow-500'
)

const userInitials = computed(() => {
  const name = user.value?.nama || ''
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
})

const navRoutes = [
  { path: '/dashboard/home',     name: 'Home',     shortName: 'Home',    icon: ['fas', 'house'] },
  { path: '/dashboard/logs',     name: 'Logs',     shortName: 'Logs',    icon: ['fas', 'clipboard-list'] },
  { path: '/dashboard/users',    name: 'Users',    shortName: 'Users',   icon: ['fas', 'users'] },
  { path: '/dashboard/profile',  name: 'Profile',  shortName: 'Profil',  icon: ['fas', 'user'] },
  { path: '/dashboard/settings', name: 'Settings', shortName: 'Setting', icon: ['fas', 'gear'] },
]

function toggleSim() {
  parkingStore.toggleSimulator()
}

function doReset() {
  if (parkingStore.simulatorActive) parkingStore.toggleSimulator()
  resetDemoData()
  parkingStore.refreshStats()
}

async function handleLogout() {
  parkingStore.disconnect()
  await authStore.logout()
  router.push('/login')
}
</script>
