/**
 * PARKIN Demo — Seed Data
 * Berisi data awal yang realistis untuk demo portfolio.
 * Semua data disimpan di localStorage, tidak butuh backend.
 */

// ── Demo Accounts ────────────────────────────────────────────────────────────
export const DEMO_USERS = [
  {
    id: 'demo-admin-001',
    nama: 'Admin Demo',
    username: 'admin',
    email: 'admin@parkin.demo',
    password: 'demo123',
    role: 'admin',
    status: 'offline',
    no_hp: '081234567890',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-security-001',
    nama: 'Budi Security',
    username: 'security',
    email: 'security@parkin.demo',
    password: 'demo123',
    role: 'security',
    status: 'offline',
    no_hp: '089876543210',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// ── Settings Default ─────────────────────────────────────────────────────────
export const DEMO_SETTINGS = {
  id: 'demo-settings-001',
  max_mobil: 30,
  max_motor: 30,
  stream_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A', // lofi stream
  stream_type: 'youtube',
  line_position: 0.6,
  line_orientation: 'horizontal',
  discord_webhook_url: '',
  updated_at: new Date().toISOString(),
  updated_by: 'demo-admin-001',
}

// ── Vehicle Log Generator ─────────────────────────────────────────────────────
function generateId() {
  return 'log-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
}

/**
 * Generate vehicle logs realistis untuk 24 jam terakhir.
 * Pola: pagi (07-09) dan sore (16-18) lebih ramai.
 */
export function generateVehicleLogs(count = 60) {
  const logs = []
  const now = Date.now()
  const types = ['mobil', 'mobil', 'motor', 'motor', 'motor'] // Motor lebih banyak

  // Buat log mundur dari sekarang
  let cursor = now
  for (let i = 0; i < count; i++) {
    // Random interval 3–20 menit
    cursor -= Math.floor(Math.random() * 17 + 3) * 60 * 1000

    const type = types[Math.floor(Math.random() * types.length)]
    logs.push({
      id: generateId() + i,
      jenis_kendaraan: type,
      status: Math.random() > 0.35 ? 'in' : 'out',
      track_id: Math.floor(Math.random() * 999) + 1,
      confidence: parseFloat((0.82 + Math.random() * 0.17).toFixed(3)),
      created_at: new Date(cursor).toISOString(),
    })
  }

  return logs // Sudah urut desc (terbaru dulu)
}

// ── Seed / Reset Functions ────────────────────────────────────────────────────
export function seedDemoData() {
  if (localStorage.getItem('parkin_demo_seeded')) return

  localStorage.setItem('parkin_users', JSON.stringify(DEMO_USERS))
  localStorage.setItem('parkin_vehicle_logs', JSON.stringify(generateVehicleLogs(60)))
  localStorage.setItem('parkin_settings', JSON.stringify(DEMO_SETTINGS))
  localStorage.setItem('parkin_demo_seeded', '1')
  console.log('🌱 PARKIN Demo: data seeded')
}

export function resetDemoData() {
  // Hapus semua kunci demo
  ;[
    'parkin_demo_seeded',
    'parkin_users',
    'parkin_vehicle_logs',
    'parkin_settings',
    'parkin_session',
    'parkin_theme',
  ].forEach((k) => localStorage.removeItem(k))

  // Seed ulang
  seedDemoData()
  console.log('🔄 PARKIN Demo: data reset')
}
