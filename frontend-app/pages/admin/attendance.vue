<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar (sama style kaprog) -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-400">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="mb-25">
        <h1 class="text-3xl font-bold">ATTENDANCE</h1>
      </div>

      <!-- Date + Mark button -->
      <div class="flex items-center gap-4 mb-6">
        <input
          readonly
          :value="displayDate"
          class="flex-1 border px-3 py-2"
        />
        <button
          @click="markAllPresent"
          class="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition"
        >
          Mark Attendance
        </button>
      </div>

      <!-- Table -->
      <div class="bg-white border-t border-b">
        <table class="min-w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left px-6 py-4 font-semibold">Nama</th>
              <th class="text-left px-6 py-4 font-semibold">Time</th>
              <th class="text-left px-6 py-4 font-semibold">Status</th>
              <th class="text-left px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="rec in attendances" :key="rec.id" class="border-b">
              <td class="px-6 py-4">{{ rec.name }}</td>
              <td class="px-6 py-4">{{ rec.time }}</td>
              <td class="px-6 py-4">{{ rec.status }}</td>
              <td class="px-6 py-4">
                <button
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  @click="openEdit(rec)"
                >
                  Edit
                </button>
              </td>
            </tr>

            <tr v-if="attendances.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                Belum ada data kehadiran hari ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

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
            <label class="block text-sm font-medium mb-1">Time (HH:MM AM/PM)</label>
            <input v-model="editingRecord.time" required class="w-full border px-3 py-2 rounded" />
          </div>

          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select v-model="editingRecord.status" class="w-full border px-3 py-2 rounded">
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
              <option>Excused</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="px-4 py-2 rounded border" @click="closeModal">Batal</button>
            <button type="submit" class="px-4 py-2 rounded bg-blue-500 text-white">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

/** Tanggal hari ini (format seperti screenshot: dd-mm-yyyy) */
const today = new Date()
const pad = (n) => (n < 10 ? '0' + n : n)
const displayDate = `Today ${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

/** Sample employees (biasanya fetch dari API) */
const employees = ref([
  { id: 1, name: 'Ozan' },
  { id: 2, name: 'Lina' },
  { id: 3, name: 'Budi' },
])

/** Attendances untuk hari ini (initial empty -> bisa fetch dari backend) */
const attendances = ref([])

/** Modal edit */
const showModal = ref(false)
const editingRecord = reactive({
  id: null,
  name: '',
  time: '',
  status: '',
})

/** Util: format time saat ini ke HH:MM AM/PM */
function formatNowTime() {
  const d = new Date()
  let hours = d.getHours()
  const minutes = pad(d.getMinutes())
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${pad(hours)}:${minutes} ${ampm}`
}

/** Mark semua employee sebagai present (quick demo) */
function markAllPresent() {
  const now = formatNowTime()
  employees.value.forEach((emp) => {
    const existing = attendances.value.find((a) => a.empId === emp.id)
    if (existing) {
      existing.time = now
      existing.status = 'Present'
    } else {
      attendances.value.push({
        id: Date.now() + Math.random(), // unique
        empId: emp.id,
        name: emp.name,
        time: now,
        status: 'Present',
      })
    }
  })
}

/** Open edit modal */
function openEdit(rec) {
  editingRecord.id = rec.id
  editingRecord.name = rec.name
  editingRecord.time = rec.time
  editingRecord.status = rec.status
  showModal.value = true
}

/** Save perubahan edit ke array (dan kemudian ke API) */
function saveEdit() {
  const idx = attendances.value.findIndex((r) => r.id === editingRecord.id)
  if (idx !== -1) {
    attendances.value[idx].time = editingRecord.time
    attendances.value[idx].status = editingRecord.status
  }
  closeModal()
}

function closeModal() {
  showModal.value = false
  setTimeout(() => {
    editingRecord.id = null
    editingRecord.name = ''
    editingRecord.time = ''
    editingRecord.status = ''
  }, 150)
}

onMounted(() => {
  attendances.value = [
    { id: 1001, empId: 1, name: 'Ozan', time: '07:40 AM', status: 'Present' },
  ]
})
</script>
