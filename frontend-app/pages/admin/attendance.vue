<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3000'

const { user, loadUser, logout } = useAuth()

// 🕒 Clock
const today = new Date()
const pad = (n: number) => (n < 10 ? '0' + n : String(n))
const displayDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`
const time = ref('')
let clockInterval: number | null = null

const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 📋 Data & State
type AttendanceRow = {
  id: string
  userId: string
  name: string
  department: string
  date: string
  timeIn: string
  timeOut: string
  statusIn: string
  statusOut: string
}

const checkins = ref<AttendanceRow[]>([])
const checkouts = ref<AttendanceRow[]>([])
const showModal = ref(false)

const editingRecord = reactive({
  id: null as string | number | null,
  name: '',
  department: '',
  date: '',
  timeIn: '',
  timeOut: '',
  statusIn: '',
  statusOut: ''
})

const pollIntervalMs = 5000
let pollInterval: number | null = null

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

// 🧭 Fetch Attendance Data
const fetchAttendances = async () => {
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!res.ok) {
      console.warn('fetchAttendances failed', res.status)
      return
    }

    const data = await res.json().catch(() => [])
    const normalStart = 8
    const normalEnd = 17

    const parsed = (data || []).map((a: any) => {
      const name = a.user?.name ?? a.user?.username ?? 'Unknown'
      const department = a.departmentName ?? a.user?.departmentName ?? '-'
      const timeInDate = a.timeIn ? new Date(a.timeIn) : null
      const timeOutDate = a.timeOut ? new Date(a.timeOut) : null
      const dateObj = a.date ? new Date(a.date) : new Date()
      const date = `${pad(dateObj.getDate())}-${pad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`

      // ✅ Status terpisah
      let statusIn = '-'
      let statusOut = '-'

      if (timeInDate) {
        const jamMasuk = timeInDate.getHours() + timeInDate.getMinutes() / 60
        statusIn = jamMasuk > normalStart ? 'LATE' : 'PRESENT'
      }
      if (timeOutDate) {
        const jamKeluar = timeOutDate.getHours() + timeOutDate.getMinutes() / 60
        statusOut = jamKeluar >= normalEnd ? 'COMPLETED' : 'EARLY'
      }

      return {
        id: a.id,
        userId: a.userId,
        name,
        department,
        date,
        timeIn: timeInDate
          ? timeInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '-',
        timeOut: timeOutDate
          ? timeOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '-',
        statusIn,
        statusOut
      }
    })

    checkins.value = parsed.filter(a => a.timeIn !== '-')
    checkouts.value = parsed.filter(a => a.timeOut !== '-')
  } catch (err) {
    console.error('fetchAttendances error:', err)
  }
}

// ✍ Modal Edit
const openEdit = (rec: AttendanceRow) => {
  Object.assign(editingRecord, rec)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    Object.assign(editingRecord, {
      id: null,
      name: '',
      department: '',
      date: '',
      timeIn: '',
      timeOut: '',
      statusIn: '',
      statusOut: ''
    })
  }, 150)
}

const saveEdit = () => {
  const idxIn = checkins.value.findIndex(r => r.id === editingRecord.id)
  const idxOut = checkouts.value.findIndex(r => r.id === editingRecord.id)
  if (idxIn !== -1) checkins.value[idxIn] = { ...checkins.value[idxIn], ...editingRecord }
  if (idxOut !== -1) checkouts.value[idxOut] = { ...checkouts.value[idxOut], ...editingRecord }
  closeModal()
}

// 🧭 Lifecycle
onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  await fetchAttendances()
  pollInterval = window.setInterval(fetchAttendances, pollIntervalMs)
})

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval)
  if (pollInterval) clearInterval(pollInterval)
})

// 🎨 Status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'text-blue-700 bg-blue-100'
    case 'COMPLETED':
      return 'text-green-700 bg-green-100'
    case 'LATE':
      return 'text-orange-700 bg-orange-100'
    case 'EARLY':
      return 'text-yellow-700 bg-yellow-100'
    case 'ABSENT':
      return 'text-red-700 bg-red-100'
    default:
      return 'text-gray-700 bg-gray-100'
  }
}
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition"
          >➕ Add Account</a
        >
        <a
          href="/admin/attendance"
          class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"
          >📝 Attendance</a
        >
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white drop-shadow-md">ATTENDANCE</h1>
          <div class="text-sm text-gray-100 mt-1">{{ displayDate }}</div>
        </div>
        <button
          @click="fetchAttendances"
          class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>

      <!-- Check-In -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold mb-3 text-white">Check-In</h2>
        <div
          class="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto border border-white/30"
        >
          <table class="min-w-full text-gray-800">
            <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
              <tr>
                <th class="text-left px-6 py-3">Nama</th>
                <th class="text-left px-6 py-3">Department</th>
                <th class="text-left px-6 py-3">Tanggal</th>
                <th class="text-left px-6 py-3">Jam Masuk</th>
                <th class="text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rec in checkins"
                :key="rec.id"
                class="border-t border-white/40 hover:bg-white/30 transition duration-200"
              >
                <td class="px-6 py-3">{{ rec.name }}</td>
                <td class="px-6 py-3">{{ rec.department }}</td>
                <td class="px-6 py-3">{{ rec.date }}</td>
                <td class="px-6 py-3">{{ rec.timeIn }}</td>
                <td class="px-6 py-3">
                  <span
                    :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(rec.statusIn)]"
                    >{{ rec.statusIn }}</span
                  >
                </td>
              </tr>
              <tr v-if="checkins.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-200 font-medium">
                  Belum ada data Check-In.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Check-Out -->
      <section>
        <h2 class="text-xl font-semibold mb-3 text-white">Check-Out</h2>
        <div
          class="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto border border-white/30"
        >
          <table class="min-w-full text-gray-800">
            <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
              <tr>
                <th class="text-left px-6 py-3">Nama</th>
                <th class="text-left px-6 py-3">Department</th>
                <th class="text-left px-6 py-3">Tanggal</th>
                <th class="text-left px-6 py-3">Jam Keluar</th>
                <th class="text-left px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rec in checkouts"
                :key="rec.id"
                class="border-t border-white/40 hover:bg-white/30 transition duration-200"
              >
                <td class="px-6 py-3">{{ rec.name }}</td>
                <td class="px-6 py-3">{{ rec.department }}</td>
                <td class="px-6 py-3">{{ rec.date }}</td>
                <td class="px-6 py-3">{{ rec.timeOut }}</td>
                <td class="px-6 py-3">
                  <span
                    :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(rec.statusOut)]"
                    >{{ rec.statusOut }}</span
                  >
                </td>
              </tr>
              <tr v-if="checkouts.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-200 font-medium">
                  Belum ada data Check-Out.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
table th,
table td {
  vertical-align: middle;
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
}
</style>
