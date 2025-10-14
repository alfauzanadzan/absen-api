<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // middleware cek role
})

import { ref, onMounted, onBeforeUnmount } from "vue"
const { user, loadUser, logout } = useAuth()

// State jam realtime
const time = ref("")
let interval: NodeJS.Timer | null = null

const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
     hour12: false, // ⬅️ Tambahkan ini biar hilang AM/PM
  })
}

// Saat mount, load user + jalankan jam
onMounted(async () => {
  await loadUser() // ambil user dari DB / API
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})

// --- ACTION KE DATABASE ---
const checkIn = async () => {
  try {
    await $fetch("/api/attendance/checkin", { method: "POST" })
    alert("Check-in berhasil!")
  } catch (err) {
    console.error(err)
    alert("Gagal check-in")
  }
}

const checkOut = async () => {
  try {
    await $fetch("/api/attendance/checkout", { method: "POST" })
    alert("Check-out berhasil!")
  } catch (err) {
    console.error(err)
    alert("Gagal check-out")
  }
}
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">🏠 Dashboard</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 relative overflow-y-auto">
      <!-- Header dengan Logout di pojok kanan atas -->
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

      <!-- Card utama -->
      <div
        class="flex flex-col items-center justify-center mt-28 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-12 mx-auto text-center max-w-2xl"
      >
        <!-- Jam besar -->
        <p class="text-8xl font-extrabold text-white drop-shadow-md mb-6">
          {{ time }}
        </p>

      </div>
    </main>
  </div>
</template>