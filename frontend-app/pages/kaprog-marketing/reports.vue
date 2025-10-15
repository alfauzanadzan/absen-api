<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">KAPROG MARKETING</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/kaprog-marketing/profilkaprog" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/kaprog-marketing/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/kaprog-marketing/reports" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">📊 Reports</a>
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
        class="mt-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto border border-white/30 transition hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
      >
        <table class="min-w-full text-gray-800">
          <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Department</th>
              <th class="text-center px-6 py-3 font-semibold">Total Employees</th>
              <th class="text-right px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-if="employees.length > 0"
              class="border-t border-white/40 hover:bg-white/30 transition duration-200"
            >
              <td class="px-6 py-4">Marketing</td>
              <td class="px-6 py-4 text-center">{{ totalEmployees }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  @click="viewDetails"
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-else>
              <td colspan="3" class="px-6 py-8 text-center text-gray-100 font-semibold">
                Tidak ada data laporan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Detail -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg w-11/12 md:w-2/3 p-6 shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Employee List (Marketing)</h3>
          <button class="text-gray-600 hover:text-black" @click="showModal = false">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-4">
          Total Employees: <strong>{{ totalEmployees }}</strong>
        </p>

        <div class="max-h-72 overflow-y-auto border rounded">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2">No</th>
                <th class="text-left px-4 py-2">Username</th>
                <th class="text-left px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(emp, i) in employees" :key="i" class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{{ i + 1 }}</td>
                <td class="px-4 py-2">{{ emp.username }}</td>
                <td class="px-4 py-2">{{ emp.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            class="px-4 py-2 rounded border hover:bg-gray-100 transition"
            @click="showModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { useRuntimeConfig } from "#imports"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"

const reportType = ref("daily")
const totalEmployees = ref(0)
const employees = ref<any[]>([])
const showModal = ref(false)
const displayDate = ref("")

// === Generate tanggal sesuai report type ===
function updateDisplayDate() {
  const today = new Date()
  const pad = (n: number) => (n < 10 ? "0" + n : n)

  if (reportType.value === "daily") {
    displayDate.value = `Tanggal ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`
  } else if (reportType.value === "weekly") {
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay() + 1)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    displayDate.value = `Minggu ${pad(start.getDate())}-${pad(start.getMonth() + 1)} s/d ${pad(end.getDate())}-${pad(end.getMonth() + 1)}`
  } else if (reportType.value === "monthly") {
    const month = today.toLocaleString("default", { month: "long" })
    displayDate.value = `Bulan ${month} ${today.getFullYear()}`
  }
}

// === Fetch Data Karyawan Marketing ===
const fetchEmployees = async () => {
  try {
    const res = await fetch(`${apiBase}/users`)
    if (!res.ok) throw new Error("Gagal fetch data users.")
    const data = await res.json()

    const filtered = data.filter(
      (u: any) =>
        u.role === "PEKERJA" &&
        (u.department?.toLowerCase?.() === "marketing" ||
          u.departmentName?.toLowerCase?.() === "marketing")
    )

    employees.value = filtered
    totalEmployees.value = filtered.length
  } catch (err) {
    console.error("fetchEmployees error:", err)
  }
}

function viewDetails() {
  showModal.value = true
}

onMounted(() => {
  updateDisplayDate()
  fetchEmployees()
})
watch(reportType, updateDisplayDate)
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
}
</style>
