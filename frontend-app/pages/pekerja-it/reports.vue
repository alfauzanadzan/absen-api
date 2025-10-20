<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md border-r flex flex-col p-6">
      <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-xl font-extrabold text-blue-600 tracking-wide">PEKERJA IT</h1>
      </div>
      <nav class="flex flex-col space-y-3 text-gray-700 font-medium">
        <a href="/pekerja-it/pekerjait" class="p-3 rounded-lg hover:bg-gray-100 transition">🏠 Dashboard</a>
        <a href="/pekerja-it/profilpekerja" class="p-3 rounded-lg hover:bg-gray-100 transition">👤 Profile</a>
        <a href="/pekerja-it/reports" class="p-3 rounded-lg bg-blue-50 text-blue-600 shadow transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">REPORTS</h1>
          <p class="text-sm text-gray-500 mt-1">
            Laporan kehadiran pribadi — pekerja IT
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button @click="downloadCSV" class="px-4 py-2 rounded border hover:bg-gray-50">
            Export CSV
          </button>
          <button @click="printPage" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Print
          </button>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white border rounded-lg p-4 mb-6 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
          <div class="md:col-span-3">
            <label class="block text-xs text-gray-500 mb-1">Nama</label>
            <input
              type="text"
              v-model="currentUser"
              readonly
              class="w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>

          <div class="md:col-span-2 flex items-center gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Bulan</label>
              <div class="flex items-center gap-2">
                <button @click="changeMonth(-1)" class="p-2 border rounded hover:bg-gray-100">‹</button>
                <select v-model="selectedMonth" class="border rounded px-3 py-2">
                  <option v-for="(m, idx) in months" :key="idx" :value="idx">{{ m }}</option>
                </select>
                <button @click="changeMonth(1)" class="p-2 border rounded hover:bg-gray-100">›</button>
              </div>
            </div>
          </div>

          <div class="md:col-span-1 text-right">
            <label class="block text-xs text-gray-500 mb-1">Tahun</label>
            <input readonly :value="currentYear" class="border rounded px-3 py-2 bg-gray-50 w-full text-right" />
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          v-for="(val, key) in stats"
          :key="key"
          class="bg-white p-4 rounded shadow-sm flex items-center gap-4 border"
        >
          <div class="p-3 rounded" :class="bgClass(key)">
            <svg class="w-6 h-6" :class="iconColor(key)" viewBox="0 0 24 24" fill="none">
              <path v-if="key === 'present'" d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path v-else-if="key === 'late'" d="M12 8v4l3 3" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path v-else-if="key === 'leave'" d="M12 2v6" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path v-else d="M3 7h18" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <div class="text-2xl font-bold" :class="textColor(key)">
              {{ val }}
            </div>
            <div class="text-sm text-gray-500 capitalize">{{ key }}</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm overflow-auto">
        <table class="min-w-full table-auto">
          <thead class="bg-gray-50 sticky top-0">
            <tr>
              <th class="text-left px-6 py-3 font-medium text-sm">Tanggal</th>
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
              <td class="px-6 py-4 text-sm font-semibold" :class="statusColor(rec.status)">
                {{ rec.status }}
              </td>
            </tr>

            <tr v-if="filteredRecords.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-400">
                Tidak ada data absensi bulan ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 text-sm text-gray-500">
        Showing data for <strong>{{ months[selectedMonth] }}</strong> {{ currentYear }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

const API_BASE = "http://localhost:3000"

const currentUser = ref("Loading...")
const userId = ref("")
const allRecords = ref<any[]>([])
const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]
const selectedMonth = ref(new Date().getMonth())
const currentYear = new Date().getFullYear()

// 🔹 Map status backend -> frontend
function mapStatus(status: string) {
  status = status.toLowerCase()
  if (status === "present") return "present"
  if (status === "late") return "late"
  if (status === "early_out") return "leave"
  if (status === "overtime") return "present"
  if (status === "completed") return "present"
  return "absent"
}

// 🔹 Load profile + absensi
async function loadData() {
  const token = localStorage.getItem("token")
  if (!token) return alert("Token tidak ditemukan!")

  try {
    // Profil user
    const resProfile = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const profile = await resProfile.json()
    currentUser.value = profile.name || profile.username || "Pekerja IT"
    userId.value = profile.id

    // Ambil absensi user
    const res = await fetch(`${API_BASE}/attendance/user/${profile.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()

    allRecords.value = data.map((r: any) => ({
      date: r.date || new Date(r.createdAt).toISOString().split("T")[0],
      checkIn: r.checkInTime
        ? new Date(r.checkInTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : null,
      checkOut: r.checkOutTime
        ? new Date(r.checkOutTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        : null,
      status: mapStatus(r.status),
    }))
  } catch (err) {
    console.error("loadData error:", err)
  }
}

onMounted(loadData)

// 🔹 Filter per bulan
const filteredRecords = computed(() =>
  allRecords.value.filter((r) => {
    const d = new Date(r.date)
    return d.getMonth() === selectedMonth.value && d.getFullYear() === currentYear
  })
)

// 🔹 Statistik
const stats = computed(() => {
  const s = { present: 0, late: 0, leave: 0, absent: 0 }
  filteredRecords.value.forEach((r) => {
    const status = r.status.toLowerCase()
    if (status.includes("present")) s.present++
    else if (status.includes("late")) s.late++
    else if (status.includes("leave")) s.leave++
    else s.absent++
  })
  return s
})

// 🔹 Utils
function changeMonth(delta: number) {
  let next = selectedMonth.value + delta
  if (next < 0) next = 11
  if (next > 11) next = 0
  selectedMonth.value = next
}

function downloadCSV() {
  if (!filteredRecords.value.length) return alert("Tidak ada data untuk diexport")
  const header = ["Tanggal", "Check In", "Check Out", "Status"]
  const rows = filteredRecords.value.map((r) => [r.date, r.checkIn || "", r.checkOut || "", r.status])
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${currentUser.value}_report_${months[selectedMonth.value]}_${currentYear}.csv`
  link.click()
}

function printPage() {
  window.print()
}

// 🔹 Style helpers
function statusColor(status: string) {
  const s = status.toLowerCase()
  if (s.includes("present")) return "text-green-600"
  if (s.includes("late")) return "text-red-600"
  if (s.includes("leave")) return "text-yellow-600"
  if (s.includes("absent")) return "text-indigo-600"
  return "text-gray-700"
}
function bgClass(key: string) {
  return {
    present: "bg-green-50",
    late: "bg-red-50",
    leave: "bg-yellow-50",
    absent: "bg-indigo-50",
  }[key]
}
function iconColor(key: string) {
  return {
    present: "text-green-500",
    late: "text-red-500",
    leave: "text-yellow-500",
    absent: "text-indigo-500",
  }[key]
}
function textColor(key: string) {
  return {
    present: "text-green-600",
    late: "text-red-600",
    leave: "text-yellow-500",
    absent: "text-indigo-600",
  }[key]
}
</script>
