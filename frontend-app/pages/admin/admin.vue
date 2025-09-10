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
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <!-- Logo -->
       <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <!-- Menu -->
      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-400">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
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

        <!-- Jam + Logout -->
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
       <br>
       <br>
       <br>
      <div class="flex flex-col items-center justify-center mt-20">
        <!-- Jam besar -->
        <p class="text-8xl font-bold">{{ time }}</p>

        <!-- Status (contoh statis, bisa ambil dari DB juga) -->
        <p class="mt-4 text-gray-600">You have not checked in today</p>
        <br>

        <!-- Tombol aksi -->
        <div class="flex gap-4 mt-6">
          <button
            @click="checkIn"
            class="bg-blue-500 text-white font-semibold px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Check In
          </button>
          <button
            @click="checkOut"
            class="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Check Out
          </button>
        </div>
      </div>
    </main>
  </div>
</template>