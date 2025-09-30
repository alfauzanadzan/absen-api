<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // middleware cek role
  roles: ["PEKERJA"],   // hanya role PEKERJA yang bisa akses
})

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser, logout } = useAuth()

// Clock
const time = ref("")
let interval: ReturnType<typeof setInterval> | null = null
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
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
})

// --- Navigasi ke halaman scan ---
const goCheckIn = () => {
  navigateTo("/pekerja/checkin")
}

const goCheckOut = () => {
  navigateTo("/pekerja/checkout")
}
</script>

<template>
  <div class="flex h-screen bg-white-100 relative">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-8 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6"></div>

      <nav class="flex flex-col space-y-2 text-gray-700">
        <a
          href="/pekerja/pekerja"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Dashboard
        </a>
        <a href="/pekerja/profilpekerja" class="p-2 rounded hover:bg-gray-100">
          Profile
        </a>
        <a href="/pekerja/reports" class="p-2 rounded hover:bg-gray-100">
          Reports
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto z-10">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
        </div>

        <!-- Logout -->
        <div class="flex items-center gap-4">
          <button @click="logout" type="button" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Log Out</button>
        </div>
      </div>

      <!-- Clock + Actions -->
      <div class="flex flex-col items-center justify-center mt-20">
        <p class="text-8xl font-bold">{{ time }}</p>

        <!-- Status -->
        <p class="mt-4 text-gray-600">You have not checked in today</p>

        <div class="flex gap-4 mt-6">
          <button
            @click="goCheckIn"
            class="bg-blue-500 text-white font-semibold px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Check In
          </button>
          <button
            @click="goCheckOut"
            class="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Check Out
          </button>
        </div>
      </div>
    </main>

    <!-- Scanner Modal (v-show + pointer-events safe) -->
    <div
      :class="['fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity', showScanner ? '' : 'opacity-0 pointer-events-none']"
      role="dialog"
      aria-modal="true"
      v-show="showScanner"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-lg font-semibold">
            {{ scanningMode === 'checkin' ? 'Scan QR untuk Check-in' : 'Scan QR untuk Check-out' }}
          </h3>
          <div>
            <button class="px-3 py-1 rounded bg-gray-100" @click="closeScanner" type="button">Cancel</button>
          </div>
        </div>

        <div class="flex flex-col items-center gap-3">
          <div class="w-full aspect-video bg-black rounded overflow-hidden">
            <video ref="videoEl" autoplay playsinline muted class="w-full h-full object-cover"></video>
          </div>
          <p v-if="scanMessage" class="text-sm text-red-500">{{ scanMessage }}</p>
          <p v-else class="text-sm text-gray-600">Arahkan kamera ke QR code. Scanner akan otomatis mendeteksi.</p>
        </div>
      </div>
    </div>
  </div>
</template>
