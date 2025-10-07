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
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-100">Attendance</a>
        <a href="/admin/reports" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Reports</a>
      </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-3xl font-bold mb-8">REPORTS</h1>

      <!-- Filter -->
      <div class="flex items-center gap-4 mb-6">
        <select v-model="reportType" class="border px-3 py-2 rounded flex-1">
          <option value="monthly">Monthly Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="daily">Daily Report</option>
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
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-center px-6 py-3 font-semibold">Employees</th>
              <th class="text-right px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in reportRows"
              :key="idx"
              class="border-t hover:bg-gray-50"
            >
              <td class="px-6 py-4">{{ row.name }}</td>
              <td class="px-6 py-4 text-center">{{ row.count }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <button
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    @click="viewRow(row)"
                  >
                    View
                  </button>
                  <button
                    class="bg-gray-100 border px-3 py-2 rounded hover:bg-gray-200"
                    @click="exportRow(row)"
                  >
                    Export CSV
                  </button>
                </div>
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
          <h3 class="text-lg font-semibold">Detail: {{ modalRow?.name }}</h3>
          <button class="text-gray-600 hover:text-black" @click="closeModal">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          Total: <strong>{{ modalRow?.count }}</strong>
        </p>

        <div class="max-h-72 overflow-y-auto border rounded">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2">No</th>
                <th class="text-left px-4 py-2">Nama</th>
                <th class="text-left px-4 py-2">Status</th>
                <th class="text-left px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in modalList"
                :key="i"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ i + 1 }}</td>
                <td class="px-4 py-2">{{ item.name }}</td>
                <td class="px-4 py-2">{{ item.status }}</td>
                <td class="px-4 py-2">{{ item.time || '-' }}</td>
              </tr>

              <tr v-if="modalList.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-gray-500">
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

<script setup>
import { ref, onMounted } from "vue"

// --- State utama ---
const today = new Date()
const pad = (n) => (n < 10 ? "0" + n : n)
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`
const reportType = ref("monthly")

// Data kosong, nanti bisa diisi dari API NestJS
const reportRows = ref([])

// Modal detail
const showModal = ref(false)
const modalRow = ref(null)
const modalList = ref([])

onMounted(async () => {
  // Contoh: fetch data laporan dari backend
  // const res = await $fetch(`/api/reports?type=${reportType.value}`)
  // reportRows.value = res.rows
})

// Fungsi tampil modal detail
async function viewRow(row) {
  modalRow.value = row
  showModal.value = true

  // Contoh fetch detail dari backend
  // modalList.value = await $fetch(`/api/reports/${row.key}?date=...`)
  modalList.value = [] // Kosong dulu
}

// Tutup modal
function closeModal() {
  showModal.value = false
  modalRow.value = null
  modalList.value = []
}

// Export CSV
function exportRow(row) {
  viewRow(row)
  setTimeout(() => downloadModalCSV(), 100)
}

function downloadModalCSV() {
  if (!modalList.value.length) {
    alert("Tidak ada data untuk di-export.")
    return
  }

  const headers = ["Name", "Status", "Time"]
  const rows = modalList.value.map((r) => [r.name, r.status, r.time || ""])
  const csvContent = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${modalRow.value?.key || "report"}_${reportType.value}_${pad(
    today.getDate()
  )}${pad(today.getMonth() + 1)}${today.getFullYear()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
