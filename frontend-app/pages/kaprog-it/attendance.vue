<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3001'
const { loadUser } = useAuth()

const time = ref('')
const pad = (n: number) => (n < 10 ? '0' + n : String(n))
const today = new Date()
const displayDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`
let clockInterval: number | null = null
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

type AttendanceRow = {
  id: string
  name: string
  department: string
  date: string
  time: string
  type: string
  status: string
  reason?: string | null
}

const checkins = ref<AttendanceRow[]>([])
const checkouts = ref<AttendanceRow[]>([])
const loading = ref(false)
const errorMessage = ref('')
const pollIntervalMs = 10000
let pollInterval: number | null = null

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

const fetchAttendances = async () => {
  const token = getToken()
  if (!token) {
    errorMessage.value = '⚠️ Anda belum login. Silakan login ulang.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch(`${apiBase}/attendance/department/it`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      if (res.status === 401) {
        errorMessage.value = '❌ Token tidak valid atau sudah kedaluwarsa. Silakan login ulang.'
      } else if (res.status === 404) {
        errorMessage.value = '❌ Endpoint /attendance/department/it tidak ditemukan (404).'
      } else {
        errorMessage.value = `❌ Gagal mengambil data (status ${res.status}).`
      }
      checkins.value = []
      checkouts.value = []
      return
    }

    const data = await res.json()
    console.log('✅ Attendance data:', data)

    // 🧠 Filter hanya pekerja IT
    const filtered = (Array.isArray(data?.data) ? data.data : [])
      .filter((a: any) => {
        const role = a.user?.role?.toLowerCase?.() ?? ''
        const dept = a.departmentName?.toLowerCase?.() ?? ''
        return role === 'pekerja' && dept === 'it'
      })

    const parsed: AttendanceRow[] = filtered.map((a: any) => {
      const userName = a.user?.name ?? a.user?.username ?? 'Unknown'
      const department = a.departmentName ?? a.department?.name ?? '-'
      const dateObj = new Date(a.date)
      const timeObj = a.time ? new Date(a.time) : null

      const date = `${pad(dateObj.getDate())}-${pad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`
      const time = timeObj
        ? timeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '-'

      return {
        id: a.id,
        name: userName,
        department,
        date,
        time,
        type: a.type,
        status: a.status,
        reason: a.reason ?? null
      }
    })

    checkins.value = parsed.filter(a => a.type === 'IN')
    checkouts.value = parsed.filter(a => a.type === 'OUT')
  } catch (err) {
    console.error('fetchAttendances error:', err)
    errorMessage.value = '❌ Gagal memuat data absensi. Cek koneksi server.'
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PRESENT': return 'text-blue-700 bg-blue-100'
    case 'LATE': return 'text-orange-700 bg-orange-100'
    case 'COMPLETED': return 'text-green-700 bg-green-100'
    case 'EARLY_OUT': return 'text-yellow-700 bg-yellow-100'
    case 'OVERTIME': return 'text-purple-700 bg-purple-100'
    default: return 'text-gray-700 bg-gray-100'
  }
}

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
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">KAPROG IT</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-it/kaprogit" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/kaprog-it/profilkaprog" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/kaprog-it/attendance" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">📝 Attendance</a>
        <a href="/kaprog-it/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-white drop-shadow-md">ATTENDANCE PEKERJA IT</h1>
          <div class="text-sm text-gray-100 mt-1">{{ displayDate }} | {{ time }}</div>
        </div>
        <button
          @click="fetchAttendances"
          class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>

      <div v-if="loading" class="text-white italic mb-4">⏳ Memuat data...</div>
      <div v-if="errorMessage" class="text-red-200 bg-red-500/30 px-4 py-2 rounded-lg mb-4 border border-red-400">
        {{ errorMessage }}
      </div>

      <!-- ✅ Check-In Table -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold mb-3 text-white">Check-In (Pekerja IT)</h2>
        <div class="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto border border-white/30">
          <table class="min-w-full text-gray-800">
            <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
              <tr>
                <th class="text-left px-6 py-3">Nama</th>
                <th class="text-left px-6 py-3">Department</th>
                <th class="text-left px-6 py-3">Tanggal</th>
                <th class="text-left px-6 py-3">Jam</th>
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
                <td class="px-6 py-3">{{ rec.time }}</td>
                <td class="px-6 py-3">
                  <span
                    :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(rec.status)]"
                  >{{ rec.status }}</span>
                </td>
              </tr>
              <tr v-if="!loading && checkins.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-200 font-medium">
                  Belum ada data Check-In pekerja IT.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ✅ Check-Out Table -->
      <section>
        <h2 class="text-xl font-semibold mb-3 text-white">Check-Out (Pekerja IT)</h2>
        <div class="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto border border-white/30">
          <table class="min-w-full text-gray-800">
            <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
              <tr>
                <th class="text-left px-6 py-3">Nama</th>
                <th class="text-left px-6 py-3">Department</th>
                <th class="text-left px-6 py-3">Tanggal</th>
                <th class="text-left px-6 py-3">Jam</th>
                <th class="text-left px-6 py-3">Status</th>
                <th class="text-left px-6 py-3">Reason</th>
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
                <td class="px-6 py-3">{{ rec.time }}</td>
                <td class="px-6 py-3">
                  <span
                    :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(rec.status)]"
                  >{{ rec.status }}</span>
                </td>
                <td class="px-6 py-3">
                  <span v-if="rec.reason" class="text-gray-800 italic">{{ rec.reason }}</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
              <tr v-if="!loading && checkouts.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-200 font-medium">
                  Belum ada data Check-Out pekerja IT.
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
