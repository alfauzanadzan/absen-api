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
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/admin/reports" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-3xl font-bold mb-8">REPORTS</h1>

      <!-- Filter -->
      <div class="flex items-center gap-4 mb-6">
        <select v-model="reportType" @change="generateReport" class="border px-3 py-2 rounded flex-1">
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
        </select>
        <div class="flex-1 text-right">
          <input readonly :value="displayDate" class="w-1/2 border px-3 py-2 rounded text-right" />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded-lg shadow">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Department</th>
              <th class="text-center px-6 py-3 font-semibold">Total Employees</th>
              <th class="text-right px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(dept, idx) in reportRows"
              :key="idx"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-6 py-4">{{ dept.department }}</td>
              <td class="px-6 py-4 text-center">{{ dept.count }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  @click="viewDetail(dept)"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="reportRows.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-500">
                Tidak ada data laporan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg w-11/12 md:w-2/3 p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Detail Department: {{ selectedDept?.department }}</h3>
          <button class="text-gray-600 hover:text-black" @click="closeModal">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          Total: <strong>{{ selectedDept?.count }}</strong>
        </p>

        <div class="max-h-72 overflow-y-auto border rounded">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2">No</th>
                <th class="text-left px-4 py-2">Nama</th>
                <th class="text-left px-4 py-2">Status</th>
                <th class="text-left px-4 py-2">Time In</th>
                <th class="text-left px-4 py-2">Time Out</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in modalList" :key="i" class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{{ i + 1 }}</td>
                <td class="px-4 py-2">{{ item.name }}</td>
                <td class="px-4 py-2">{{ item.status }}</td>
                <td class="px-4 py-2">{{ item.timeIn }}</td>
                <td class="px-4 py-2">{{ item.timeOut }}</td>
              </tr>
              <tr v-if="modalList.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                  Tidak ada detail laporan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <button class="px-4 py-2 rounded border" @click="closeModal">Close</button>
          <button
            class="px-4 py-2 rounded bg-blue-500 text-white"
            @click="downloadModalCSV"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3000'
const { user, loadUser } = useAuth()

const today = new Date()
const pad = (n: number) => (n < 10 ? '0' + n : String(n))
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`

const reportType = ref('daily')
const attendances = ref<any[]>([])
const reportRows = ref<any[]>([])
const showModal = ref(false)
const modalList = ref<any[]>([])
const selectedDept = ref<any>(null)

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

async function fetchAttendances() {
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    attendances.value = data || []
  } catch (err) {
    console.error('fetchAttendances error', err)
  }
}

// 🔹 Generate report dari data attendance
function generateReport() {
  const grouped: Record<string, any[]> = {}
  const now = new Date()
  attendances.value.forEach((a) => {
    const department = a.departmentName ?? a.user?.department ?? '-'
    const date = new Date(a.date)
    let include = false

    if (reportType.value === 'daily') {
      include = date.toDateString() === now.toDateString()
    } else if (reportType.value === 'weekly') {
      const diff = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      include = diff <= 7
    } else if (reportType.value === 'monthly') {
      include = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }

    if (include) {
      if (!grouped[department]) grouped[department] = []
      grouped[department].push(a)
    }
  })

  reportRows.value = Object.entries(grouped).map(([department, list]) => ({
    department,
    count: list.length,
    list,
  }))
}

// 🔹 Lihat detail per department
function viewDetail(dept: any) {
  selectedDept.value = dept
  modalList.value = dept.list.map((a: any) => ({
    name: a.user?.name ?? a.user?.username ?? 'Unknown',
    status: a.status ?? 'UNKNOWN',
    timeIn: a.timeIn ? new Date(a.timeIn).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '-',
    timeOut: a.timeOut ? new Date(a.timeOut).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : '-',
  }))
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  modalList.value = []
  selectedDept.value = null
}

function downloadModalCSV() {
  if (!modalList.value.length) {
    alert('Tidak ada data untuk di-export.')
    return
  }

  const headers = ['Name', 'Status', 'Time In', 'Time Out']
  const rows = modalList.value.map((r) => [r.name, r.status, r.timeIn, r.timeOut])
  const csvContent = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedDept.value?.department}_${reportType.value}_${pad(today.getDate())}${pad(today.getMonth()+1)}${today.getFullYear()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  await loadUser()
  await fetchAttendances()
  generateReport()
})
</script>
