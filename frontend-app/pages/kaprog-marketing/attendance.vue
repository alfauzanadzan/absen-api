<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6 font-bold text-xl">
        KAPROG MARKETING
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-2 rounded hover:bg-gray-100">Dashboard</a>
        <a href="/kaprog-marketing/profilkaprog" class="p-2 rounded hover:bg-gray-100">Profile</a>
        <a href="/kaprog-marketing/employees" class="p-2 rounded hover:bg-gray-100">Employees</a>
        <a href="/kaprog-marketing/attendance" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Attendance</a>
        <a href="/kaprog-marketing/reports" class="p-2 rounded hover:bg-gray-100">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">ATTENDANCE</h1>
          <div class="text-sm text-gray-500 mt-1">{{ displayDate }}</div>
        </div>

        <button
          @click="markAllPresent"
          class="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition"
        >
          Mark Attendance
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-left px-6 py-3 font-semibold">Position</th>
              <th class="text-left px-6 py-3 font-semibold">Time</th>
              <th class="text-left px-6 py-3 font-semibold">Status</th>
              <th class="text-left px-6 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rec in attendances"
              :key="rec.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4">{{ rec.name }}</td>
              <td class="px-6 py-4">{{ rec.position }}</td>
              <td class="px-6 py-4">{{ rec.time }}</td>
              <td class="px-6 py-4">{{ rec.status }}</td>
              <td class="px-6 py-4 text-center">
                <button
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  @click="openEdit(rec)"
                >
                  Edit
                </button>
              </td>
            </tr>

            <!-- Kalau belum ada data -->
            <tr v-if="attendances.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                Belum ada data kehadiran pekerja Marketing.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg w-11/12 md:w-1/3 p-6">
        <h3 class="text-lg font-semibold mb-4">Edit Attendance</h3>
        <form @submit.prevent="saveEdit">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Nama</label>
            <input
              readonly
              :value="editingRecord?.name"
              class="w-full border px-3 py-2 rounded bg-gray-50"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Time</label>
            <input
              v-model="editingRecord.time"
              required
              class="w-full border px-3 py-2 rounded"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select
              v-model="editingRecord.status"
              class="w-full border px-3 py-2 rounded"
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <button
              type="button"
              class="px-4 py-2 rounded border hover:bg-gray-50"
              @click="closeModal"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRuntimeConfig } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"
const { user, loadUser } = useAuth()

// Tanggal hari ini
const today = new Date()
const pad = (n: number) => (n < 10 ? "0" + n : String(n))
const displayDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`

// Attendance list
type AttendanceRow = {
  id: string
  userId: string
  name: string
  position: string
  time: string
  status: string
}
const attendances = ref<AttendanceRow[]>([])

const showModal = ref(false)
const editingRecord = ref<AttendanceRow | null>(null)

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

// Ambil data attendance khusus Marketing
const fetchAttendances = async () => {
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) return
    const data = await res.json().catch(() => [])

    const deptName = user.value?.departmentName ?? "MARKETING"

    attendances.value = (data || [])
      .filter((a: any) => a.departmentName === deptName && a.role === "PEKERJA")
      .map((a: any) => {
        const timeStr = a.timeIn
          ? new Date(a.timeIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-"
        return {
          id: a.id,
          userId: a.userId,
          name: a.user?.name ?? a.user?.username ?? "Unknown",
          position: a.user?.role ?? "-",
          time: timeStr,
          status: a.status ?? "-",
        }
      })
  } catch (err) {
    console.error("fetchAttendances error", err)
  }
}

function markAllPresent() {
  alert("✅ Fitur Mark semua hadir untuk departemen Marketing — coming soon...")
}

function openEdit(rec: AttendanceRow) {
  editingRecord.value = { ...rec }
  showModal.value = true
}

async function saveEdit() {
  if (!editingRecord.value) return

  const token = getToken()
  try {
    await fetch(`${apiBase}/attendance/${editingRecord.value.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        time: editingRecord.value.time,
        status: editingRecord.value.status,
      }),
    })
  } catch (e) {
    console.error("update attendance error", e)
  }

  const idx = attendances.value.findIndex((r) => r.id === editingRecord.value?.id)
  if (idx !== -1) {
    attendances.value[idx].time = editingRecord.value.time
    attendances.value[idx].status = editingRecord.value.status
  }
  closeModal()
}

function closeModal() {
  showModal.value = false
  editingRecord.value = null
}

onMounted(async () => {
  await loadUser()
  await fetchAttendances()
})
</script>
