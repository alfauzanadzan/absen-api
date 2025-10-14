<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-3xl font-bold mb-8 text-white drop-shadow-md">REPORTS</h1>

      <!-- Filter -->
      <div class="flex items-center gap-4 mb-6">
        <select v-model="reportType" class="border px-3 py-2 rounded flex-1">
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
        </select>

        <div class="flex-1 text-right">
          <input readonly :value="displayDate" class="w-1/2 border px-3 py-2 rounded text-right" />
        </div>
      </div>

      <!-- Table -->
      <div
        class="mt-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto border border-white/30 transition hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
        <table class="min-w-full text-gray-800">
          <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Departemen</th>
              <th class="text-center px-6 py-3 font-semibold">Total Kehadiran</th>
              <th class="text-right px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in reportRows"
              :key="idx"
              class="border-t border-white/40 hover:bg-white/30 transition duration-200">
              <td class="px-6 py-4">{{ row.department }}</td>
              <td class="px-6 py-4 text-center">{{ row.count }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  @click="viewRow(row)">
                  View
                </button>
              </td>
            </tr>

            <tr v-if="reportRows.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-100 font-semibold">
                Tidak ada data laporan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Detail -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg w-11/12 md:w-2/3 p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Detail Departemen: {{ modalRow?.department }}</h3>
          <button class="text-gray-600 hover:text-black" @click="closeModal">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          Total: <strong>{{ modalList.length }}</strong>
        </p>

        <div class="max-h-72 overflow-y-auto border rounded">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2">No</th>
                <th class="text-left px-4 py-2">Nama</th>
                <th class="text-left px-4 py-2">Role</th>
                <th class="text-left px-4 py-2">Status</th>
                <th class="text-left px-4 py-2">Jam Masuk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in modalList" :key="i" class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{{ i + 1 }}</td>
                <td class="px-4 py-2">{{ item.user.name }}</td>
                <td class="px-4 py-2">{{ item.user.role }}</td>
                <td class="px-4 py-2">{{ item.status }}</td>
                <td class="px-4 py-2">{{ formatTime(item.timeIn) }}</td>
              </tr>

              <tr v-if="modalList.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">
                  Tidak ada detail laporan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end">
          <button class="px-4 py-2 rounded border" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

// ==== STATE ====
const reportType = ref("daily")
const reportRows = ref<{ department: string; count: number; items: any[] }[]>([])
const showModal = ref(false)
const modalRow = ref<any>(null)
const modalList = ref<any[]>([])

// ==== DATE ====
const today = new Date()
const pad = (n: number) => (n < 10 ? "0" + n : n)
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`

// ==== API BASE URL ====
const API_BASE = "http://localhost:3000" // 🔧 Ganti sesuai backend NestJS kamu

// ==== UTIL ====
function formatTime(dateStr: string | null) {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ==== FETCH DATA ====
async function loadReports() {
  try {
    const data = await $fetch(`${API_BASE}/attendance`) // 🔥 ambil dari backend NestJS

    // grupkan berdasarkan departemen
    const grouped = data.reduce((acc: any, curr: any) => {
      const dept = curr.department?.name || "Unknown"
      if (!acc[dept]) acc[dept] = []
      acc[dept].push(curr)
      return acc
    }, {})

    // ubah jadi array untuk tabel
    reportRows.value = Object.entries(grouped).map(([dept, list]: any) => ({
      department: dept,
      count: list.length,
      items: list,
    }))
  } catch (err) {
    console.error("❌ Gagal ambil laporan:", err)
    reportRows.value = []
  }
}

// ==== MODAL ====
function viewRow(row: any) {
  modalRow.value = row
  modalList.value = row.items
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  modalRow.value = null
  modalList.value = []
}

// ==== INIT ====
onMounted(loadReports)
watch(reportType, loadReports) // biar reload kalau ganti daily/weekly/monthly
</script>
