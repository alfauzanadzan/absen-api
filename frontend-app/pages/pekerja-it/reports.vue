<template>
  <div class="min-h-screen bg-white-100">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-60 bg-white p-8 flex flex-col ">
        <div class="flex items-center justify-center h-20 mb-6">
        </div>

        <nav class="flex flex-col space-y-2 text-gray-700">
          <a href="/pekerja-it/pekerjait" class="p-2 rounded hover:bg-gray-100">Dashboard</a>
          <a href="/pekerja-it/profilpekerja" class="p-2 rounded hover:bg-gray-100">Profile</a>
          <a href="/pekerja-it/reports" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Reports</a>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 p-6">
        <div class="mx-auto max-w-5xl">
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 class="text-3xl font-extrabold tracking-tight">REPORTS</h1>
              <p class="text-sm text-gray-500 mt-1">Laporan kehadiran pribadi — ringkasan dan detail per hari</p>
            </div>

            <div class="flex items-center gap-3">
              <button
                @click="importPdf"
                class="inline-flex items-center gap-2 bg-green-400 hover:bg-green-500 text-black px-4 py-2 rounded shadow"
                title="Import PDF"
              >
                <!-- simple icon -->
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M12 3v9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 15v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Import PDF
              </button>

              <button @click="downloadCSV" class="px-4 py-2 rounded border hover:bg-gray-50">
                Export CSV
              </button>

              <button @click="printPage" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                Print
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-white border rounded p-4 mb-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
              <div class="md:col-span-3">
                <label class="block text-xs text-gray-500 mb-1">Nama</label>
                <input type="text" v-model="currentUser" readonly class="w-full border rounded px-3 py-2 bg-gray-50" />
              </div>

              <div class="md:col-span-2 flex items-center gap-2">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">Bulan</label>
                  <div class="flex items-center gap-2">
                    <button @click="changeMonth(-1)" class="p-2 border rounded hover:bg-gray-100" aria-label="prev month">
                      ‹
                    </button>

                    <select v-model="selectedMonth" class="border rounded px-3 py-2">
                      <option v-for="(m, idx) in months" :key="idx" :value="idx">{{ m }}</option>
                    </select>

                    <button @click="changeMonth(1)" class="p-2 border rounded hover:bg-gray-100" aria-label="next month">
                      ›
                    </button>
                  </div>
                </div>
              </div>

              <div class="md:col-span-1 text-right">
                <label class="block text-xs text-gray-500 mb-1">Tahun</label>
                <input readonly :value="currentYear" class="border rounded px-3 py-2 bg-gray-50 w-full text-right" />
              </div>
            </div>
          </div>

          <!-- Summary cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded shadow-sm flex items-center gap-4 border">
              <div class="bg-green-50 p-3 rounded">
                <svg class="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-green-600">{{ stats.present }}</div>
                <div class="text-sm text-gray-500">Present</div>
              </div>
            </div>

            <div class="bg-white p-4 rounded shadow-sm flex items-center gap-4 border">
              <div class="bg-red-50 p-3 rounded">
                <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-red-600">{{ stats.late }}</div>
                <div class="text-sm text-gray-500">Late</div>
              </div>
            </div>

            <div class="bg-white p-4 rounded shadow-sm flex items-center gap-4 border">
              <div class="bg-yellow-50 p-3 rounded">
                <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="none"><path d="M12 2v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-yellow-500">{{ stats.leave }}</div>
                <div class="text-sm text-gray-500">Leave</div>
              </div>
            </div>

            <div class="bg-white p-4 rounded shadow-sm flex items-center gap-4 border">
              <div class="bg-indigo-50 p-3 rounded">
                <svg class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none"><path d="M3 7h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-indigo-600">{{ stats.absent }}</div>
                <div class="text-sm text-gray-500">Absent</div>
              </div>
            </div>
          </div>

          <!-- Data table -->
          <div class="bg-white border rounded shadow-sm overflow-auto">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="text-left px-6 py-3 font-medium text-sm">Date</th>
                  <th class="text-left px-6 py-3 font-medium text-sm">Check In</th>
                  <th class="text-left px-6 py-3 font-medium text-sm">Check Out</th>
                  <th class="text-left px-6 py-3 font-medium text-sm">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="rec in filteredRecords" :key="rec.date" class="odd:bg-white even:bg-gray-50 border-t">
                  <td class="px-6 py-4 text-sm text-gray-700">{{ rec.date }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700">{{ rec.checkIn || '-' }}</td>
                  <td class="px-6 py-4 text-sm text-gray-700">{{ rec.checkOut || '-' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span
                      :class="statusClass(rec.status)"
                      class="font-semibold"
                    >
                      {{ rec.status }}
                    </span>
                  </td>
                </tr>

                <tr v-if="filteredRecords.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-gray-400">Tidak ada data untuk bulan ini.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer actions -->
          <div class="mt-6 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-3">
            <div class="text-sm text-gray-500">Showing data for <strong>{{ months[selectedMonth] }}</strong> {{ currentYear }}</div>

            
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/* --- demo data (replace dengan API nyata) --- */
const currentUser = ref('Ozan') // ganti ambil dari auth/store pada implementasi nyata

const months = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]
const selectedMonth = ref(new Date().getMonth())
const currentYear = new Date().getFullYear()

const allRecords = ref([
  { date: '2025-09-03', checkIn: '07:30', checkOut: '17:00', status: 'Present' },
  { date: '2025-09-02', checkIn: '07:30', checkOut: '17:00', status: 'Leave' },
  { date: '2025-09-01', checkIn: '07:30', checkOut: '17:00', status: 'Late' },
  { date: '2025-08-31', checkIn: '07:35', checkOut: '17:02', status: 'Present' },
  { date: '2025-08-25', checkIn: null, checkOut: null, status: 'Absent' },
  // tambahkan data lain sesuai kebutuhan
])

/* --- computed --- */
const filteredRecords = computed(() =>
  allRecords.value
    .filter(r => {
      const d = new Date(r.date)
      return d.getMonth() === selectedMonth.value && d.getFullYear() === currentYear
    })
    .sort((a,b) => b.date.localeCompare(a.date))
)

const stats = computed(() => {
  const s = { present: 0, late: 0, leave: 0, absent: 0 }
  filteredRecords.value.forEach(r => {
    if (r.status === 'Present') s.present++
    else if (r.status === 'Late') s.late++
    else if (r.status === 'Leave') s.leave++
    else if (r.status === 'Absent') s.absent++
  })
  return s
})

/* --- helpers / actions --- */
function statusClass(status) {
  if (status === 'Present') return 'text-green-600'
  if (status === 'Late') return 'text-red-600'
  if (status === 'Leave') return 'text-yellow-600'
  if (status === 'Absent') return 'text-indigo-600'
  return 'text-gray-700'
}

function changeMonth(delta) {
  let next = selectedMonth.value + delta
  if (next < 0) next = 11
  if (next > 11) next = 0
  selectedMonth.value = next
}

function importPdf() {
  alert('Import PDF — implementasikan sesuai backend / parsing yang Anda butuhkan.')
}

function downloadCSV() {
  if (!filteredRecords.value.length) { alert('Tidak ada data untuk diexport'); return }
  const header = ['Date','Check In','Check Out','Status']
  const rows = filteredRecords.value.map(r => [r.date, r.checkIn || '', r.checkOut || '', r.status])
  const csv = [header, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentUser.value}_report_${months[selectedMonth.value]}_${currentYear}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function printPage() {
  window.print()
}

/* onMounted: ganti dengan fetch API nyata
onMounted(async () => {
  const res = await api.get(`/attendance?user=${currentUser.value}&month=${selectedMonth.value+1}&year=${currentYear}`)
  allRecords.value = res.data.records
})
*/
onMounted(() => {
  // demo only
})
</script>

<style scoped>
/* Slightly larger sticky header shadow on supported browsers */
thead.sticky {
  backdrop-filter: blur(4px);
}
@media print {
  aside { display: none; }
  main { padding: 0; }
}
</style>
