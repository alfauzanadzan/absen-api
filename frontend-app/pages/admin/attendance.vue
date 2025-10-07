<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3000'

const { user, loadUser, logout } = useAuth()

// 🕒 UI clock
const today = new Date()
const pad = (n: number) => (n < 10 ? '0' + n : String(n))
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`
const time = ref('')
let clockInterval: number | null = null
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// 📋 Data & state
type AttendanceRow = {
  id: string
  userId: string
  name: string
  department: string
  date: string
  timeIn: string
  timeOut: string
  status: string
  raw: any
}

const attendances = ref<AttendanceRow[]>([])
const showModal = ref(false)
const editingRecord = reactive({
  id: null as string | number | null,
  name: '',
  department: '',
  date: '',
  timeIn: '',
  timeOut: '',
  status: '',
})

const pollIntervalMs = 5000
let pollInterval: number | null = null

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

// 🧭 Fetch attendance data
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
    attendances.value = (data || []).map((a: any) => {
      const name = a.user?.name ?? a.user?.username ?? 'Unknown'
      const department = a.departmentName ?? a.user?.departmentName ?? a.user?.department ?? '-'
      const timeInDate = a.timeIn ? new Date(a.timeIn) : null
      const timeOutDate = a.timeOut ? new Date(a.timeOut) : null
      const dateObj = a.date ? new Date(a.date) : null
      const date = dateObj ? `${pad(dateObj.getDate())}-${pad(dateObj.getMonth()+1)}-${dateObj.getFullYear()}` : '-'

      return {
        id: a.id,
        userId: a.userId,
        name,
        department,
        date,
        timeIn: timeInDate ? timeInDate.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '-',
        timeOut: timeOutDate ? timeOutDate.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '-',
        status: a.status ?? 'UNKNOWN',
        raw: a,
      }
    })
  } catch (err) {
    console.error('fetchAttendances error', err)
  }
}

// ✍️ Manual edit modal
const openEdit = (rec: AttendanceRow) => {
  editingRecord.id = rec.id
  editingRecord.name = rec.name
  editingRecord.department = rec.department
  editingRecord.date = rec.date
  editingRecord.timeIn = rec.timeIn
  editingRecord.timeOut = rec.timeOut
  editingRecord.status = rec.status
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  setTimeout(() => {
    editingRecord.id = null
    editingRecord.name = ''
    editingRecord.department = ''
    editingRecord.date = ''
    editingRecord.timeIn = ''
    editingRecord.timeOut = ''
    editingRecord.status = ''
  }, 150)
}

const saveEdit = () => {
  const idx = attendances.value.findIndex((r) => r.id === editingRecord.id)
  if (idx !== -1 && attendances.value[idx]) {
    attendances.value[idx].timeIn = editingRecord.timeIn
    attendances.value[idx].timeOut = editingRecord.timeOut
    attendances.value[idx].status = editingRecord.status
  }
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

// 🎨 Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PRESENT':
      return 'text-yellow-600 bg-yellow-100'
    case 'COMPLETED':
      return 'text-green-700 bg-green-100'
    case 'LATE':
      return 'text-orange-600 bg-orange-100'
    case 'ABSENT':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
     <aside class="w-60 bg-white p-6 flex flex-col">
       <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-blue-600">ADMIN</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Attendance</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold">ATTENDANCE</h1>
          <div class="text-sm text-gray-500 mt-1">{{ displayDate }}</div>
        </div>

        <button @click="fetchAttendances" class="px-4 py-2 border rounded">Refresh</button>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm overflow-hidden">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b bg-gray-50 text-gray-700">
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-left px-6 py-3 font-semibold">Department</th>
              <th class="text-left px-6 py-3 font-semibold">Tanggal</th>
              <th class="text-left px-6 py-3 font-semibold">Time In</th>
              <th class="text-left px-6 py-3 font-semibold">Time Out</th>
              <th class="text-left px-6 py-3 font-semibold">Status</th>
              <th class="text-left px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="rec in attendances" :key="rec.id" class="border-b hover:bg-gray-50">
              <td class="px-6 py-3">{{ rec.name }}</td>
              <td class="px-6 py-3">{{ rec.department }}</td>
              <td class="px-6 py-3">{{ rec.date }}</td>
              <td class="px-6 py-3">{{ rec.timeIn }}</td>
              <td class="px-6 py-3">{{ rec.timeOut }}</td>
              <td class="px-6 py-3">
                <span :class="['px-2 py-1 rounded text-xs font-semibold', getStatusColor(rec.status)]">
                  {{ rec.status }}
                </span>
              </td>
              <td class="px-6 py-3">
                <button class="bg-blue-500 text-white px-3 py-1 rounded" @click="openEdit(rec)">Edit</button>
              </td>
            </tr>

            <tr v-if="attendances.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                Belum ada data kehadiran hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
              <label class="block text-sm font-medium mb-1">Time In</label>
              <input v-model="editingRecord.timeIn" required class="w-full border px-3 py-2 rounded" />
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Time Out</label>
              <input v-model="editingRecord.timeOut" required class="w-full border px-3 py-2 rounded" />
            </div>

            <div class="mb-3">
              <label class="block text-sm font-medium mb-1">Status</label>
              <select v-model="editingRecord.status" class="w-full border px-3 py-2 rounded">
                <option>PRESENT</option>
                <option>COMPLETED</option>
                <option>LATE</option>
                <option>ABSENT</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button type="button" class="px-4 py-2 rounded border" @click="closeModal">Batal</button>
              <button type="submit" class="px-4 py-2 rounded bg-blue-500 text-white">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
table th, table td { vertical-align: middle; }
</style>
