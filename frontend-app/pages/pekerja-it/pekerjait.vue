<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // Middleware untuk cek role user
})

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser, logout } = useAuth()

// State jam realtime
const time = ref("")
let interval: NodeJS.Timer | null = null

// Update jam tiap detik
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// Saat komponen dimount
onMounted(async () => {
  await loadUser() // ambil data user dari API/DB
  updateClock()
  interval = setInterval(updateClock, 1000)
})

// Bersihkan interval saat unmount
onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})

// --- ACTION KE DATABASE ---
const checkIn = async () => {
  try {
    await $fetch("/api/attendance/checkin", { method: "POST" })
    alert("✅ Check-in berhasil!")
  } catch (err) {
    console.error(err)
    alert("❌ Gagal check-in")
  }
}

const checkOut = async () => {
  try {
    await $fetch("/api/attendance/checkout", { method: "POST" })
    alert("✅ Check-out berhasil!")
  } catch (err) {
    console.error(err)
    alert("❌ Gagal check-out")
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r p-6 flex flex-col">
      <div class="flex items-center justify-center h-16 mb-8">
        <h1 class="text-xl font-bold text-blue-600">Worker IT</h1>
      </div>

      <nav class="flex flex-col space-y-2 text-gray-700">
        <NuxtLink
          to="/pekerja-it/pekerjait"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/pekerja-it/profilpekerja"
          class="p-2 rounded hover:bg-gray-100"
        >
          Profile
        </NuxtLink>
        <NuxtLink
          to="/pekerja-it/reports"
          class="p-2 rounded hover:bg-gray-100"
        >
          Reports
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold">
            WELCOME, {{ user?.username || "Guest" }}
          </h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
          <p class="text-sm text-gray-600 uppercase">IT</p>
        </div>

        <!-- Logout -->
        <div class="flex items-center gap-4">
          <button
            @click="logout"
            class="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <!-- Clock + Actions -->
      <div class="flex flex-col items-center justify-center mt-20">
        <!-- Jam besar -->
        <p class="text-8xl font-bold tracking-widest">{{ time }}</p>

        <!-- Status (contoh statis, bisa ambil dari DB juga) -->
        <p class="mt-4 text-gray-600 text-lg">
          You have not checked in today
        </p>

        <!-- Tombol aksi -->
        <div class="flex gap-6 mt-8">
          <button
            @click="checkIn"
            class="bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Check In
          </button>
          <button
            @click="checkOut"
            class="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-red-700 transition"
          >
            Check Out
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
