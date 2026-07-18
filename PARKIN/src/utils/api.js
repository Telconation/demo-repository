/**
 * PARKIN Demo — Mock API Client
 *
 * Drop-in replacement untuk src/utils/api.js.
 * Semua operasi membaca/menulis localStorage — tidak ada HTTP request.
 * Interface identik (api.get, api.post, api.put, api.delete) sehingga
 * semua views berjalan tanpa perubahan satu baris pun.
 */

// ── LocalStorage Helpers ─────────────────────────────────────────────────────
function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Simulasi network delay agar terasa lebih "real"
function delay(ms = 120) {
  return new Promise((r) => setTimeout(r, ms))
}

function generateId() {
  return (
    'demo-' +
    Math.random().toString(36).substr(2, 9) +
    '-' +
    Date.now().toString(36)
  )
}

// ── Route Handlers ────────────────────────────────────────────────────────────
async function handleRequest(method, endpoint, body) {
  await delay(Math.random() * 150 + 80) // 80-230ms latency simulation

  const url = endpoint.split('?')[0]
  const search = endpoint.includes('?') ? new URLSearchParams(endpoint.split('?')[1]) : new URLSearchParams()

  // ── AUTH ────────────────────────────────────────────────────────────────────

  // POST /auth/login
  if (method === 'POST' && url === '/auth/login') {
    const users = read('parkin_users', [])
    const { username, email, password } = body
    const loginField = username || email
    const user = users.find(
      (u) => (u.username === loginField || u.email === loginField) && u.password === password
    )
    if (!user) throw new Error('Username atau password salah')

    // Set status online
    const idx = users.findIndex((u) => u.id === user.id)
    users[idx].status = 'online'
    write('parkin_users', users)

    // Simpan session
    const session = { user: { ...users[idx] }, isLoggedIn: true }
    write('parkin_session', session)

    return { message: 'Login successful', user: { ...users[idx] } }
  }

  // POST /auth/logout
  if (method === 'POST' && url === '/auth/logout') {
    const session = read('parkin_session')
    if (session?.user?.id) {
      const users = read('parkin_users', [])
      const idx = users.findIndex((u) => u.id === session.user.id)
      if (idx !== -1) {
        users[idx].status = 'offline'
        write('parkin_users', users)
      }
    }
    localStorage.removeItem('parkin_session')
    return { message: 'Logged out successfully' }
  }

  // POST /auth/register
  if (method === 'POST' && url === '/auth/register') {
    const users = read('parkin_users', [])
    const { nama, username, email, password, no_hp } = body
    if (users.some((u) => u.username === username || u.email === email)) {
      throw new Error('Username atau email sudah digunakan')
    }
    const newUser = {
      id: generateId(),
      nama, username, email, password,
      no_hp: no_hp || null,
      role: 'admin',
      status: 'offline',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(newUser)
    write('parkin_users', users)
    return { message: 'Registration successful', user: newUser }
  }

  // ── USERS ───────────────────────────────────────────────────────────────────

  // GET /users/profile
  if (method === 'GET' && url === '/users/profile') {
    const session = read('parkin_session')
    if (!session?.isLoggedIn) throw new Error('Unauthorized')
    const users = read('parkin_users', [])
    const user = users.find((u) => u.id === session.user.id)
    if (!user) throw new Error('User not found')
    const { password: _, ...safeUser } = user
    return { data: safeUser }
  }

  // PUT /users/profile
  if (method === 'PUT' && url === '/users/profile') {
    const session = read('parkin_session')
    if (!session?.isLoggedIn) throw new Error('Unauthorized')
    const users = read('parkin_users', [])
    const idx = users.findIndex((u) => u.id === session.user.id)
    if (idx === -1) throw new Error('User not found')

    const { nama, username, email, no_hp, currentPassword, newPassword } = body
    if (newPassword) {
      if (users[idx].password !== currentPassword) throw new Error('Password lama salah')
      users[idx].password = newPassword
    }
    if (nama) users[idx].nama = nama
    if (username) users[idx].username = username
    if (email) users[idx].email = email
    if (no_hp !== undefined) users[idx].no_hp = no_hp
    users[idx].updated_at = new Date().toISOString()
    write('parkin_users', users)

    // Update session
    write('parkin_session', { ...session, user: { ...users[idx] } })

    const { password: _, ...safeUser } = users[idx]
    return { message: 'Profile updated successfully', data: safeUser }
  }

  // GET /users (list all)
  if (method === 'GET' && url === '/users') {
    const session = read('parkin_session')
    if (!session?.isLoggedIn) throw new Error('Unauthorized')
    const users = read('parkin_users', [])
    return { data: users.map(({ password: _, ...u }) => u) }
  }

  // POST /users (create — admin only)
  if (method === 'POST' && url === '/users') {
    const users = read('parkin_users', [])
    const { nama, username, email, password, role, no_hp } = body
    if (!['admin', 'security'].includes(role)) throw new Error('Invalid role')
    if (users.some((u) => u.username === username || u.email === email)) {
      throw new Error('Username atau email sudah digunakan')
    }
    const newUser = {
      id: generateId(),
      nama, username, email, password,
      no_hp: no_hp || null,
      role, status: 'offline',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(newUser)
    write('parkin_users', users)
    const { password: _, ...safeUser } = newUser
    return { message: 'User created successfully', data: safeUser }
  }

  // PUT /users/:id (update — admin only)
  if (method === 'PUT' && url.startsWith('/users/')) {
    const id = url.split('/')[2]
    const users = read('parkin_users', [])
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('User not found')
    const { nama, username, email, role, password } = body
    if (nama) users[idx].nama = nama
    if (username) users[idx].username = username
    if (email) users[idx].email = email
    if (role) users[idx].role = role
    if (password) users[idx].password = password
    users[idx].updated_at = new Date().toISOString()
    write('parkin_users', users)
    const { password: _, ...safeUser } = users[idx]
    return { message: 'User updated successfully', data: safeUser }
  }

  // DELETE /users/:id
  if (method === 'DELETE' && url.startsWith('/users/')) {
    const id = url.split('/')[2]
    const users = read('parkin_users', [])
    const filtered = users.filter((u) => u.id !== id)
    write('parkin_users', filtered)
    return { message: 'User deleted successfully' }
  }

  // ── VEHICLES ────────────────────────────────────────────────────────────────

  // GET /vehicles/stats
  if (method === 'GET' && url === '/vehicles/stats') {
    return { data: computeStats() }
  }

  // GET /vehicles/logs
  if (method === 'GET' && url === '/vehicles/logs') {
    let logs = read('parkin_vehicle_logs', [])
    const page    = parseInt(search.get('page') || '1')
    const limit   = parseInt(search.get('limit') || '20')
    const vType   = search.get('vehicle_type') || ''
    const status  = search.get('status') || ''
    const startMs = search.get('start_date') ? parseInt(search.get('start_date')) : null
    const endMs   = search.get('end_date')   ? parseInt(search.get('end_date'))   : null

    // Filter
    if (vType)    logs = logs.filter((l) => l.jenis_kendaraan === vType)
    if (status)   logs = logs.filter((l) => l.status === status)
    if (startMs)  logs = logs.filter((l) => new Date(l.created_at).getTime() >= startMs)
    if (endMs)    logs = logs.filter((l) => new Date(l.created_at).getTime() <= endMs)

    const total      = logs.length
    const totalPages = Math.ceil(total / limit) || 1
    const offset     = (page - 1) * limit
    const paginated  = logs.slice(offset, offset + limit)

    return {
      data: {
        logs: paginated,
        pagination: { page, limit, total, totalPages },
      },
    }
  }

  // POST /vehicles/logs
  if (method === 'POST' && url === '/vehicles/logs') {
    const { jenis_kendaraan, status, track_id, confidence } = body
    const logs = read('parkin_vehicle_logs', [])
    const newLog = {
      id: generateId(),
      jenis_kendaraan,
      status,
      track_id: track_id || null,
      confidence: confidence || null,
      created_at: new Date().toISOString(),
    }
    logs.unshift(newLog) // terbaru di depan
    write('parkin_vehicle_logs', logs)
    return { message: 'Log added successfully', data: newLog }
  }

  // DELETE /vehicles/logs/cleanup
  if (method === 'DELETE' && url === '/vehicles/logs/cleanup') {
    write('parkin_vehicle_logs', [])
    return { message: 'All logs deleted (demo mode)' }
  }

  // ── SETTINGS ────────────────────────────────────────────────────────────────

  // GET /settings
  if (method === 'GET' && url === '/settings') {
    const settings = read('parkin_settings', {
      max_mobil: 30, max_motor: 30,
      stream_url: '', stream_type: 'youtube',
      line_position: 0.6, line_orientation: 'horizontal',
      discord_webhook_url: '',
    })
    return { data: settings }
  }

  // PUT /settings
  if (method === 'PUT' && url === '/settings') {
    const current = read('parkin_settings', {})
    const updated = { ...current, ...body, updated_at: new Date().toISOString() }
    write('parkin_settings', updated)
    return { data: updated, message: 'Settings saved' }
  }

  // ── NOTIFICATIONS (fake — selalu OK) ──────────────────────────────────────

  if (url === '/notifications/subscribe' || url === '/notifications/unsubscribe') {
    return { message: 'OK (demo mode)' }
  }

  throw new Error(`[Demo] Unknown endpoint: ${method} ${endpoint}`)
}

// ── Stats Calculator ──────────────────────────────────────────────────────────
export function computeStats() {
  const logs     = read('parkin_vehicle_logs', [])
  const settings = read('parkin_settings', { max_mobil: 30, max_motor: 30 })

  let mobilIn = 0, mobilOut = 0, motorIn = 0, motorOut = 0
  for (const log of logs) {
    if (log.jenis_kendaraan === 'mobil') {
      log.status === 'in' ? mobilIn++ : mobilOut++
    } else {
      log.status === 'in' ? motorIn++ : motorOut++
    }
  }

  const mobilTerisi = Math.max(0, mobilIn - mobilOut)
  const motorTerisi = Math.max(0, motorIn - motorOut)
  const maxMobil    = settings.max_mobil ?? 30
  const maxMotor    = settings.max_motor ?? 30

  return {
    mobil: {
      terisi: mobilTerisi,
      tersedia: Math.max(0, maxMobil - mobilTerisi),
      max_capacity: maxMobil,
      count_in: mobilIn,
      count_out: mobilOut,
      is_full: mobilTerisi >= maxMobil,
    },
    motor: {
      terisi: motorTerisi,
      tersedia: Math.max(0, maxMotor - motorTerisi),
      max_capacity: maxMotor,
      count_in: motorIn,
      count_out: motorOut,
      is_full: motorTerisi >= maxMotor,
    },
    total: {
      terisi: mobilTerisi + motorTerisi,
      tersedia: Math.max(0, maxMobil + maxMotor - (mobilTerisi + motorTerisi)),
      max_capacity: maxMobil + maxMotor,
      is_full: mobilTerisi + motorTerisi >= maxMobil + maxMotor,
    },
  }
}

// ── Public API Client (same interface as src/utils/api.js) ──────────────────
class MockApiClient {
  async request(endpoint, options = {}) {
    const method = options.method || 'GET'
    let body = null
    if (options.body) {
      try { body = JSON.parse(options.body) } catch { body = options.body }
    }
    return handleRequest(method, endpoint, body)
  }

  get(endpoint)          { return this.request(endpoint) }
  post(endpoint, body)   { return this.request(endpoint, { method: 'POST',   body: JSON.stringify(body) }) }
  put(endpoint, body)    { return this.request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }) }
  delete(endpoint)       { return this.request(endpoint, { method: 'DELETE' }) }
}

/** Singleton — import { api } from '../utils/api' */
export const api = new MockApiClient()
