<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col ">
      <!-- Logo -->
       <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <!-- Menu -->
      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header + Add button -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">SCHEDULE</h1>
        <button
          @click="openAddSchedule"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Add Schedule
        </button>
      </div>

      <!-- Schedule cards -->
      <!-- Schedule cards -->
<div class="flex justify-center flex-wrap gap-4 mb-8">
  <div
    v-for="(item, idx) in schedules"
    :key="idx"
    class="bg-gray-100 px-6 py-4 rounded text-center w-48 shadow"
  >
    <div class="text-xl font-bold">{{ item.time }}</div>
    <div class="text-sm uppercase text-gray-600">{{ item.department }}</div>
  </div>
</div>


      <!-- Real-time clock -->
      <div class="text-4xl font-bold text-center">
        {{ time }} <span class="text-lg">AM</span>
      </div>
    </main>

    <!-- Modal Add Schedule -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg w-11/12 md:w-1/3 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Schedule</h3>
        <form @submit.prevent="addSchedule">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Time</label>
            <input v-model="newSchedule.time" required class="w-full border px-3 py-2 rounded" />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Department</label>
            <input v-model="newSchedule.department" required class="w-full border px-3 py-2 rounded" />
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" class="px-4 py-2 rounded border" @click="closeModal">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded bg-blue-500 text-white">Add</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const schedules = ref([
  { time: '08.00-16.00', department: 'PROGRAMMING' },
  { time: '08.00-16.00', department: 'DESAINER' },
  { time: '08.00-16.00', department: 'MARKETING' },
])

// Real-time clock
const time = ref('')
function updateClock() {
  const d = new Date()
  const pad = (n) => (n < 10 ? '0' + n : n)
  let hours = d.getHours() % 12
  if (hours === 0) hours = 12
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())
  time.value = `${pad(hours)}:${minutes}:${seconds}`
}
onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})

// Modal Add Schedule
const showModal = ref(false)
const newSchedule = ref({ time: '', department: '' })

function openAddSchedule() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  newSchedule.value = { time: '', department: '' }
}

function addSchedule() {
  schedules.value.push({ ...newSchedule.value })
  closeModal()
}
</script>

<style scoped>
/* optional: scrollbar styling */
</style>
