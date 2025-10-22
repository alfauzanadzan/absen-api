<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
})

import { ref, onMounted, onBeforeUnmount } from "vue"
const { user, loadUser, logout } = useAuth()

const time = ref("")
let interval: NodeJS.Timer | null = null

const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

onMounted(async () => {
  await loadUser()
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg bg-white/30 shadow hover:bg-white/40 transition">🏠 Dashboard</a>
        <a href="/admin/daftar-department" class="p-3 rounded-lg hover:bg-white/20 transition">🏢 Daftar Department</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main Dashboard -->
    <main class="flex-1 p-8">
      <div class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-2xl font-bold text-white drop-shadow-md">
            WELCOME, {{ user?.username }}
          </h2>
          <p class="text-sm text-white/80 uppercase">{{ user?.role }}</p>
        </div>

        <button
          @click="logout()"
          class="px-5 py-2 bg-white/30 backdrop-blur-md text-white font-bold rounded-lg shadow hover:bg-white/50 transition">
          Log Out
        </button>
      </div>

      <!-- Jam Digital -->
      <div
        class="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-12 mx-auto text-center max-w-2xl">
        <p class="text-8xl font-extrabold text-white drop-shadow-md mb-6">{{ time }}</p>
      </div>
    </main>
  </div>
</template>
