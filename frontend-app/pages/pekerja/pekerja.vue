<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // middleware cek role
  roles: ["PEKERJA"],   // hanya role PEKERJA yang bisa akses
})

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useAuth } from "@/composables/useAuth"

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
  })
}

// Saat mount, load user + jalankan jam
onMounted(async () => {
  await loadUser()
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
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
  <div class="flex h-screen bg-white-100">
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
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
        </div>

        <!-- Logout -->
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
        <p class="text-8xl font-bold">{{ time }}</p>

        <!-- Status -->
        <p class="mt-4 text-gray-600">You have not checked in today</p>

        <!-- Tombol aksi -->
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
  </div>
</template>
