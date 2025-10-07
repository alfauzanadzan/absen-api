<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <!-- Logo bisa taruh di sini -->
      </div>
      <nav class="flex flex-col space-y-2">
        <a
          href="/kaprog-marketing/kaprogmarketing"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Dashboard
        </a>
        <a href="/kaprog-marketing/profilkaprog" class="p-2 rounded hover:bg-gray-200">
          Profile
        </a>
        <a href="/kaprog-marketing/employees" class="p-2 rounded hover:bg-gray-200">
          Employees
        </a>
        <a href="/kaprog-marketing/attendance" class="p-2 rounded hover:bg-gray-200">
          Attendance
        </a>
        <a href="/kaprog-marketing/reports" class="p-2 rounded hover:bg-gray-200">
          Reports
        </a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
          <p class="text-sm text-gray-600 uppercase">MARKETING</p>
        </div>
        <button
          @click="logout"
          class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Log Out
        </button>
      </div>

      <!-- Clock + Scan Mode -->
      <div class="flex flex-col items-center mt-20">
        <p class="text-8xl font-bold">{{ time }}</p>
        <p class="mt-4 text-gray-600">
          Pilih mode Check-in / Check-out untuk melakukan absensi via barcode
        </p>

        <div class="flex gap-4 mt-8">
          <!-- ✅ Ganti path sesuai folder kaprog-marketing -->
          <router-link
            to="/kaprog-marketing/checkin"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Check In (Scan)
          </router-link>

          <router-link
            to="/kaprog-marketing/checkout"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Check Out (Scan)
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser, logout } = useAuth()

// ---------- JAM REALTIME ----------
const time = ref("")
let clockInterval: ReturnType<typeof setInterval> | null = null

const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style scoped>
/* Styling opsional */
</style>
