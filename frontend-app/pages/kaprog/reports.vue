<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col ">
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12 rounded" />
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/kaprog/kaprog" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/kaprog/profilkaprog" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/kaprog/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/kaprog/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/kaprog/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-3xl font-bold mb-25">REPORTS</h1>

      <!-- Filter row: report type + date -->
      <div class="flex items-center gap-4 mb-6">
        <select v-model="reportType" class="border px-3 py-2 flex-1">
          <option value="monthly">Monthly Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="daily">Daily Report</option>
        </select>

        <div class="flex-1 text-right">
          <input readonly :value="displayDate" class="w-1/2 border px-3 py-2 text-right" />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border-t border-b">
       <table class="min-w-full">
  <thead>
    <tr class="border-b">
      <th class="text-left px-6 py-4 font-semibold">Nama</th>
      <th class="text-center px-6 py-4 font-semibold">Employees</th>
      <th class="text-right px-6 py-4 font-semibold">Action</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="(row, idx) in reportRows" :key="idx" class="border-b">
      <td class="px-6 py-4">{{ row.name }}</td>
      <td class="px-6 py-4 text-center">{{ row.count }}</td>
      <td class="px-6 py-4 text-right">
        <div class="flex justify-end items-center gap-3">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            @click="viewRow(row)"
          >
            View
          </button>
          <button
            class="bg-gray-100 border px-3 py-2 rounded"
            @click="exportRow(row)"
            title="Export CSV"
          >
            Export CSV
          </button>
        </div>
      </td>
    </tr>

    <tr v-if="reportRows.length === 0">
      <td colspan="3" class="px-6 py-8 text-center text-gray-500">
        Tidak ada data.
      </td>
    </tr>
  </tbody>
</table>

      </div>
    </main>

    <!-- Modal: Detail list for selected report row -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg w-11/12 md:w-2/3 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Detail: {{ modalRow?.name }}</h3>
          <button class="text-gray-600" @click="closeModal">✕</button>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-600">Total: <strong>{{ modalRow?.count }}</strong></p>
        </div>

        <!-- list -->
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
              <tr v-for="(item, i) in modalList" :key="i" class="border-t">
                <td class="px-4 py-2 align-top">{{ i + 1 }}</td>
                <td class="px-4 py-2 align-top">{{ item.name }}</td>
                <td class="px-4 py-2 align-top">{{ item.status }}</td>
                <td class="px-4 py-2 align-top">{{ item.time || '-' }}</td>
              </tr>

              <tr v-if="modalList.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-gray-500">Belum ada detail.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end gap-3">
          <button class="px-4 py-2 rounded border" @click="closeModal">Close</button>
          <button class="px-4 py-2 rounded bg-blue-500 text-white" @click="downloadModalCSV">Download CSV</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

/* tanggal display (Today dd-mm-yyyy) */
const today = new Date()
const pad = (n) => (n < 10 ? '0' + n : n)
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`

/* report type select */
const reportType = ref('monthly')

/* sample aggregated rows (biasanya dihitung server-side) */
const reportRows = ref([
  { key: 'attendance', name: 'Attendance', count: 12 },
  { key: 'present', name: 'Present', count: 3 },
  { key: 'late', name: 'Late', count: 5 },
  { key: 'onleave', name: 'On Leave', count: 5 },
])

/* modal state */
const showModal = ref(false)
const modalRow = ref(null)
const modalList = ref([]) // detail list anggota untuk row

/** onMounted: bisa fetch ringkasan dari API */
onMounted(async () => {
  // TODO: jika punya endpoint, fetch ringkasan laporan di sini
  // contoh:
  // const res = await api.get(`/reports/summary?type=${reportType.value}&date=...`)
  // reportRows.value = res.data.rows
})

/** View detail row => fetch detail list (demo: sample static) */
async function viewRow(row) {
  modalRow.value = row
  showModal.value = true

  // TODO: ganti dengan panggilan API nyata untuk detail berdasarkan row.key dan date
  // contoh: const res = await api.get(`/reports/detail?type=${row.key}&date=...`)
  // modalList.value = res.data.items

  // demo static data
  if (row.key === 'present') {
    modalList.value = [
      { name: 'Ozan', status: 'Present', time: '07:40 AM' },
      { name: 'Lina', status: 'Present', time: '07:50 AM' },
      { name: 'Budi', status: 'Present', time: '08:00 AM' },
    ]
  } else if (row.key === 'late') {
    modalList.value = [
      { name: 'Andi', status: 'Late', time: '09:05 AM' },
      { name: 'Sari', status: 'Late', time: '08:30 AM' },
      { name: 'Rina', status: 'Late', time: '08:45 AM' },
    ]
  } else if (row.key === 'onleave') {
    modalList.value = [
      { name: 'Titin', status: 'On Leave', time: '' },
      { name: 'Dedi', status: 'On Leave', time: '' },
    ]
  } else {
    // attendance = semua records
    modalList.value = [
      { name: 'Ozan', status: 'Present', time: '07:40 AM' },
      { name: 'Lina', status: 'Present', time: '07:50 AM' },
      { name: 'Budi', status: 'Present', time: '08:00 AM' },
      { name: 'Andi', status: 'Late', time: '09:05 AM' },
      { name: 'Titin', status: 'On Leave', time: '' },
      // ...
    ]
  }
}

/** tutup modal */
function closeModal() {
  showModal.value = false
  modalRow.value = null
  modalList.value = []
}

/** Export CSV untuk satu row ringkasan (client-side) */
function exportRow(row) {
  // TODO: jika backend punya export endpoint, langsung panggil endpoint itu
  // client-side: buat CSV dari dummy detail (sama seperti viewRow)
  viewRow(row)
  // setelah modalList terisi, langsung download CSV:
  setTimeout(() => downloadModalCSV(), 100) // kecil delay supaya modalList terisi (demo)
}

/** download CSV dari modalList */
function downloadModalCSV() {
  if (!modalList.value || modalList.value.length === 0) {
    alert('Tidak ada data untuk di-export.')
    return
  }

  const headers = ['Name', 'Status', 'Time']
  const rows = modalList.value.map((r) => [r.name, r.status, r.time || ''])
  const csvContent =
    [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${modalRow.value?.key || 'report'}_${reportType.value}_${pad(today.getDate())}${pad(today.getMonth()+1)}${today.getFullYear()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  // jika ingin menutup modal setelah download: closeModal()
}
</script>

<style scoped>
/* jika perlu style tambahan, tambahkan di sini */
</style>
