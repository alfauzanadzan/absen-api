<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted } from "vue"
import { QrcodeStream } from "vue-qrcode-reader"
const { user, loadUser, logout } = useAuth()

// State
const time = ref("")
const message = ref("")
let interval: NodeJS.Timer | null = null

// Jam realtime
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

// Saat berhasil decode QR
const onDecode = async (userId: string) => {
  try {
    const res = await fetch("http://localhost:3000/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      message.value = "✅ Absen berhasil (Kaprog)!"
    } else {
      message.value = "❌ Gagal absen!"
    }
  } catch (err) {
    console.error(err)
    message.value = "⚠️ Error koneksi!"
  }
}

// Kamera gagal diinisialisasi
const onInit = (promise: Promise<any>) => {
  promise.catch((e) => {
    console.error("Camera init error:", e)
    message.value = "⚠️ Kamera tidak bisa diakses"
  })
}
</script>

<template>
  <br>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col ">
      <div class="flex items-center justify-center h-20 mb-6">
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/kaprog/kaprog" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/kaprog/checkin" class="p-2 rounded hover:bg-gray-400">Check-in</a>
        <a href="/kaprog/checkout" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Check-out</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      

      <!-- Jam Realtime -->
      <p class="text-5xl font-bold mb-6">{{ time }}</p>

      <h1 class="text-2xl font-bold mb-4">Scan QR Absen Kaprog</h1>

      <!-- QR Scanner -->
      <div class="w-[300px] h-[300px] bg-black rounded overflow-hidden">
        <qrcode-stream @decode="onDecode" @init="onInit" />
      </div>

      <p class="mt-4 text-gray-600">Arahkan kamera ke QR Code untuk absen</p>
      <p v-if="message" class="mt-2 font-semibold text-green-600">{{ message }}</p>
    </main>
  </div>
</template>

<style scoped>
.qrcode-stream-camera {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
