<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // cek role user sebelum akses halaman
})

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser, logout } = useAuth()
const router = useRouter()

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

// Saat halaman dimount
onMounted(async () => {
  await loadUser()
  updateClock()
  interval = setInterval(updateClock, 1000)
})

// Bersihkan interval saat unmount
onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})

// Aksi Check-in → pindah ke halaman scanner check-in
const goToCheckinPage = () => {
  router.push("/pekerja-marketing/checkin")
}

// Aksi Check-out → pindah ke halaman scanner check-out
const goToCheckoutPage = () => {
  router.push("/pekerja-marketing/checkout")
}
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1
          class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide text-center"
        >
          PEKERJA MARKETING
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/pekerja-marketing/pekerjamarketing" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">🏠 Dashboard</a>
        <a href="/pekerja-marketing/profilpekerja" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/pekerja-marketing/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
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

        <!-- Tombol Logout -->
        <div class="flex items-center gap-4">
          <button
            @click="logout"
            class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <!-- Clock + Actions -->
      <div
        class="flex flex-col items-center justify-center mt-28 bg-white/20 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl p-12 mx-auto text-center max-w-2xl"
      >
        <!-- Realtime clock -->
        <p class="text-8xl font-extrabold text-white drop-shadow-md mb-6">
          {{ time }}
        </p>
        <p class="mt-4 text-gray-600">
          Pilih mode check-in / check-out dan scan barcode
        </p>

        <!-- Tombol aksi -->
        <div class="flex gap-4 mt-6">
          <button
            @click="goToCheckinPage"
            class="bg-blue-500 text-white font-semibold px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Check In
          </button>
          <button
            @click="goToCheckoutPage"
            class="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Check Out
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
}
</style>
