/**
 * PARKIN Demo — Parking Store (Simulator-based)
 *
 * Drop-in replacement untuk src/stores/parking.js.
 * Menggantikan WebSocket dengan Simulator (setInterval).
 * Menyediakan kontrol Start/Stop/Reset demo dari DashboardLayout.
 */
import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { computeStats } from '../utils/api'
import { resetDemoData } from '../utils/demoData'
import {
  startSimulator,
  stopSimulator,
  isRunning,
  onDetection,
} from '../utils/simulator'

export const useParkingStore = defineStore('parking', () => {
  // STATE (identik dengan src/stores/parking.js)
  const stats = ref({
    mobil: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    motor: { terisi: 0, tersedia: 0, max_capacity: 30, count_in: 0, count_out: 0, is_full: false },
    total: { terisi: 0, tersedia: 0, max_capacity: 60, is_full: false },
  })

  // Demo: selalu "connected" (tidak ada WS nyata)
  const wsConnected  = ref(true)
  const wsConnecting = ref(false)

  // Demo simulator state (extra — tidak ada di src/stores/parking.js)
  const simulatorActive = ref(false)

  let lastAlarmAt = 0
  const ALARM_COOLDOWN_MS = 30_000

  const listeners = new Set()

  // ── PUB-SUB (identik interface) ─────────────────────────────────────────────
  function onVehicleUpdate(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  }

  function notifyListeners(eventType, data) {
    listeners.forEach((cb) => {
      try { cb(eventType, data) } catch (err) { console.error('Listener error:', err) }
    })
  }

  // ── SIMULATOR CALLBACK ───────────────────────────────────────────────────────
  // Dipanggil oleh simulator.js setiap ada "deteksi" baru
  onDetection((eventType, data) => {
    if (eventType === 'vehicle_stats') {
      stats.value = data
      notifyListeners('stats', data)
    } else if (eventType === 'vehicle_log_new') {
      notifyListeners('new_log', data)
    } else if (eventType === 'parking_full') {
      triggerParkingFullAlert(data)
    } else if (eventType === 'settings_updated') {
      notifyListeners('settings_updated', data)
    }
  })

  // ── INIT: hitung stats dari data yang ada di localStorage ────────────────────
  function refreshStats() {
    stats.value = computeStats()
    notifyListeners('stats', stats.value)
  }

  // ── WEBSOCKET COMPAT (no-op — interface tetap sama) ─────────────────────────
  function connectWebSocket() {
    wsConnected.value  = true
    wsConnecting.value = false
    refreshStats()
    console.log('🎭 Demo: WebSocket simulasi aktif (dari localStorage)')
  }

  function disconnect() {
    stopSimulator()
    simulatorActive.value = false
    wsConnected.value     = false
  }

  // ── DEMO CONTROLS (extra — dipanggil dari DashboardLayout demo) ─────────────
  function toggleSimulator() {
    if (isRunning()) {
      stopSimulator()
      simulatorActive.value = false
    } else {
      startSimulator()
      simulatorActive.value = true
    }
  }

  function resetDemo() {
    stopSimulator()
    simulatorActive.value = false
    resetDemoData()
    refreshStats()
  }

  // ── ALERT / NOTIF (identik dengan src) ──────────────────────────────────────
  function triggerParkingFullAlert(message) {
    showBrowserNotification('🚨 Parkir Penuh!', message)
    const now = Date.now()
    if (now - lastAlarmAt > ALARM_COOLDOWN_MS) {
      playAlarmSound()
      lastAlarmAt = now
    }
  }

  function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/images/icons/maskable_icon_x192.png',
          tag: 'parking-full',
          renotify: true,
        })
      } catch {}
    }
  }

  function playAlarmSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioContext()
      const now = ctx.currentTime
      ;[[880, now, 0.3], [880, now + 0.4, 0.3], [1200, now + 0.8, 0.5]].forEach(
        ([freq, start, dur]) => {
          const osc  = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, start)
          gain.gain.setValueAtTime(0.3, start)
          gain.gain.exponentialRampToValueAtTime(0.01, start + dur)
          osc.start(start)
          osc.stop(start + dur)
        }
      )
    } catch {}
  }

  return {
    stats,
    wsConnected,
    wsConnecting,
    simulatorActive,
    connectWebSocket,
    disconnect,
    onVehicleUpdate,
    toggleSimulator,
    resetDemo,
    refreshStats,
  }
})
