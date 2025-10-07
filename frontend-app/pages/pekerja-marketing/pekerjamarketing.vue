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
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
       <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-blue-600">PEKERJA MARKETING</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/pekerja-marketing/pekerjamarketing" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">🏠 Dashboard</a>
        <a href="/pekerja-marketing/profilpekerja" class="p-2 rounded hover:bg-gray-100">Profile</a>
        <a href="/pekerja-marketing/reports" class="p-2 rounded hover:bg-gray-100">Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">
            WELCOME, {{ user?.username || "User" }}
          </h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
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
      <div class="flex flex-col items-center justify-center mt-20">
        <!-- Jam besar -->
        <p class="text-8xl font-bold tracking-wide">{{ time }}</p>

        <!-- Status -->
        <p class="mt-4 text-gray-600">
          You have not checked in today
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
