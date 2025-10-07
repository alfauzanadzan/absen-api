<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useAuth } from "@/composables/useAuth"
import { useRouter } from "vue-router"

const { user, loadUser, logout } = useAuth()
const router = useRouter()

const time = ref("")
let interval: NodeJS.Timer | null = null

// 🔹 Update jam realtime
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

// 🔹 Lifecycle
onMounted(async () => {
  await loadUser()
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})

// 🔹 Navigasi
const goToCheckinScanner = () => router.push("/pekerja-it/checkin")
const goToCheckoutScanner = () => router.push("/pekerja-it/checkout")
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r p-6 flex flex-col">
      <div class="flex items-center justify-center h-16 mb-8">
        <h1 class="text-xl font-bold text-blue-600">PEKERJA IT</h1>
      </div>

      <nav class="flex flex-col space-y-2 text-gray-700">
        <NuxtLink to="/pekerja-it/dashboard" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/pekerja-it/profilpekerja" class="p-2 rounded hover:bg-gray-100">
          Profile
        </NuxtLink>
        <NuxtLink to="/pekerja-it/reports" class="p-2 rounded hover:bg-gray-100">
          Reports
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center">
      <!-- Header -->
      <div class="flex justify-between items-center w-full mb-8">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username || "Guest" }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
          <p class="text-sm text-gray-600 uppercase">IT</p>
        </div>

        <button
          @click="logout"
          class="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>

      <!-- Clock & Actions -->
      <p class="text-8xl font-bold tracking-widest">{{ time }}</p>
      <p class="mt-4 text-gray-600 text-lg">Silakan lakukan absensi hari ini</p>

      <div class="flex gap-6 mt-8">
        <button
          @click="goToCheckinScanner"
          class="bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-blue-600 transition"
        >
          Check In
        </button>
        <button
          @click="goToCheckoutScanner"
          class="bg-red-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-red-700 transition"
        >
          Check Out
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Opsional styling tambahan */
</style>
