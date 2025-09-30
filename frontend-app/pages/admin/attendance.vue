<script setup lang="ts">
/**
 * pages/admin/attendance.vue
 * - Fetch attendance list from backend
 * - Poll every 5s so list auto-refresh setelah ada scan dari device lain
 * - markAllPresent() akan mencoba POST ke /attendance/checkin untuk setiap employee
 *
 * NOTE:
 * - Sesuaikan `apiBase` di runtime config atau .env (public.apiBase)
 * - Backend endpoints:
 *    GET  /attendance           -> returns attendance with included user
 *    POST /attendance/checkin   -> checkin payload { userId, role, qrValue }
 */

import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3000'

const { user, loadUser, logout } = useAuth()

// UI state
const today = new Date()
const pad = (n: number) => (n < 10 ? '0' + n : String(n))
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`

const time = ref('')
let clockInterval: number | null = null
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// sample employees (in real app, fetch from API /users)
const employees = ref<Array<{ id: number | string; name: string }>>([
  { id: 1, name: 'Ozan' },
  { id: 2, name: 'Lina' },
  { id: 3, name: 'Budi' },
])

// attendances shown in table
type AttendanceRow = {
  id: string
  userId: string
  name: string
  time: string // displayable time
  status: string
  raw: any
}
const attendances = ref<AttendanceRow[]>([])

// modal edit
const showModal = ref(false)
const editingRecord = reactive({
  id: null as string | number | null,
  name: '',
  time: '',
  status: '',
})

// polling
let pollInterval: number | null = null
const POLL_MS = 5000

// helper to get token
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

// fetch attendances from backend and map to attendances array
const fetchAttendances = async () => {
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!res.ok) {
      console.warn('fetchAttendances failed', res.status)
      return
    }
    const data = await res.json().catch(() => [])
    // data expected to be array of attendance with included user
    attendances.value = (data || []).map((a: any) => {
      const name = a.user?.name ?? a.user?.username ?? 'Unknown'
      // derive a display time: use timeIn else createdAt
      const t = a.timeIn ?? a.time ?? a.createdAt
      let timeStr = ''
      try {
        timeStr = new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      } catch {
        timeStr = String(t ?? '')
      }
      return {
        id: a.id,
        userId: a.userId,
        name,
        time: timeStr,
        status: a.status ?? a.status,
        raw: a,
      } as AttendanceRow
    })
  } catch (err) {
    console.error('fetchAttendances error', err)
  }
}

// mark all present: calls checkin endpoint for each employee (quick demo)
const markAllPresent = async () => {
  const token = getToken()
  const results: Array<{ id: string | number; ok: boolean; status: number | null; text?: string }> = []
  for (const emp of employees.value) {
    try {
      // payload: userId must be string (backend expects UUID in real app)
      const payload = {
        userId: String(emp.id),
        role: 'PEKERJA',
        qrValue: 'MANUAL-MARK',
      }
      const res = await fetch(`${apiBase}/attendance/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      const text = await res.text().catch(() => '')
      results.push({ id: emp.id, ok: res.ok, status: res.status, text })
    } catch (err: any) {
      results.push({ id: emp.id, ok: false, status: null, text: err?.message ?? String(err) })
    }
  }

  // refresh list
  await fetchAttendances()

  // friendly status message (console + brief alert)
  console.table(results)
  const failed = results.filter((r) => !r.ok)
  if (failed.length) {
    alert(`Mark selesai. ${failed.length} gagal. Cek console untuk detail.`)
  } else {
    alert('Mark selesai: semua berhasil (atau sudah ada check-in).')
  }
}

// modal handlers
const openEdit = (rec: AttendanceRow) => {
  editingRecord.id = rec.id
  editingRecord.name = rec.name
  editingRecord.time = rec.time
  editingRecord.status = rec.status
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    editingRecord.id = null
    editingRecord.name = ''
    editingRecord.time = ''
    editingRecord.status = ''
  }, 150)
}

// saveEdit locally (no backend provided in current API snippet)
// If you have an update endpoint, call it here then refresh fetchAttendances()
const saveEdit = () => {
  const idx = attendances.value.findIndex((r) => r.id === editingRecord.id)
  if (idx !== -1 && attendances.value[idx]) {
    attendances.value[idx].time = editingRecord.time
    attendances.value[idx].status = editingRecord.status
  }
  closeModal()
}

// lifecycle
onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)

  await fetchAttendances()
  pollInterval = window.setInterval(fetchAttendances, POLL_MS)
})

onBeforeUnmount(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
})
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar (sama style kaprog) -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <!-- logo / title -->
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-200">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-200">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-200">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-200">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold">ATTENDANCE</h1>
          <div class="text-sm text-gray-500 mt-1">{{ displayDate }}</div>
        </div>

        <div class="flex items-center gap-3">
          <button @click="markAllPresent" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Mark Attendance
          </button>
          <!-- manual refresh -->
          <button @click="fetchAttendances" class="px-4 py-2 border rounded">Refresh</button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-left px-6 py-3 font-semibold">Time</th>
              <th class="text-left px-6 py-3 font-semibold">Status</th>
              <th class="text-left px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="rec in attendances" :key="rec.id" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4">{{ rec.name }}</td>
              <td class="px-6 py-4">{{ rec.time }}</td>
              <td class="px-6 py-4">{{ rec.status }}</td>
              <td class="px-6 py-4">
                <button class="bg-blue-500 text-white px-3 py-1 rounded" @click="openEdit(rec)">Edit</button>
              </td>
            </tr>

            <tr v-if="attendances.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                Belum ada data kehadiran hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal: Edit Attendance -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg w-11/12 md:w-1/3 p-6">
        <h3 class="text-lg font-semibold mb-4">Edit Attendance</h3>

        <form @submit.prevent="saveEdit">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Nama</label>
            <input readonly :value="editingRecord.name" class="w-full border px-3 py-2 rounded bg-gray-50" />
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Time (HH:MM AM/PM)</label>
            <input v-model="editingRecord.time" required class="w-full border px-3 py-2 rounded" />
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="editingRecord.status" class="w-full border px-3 py-2 rounded">
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
              <option>Excused</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="px-4 py-2 rounded border" @click="closeModal">Batal</button>
            <button type="submit" class="px-4 py-2 rounded bg-blue-500 text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* small styling */
table th, table td { vertical-align: middle; }
</style>
