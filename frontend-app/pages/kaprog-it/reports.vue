<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-blue-600">KAPROG IT</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-it/kaprogit" class="p-2 rounded hover:bg-gray-100">Dashboard</a>
        <a href="/kaprog-it/profilkaprog" class="p-2 rounded hover:bg-gray-100">Profile</a>
        <a href="/kaprog-it/attendance" class="p-2 rounded hover:bg-gray-100">Attendance</a>
        <a
          href="/kaprog-it/reports"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Reports
        </a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <h1 class="text-3xl font-bold mb-8">Reports - Kehadiran Pekerja IT</h1>

      <!-- Filter -->
      <div class="flex items-center gap-4 mb-6">
        <select
          v-model="reportType"
          class="border px-3 py-2 flex-1 rounded"
        >
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
        </select>

        <div class="flex-1 text-right">
          <input
            readonly
            :value="displayDate"
            class="w-1/2 border px-3 py-2 rounded text-right"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr class="border-b">
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-center px-6 py-3 font-semibold">Status</th>
              <th class="text-center px-6 py-3 font-semibold">Check-in</th>
              <th class="text-center px-6 py-3 font-semibold">Checkout</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(row, idx) in reportRows"
              :key="idx"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4">{{ row.name }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  class="px-2 py-1 rounded text-xs font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': row.status === 'PRESENT',
                    'bg-yellow-100 text-yellow-700': row.status === 'LATE',
                    'bg-gray-100 text-gray-700': row.status === 'COMPLETED',
                    'bg-red-100 text-red-700': row.status === 'ABSENT'
                  }"
                >
                  {{ row.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">{{ row.checkin || '-' }}</td>
              <td class="px-6 py-4 text-center">{{ row.checkout || '-' }}</td>
            </tr>

            <tr v-if="reportRows.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                Tidak ada data kehadiran pekerja IT.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Export -->
      <div class="mt-6 text-right">
        <button
          class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
          @click="downloadCSV"
        >
          Export CSV
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRuntimeConfig } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"
const { user, loadUser } = useAuth()

// --- DATE ---
const today = new Date()
const pad = (n: number) => (n < 10 ? "0" + n : String(n))
const displayDate = `Today ${pad(today.getDate())}-${pad(
  today.getMonth() + 1
)}-${today.getFullYear()}`

// --- STATE ---
const reportType = ref("daily")
const reportRows = ref<any[]>([])

// --- FETCH ATTENDANCE DATA ---
const fetchReport = async () => {
  await loadUser()
  console.log("👤 USER:", user.value)

  const deptName = user.value?.departmentName?.toLowerCase() ?? "it"

  try {
    const res = await fetch(`${apiBase}/attendance/reports?type=${reportType.value}`)
    if (!res.ok) throw new Error("Gagal mengambil data laporan.")
    const data = await res.json()
    console.log("🧠 DATA DARI API:", data)

    reportRows.value = data
      .filter((a: any) => {
        const role = a.user?.role
        const userDept = a.user?.departmentName?.toLowerCase() || ""
        return role === "PEKERJA" && userDept.includes(deptName)
      })
      .map((a: any) => ({
        name: a.user?.name || a.user?.username || "Unknown",
        status: a.status?.toUpperCase() || "PRESENT",
        checkin: a.timeIn
          ? new Date(a.timeIn).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "-",
        checkout: a.timeOut
          ? new Date(a.timeOut).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "-",
      }))

    console.log("✅ FILTERED ROWS:", reportRows.value)
  } catch (err) {
    console.error("fetchReport error:", err)
    reportRows.value = []
  }
}

// --- WATCH FILTER TYPE ---
watch(reportType, fetchReport)

// --- EXPORT CSV ---
function downloadCSV() {
  if (!reportRows.value.length) {
    alert("Tidak ada data untuk diekspor.")
    return
  }

  const headers = ["Nama", "Status", "Check-in", "Checkout"]
  const rows = reportRows.value.map((r) => [
    r.name,
    r.status,
    r.checkin || "-",
    r.checkout || "-",
  ])
  const csvContent = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c)}"`).join(","))
    .join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `laporan_pekerja_IT_${reportType.value}_${pad(today.getDate())}${pad(
    today.getMonth() + 1
  )}${today.getFullYear()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// --- LIFECYCLE ---
onMounted(fetchReport)
</script>
