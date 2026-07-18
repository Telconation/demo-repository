/**
 * PARKIN Demo — Vehicle Detection Simulator
 *
 * Menggantikan YOLO AI: generate deteksi kendaraan otomatis setiap interval.
 * Memanggil parkingStore.onSimulatedDetection() untuk trigger update UI real-time,
 * mirip seperti pesan WebSocket dari YOLO asli.
 */

import { api, computeStats } from './api.js'

let _intervalId  = null
let _onDetection = null // callback dari parking store

// Interval deteksi: 3-5 detik (terasa natural)
const MIN_INTERVAL = 3000
const MAX_INTERVAL = 5500

const VEHICLE_TYPES = ['mobil', 'mobil', 'motor', 'motor', 'motor']
const DIRECTIONS    = ['in', 'in', 'in', 'out', 'out'] // Lebih banyak masuk

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Register callback yang dipanggil setiap ada deteksi baru.
 * Dipanggil dari parking store saat simulator diaktifkan.
 */
export function onDetection(cb) {
  _onDetection = cb
}

/**
 * Generate satu deteksi kendaraan dan simpan ke localStorage.
 * Kemudian trigger callback ke parking store → update UI.
 */
async function triggerDetection() {
  try {
    const detection = {
      jenis_kendaraan: randomItem(VEHICLE_TYPES),
      status:          randomItem(DIRECTIONS),
      track_id:        Math.floor(Math.random() * 999) + 1,
      confidence:      parseFloat((0.82 + Math.random() * 0.17).toFixed(3)),
    }

    // Simpan ke localStorage via mock API
    const res = await api.post('/vehicles/logs', detection)
    const newLog = res.data

    // Hitung stats terbaru
    const stats = computeStats()

    // Notifikasi parking store (mirip WebSocket message)
    if (_onDetection) {
      _onDetection('vehicle_log_new', newLog)
      _onDetection('vehicle_stats', stats)

      // Cek apakah parkir penuh
      if (stats.total.is_full || stats.mobil.is_full || stats.motor.is_full) {
        let msg = ''
        if (stats.total.is_full)   msg = `Total parkir penuh! Mobil ${stats.mobil.terisi}/${stats.mobil.max_capacity}, Motor ${stats.motor.terisi}/${stats.motor.max_capacity}`
        else if (stats.mobil.is_full) msg = `Parkir Mobil penuh! (${stats.mobil.terisi}/${stats.mobil.max_capacity})`
        else if (stats.motor.is_full) msg = `Parkir Motor penuh! (${stats.motor.terisi}/${stats.motor.max_capacity})`
        _onDetection('parking_full', msg)
      }
    }
  } catch (e) {
    console.error('[Simulator] Error:', e.message)
  }
}

/**
 * Mulai simulasi otomatis dengan random interval.
 */
export function startSimulator() {
  if (_intervalId) return // Sudah berjalan

  console.log('🤖 Demo Simulator: STARTED')

  function scheduleNext() {
    const interval = Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL
    _intervalId = setTimeout(async () => {
      await triggerDetection()
      scheduleNext() // Schedule berikutnya setelah selesai
    }, interval)
  }

  scheduleNext()
}

/**
 * Hentikan simulasi.
 */
export function stopSimulator() {
  if (_intervalId) {
    clearTimeout(_intervalId)
    _intervalId = null
    console.log('🛑 Demo Simulator: STOPPED')
  }
}

export function isRunning() {
  return _intervalId !== null
}
