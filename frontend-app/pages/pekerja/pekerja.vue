<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
})

import { ref, onMounted, onBeforeUnmount } from "vue"
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

/* QR Scanner state */
const showScanner = ref(false)
const scanningMode = ref<"checkin" | "checkout" | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
let QrScanner: any = null
let scannerInstance: any = null
const scanning = ref(false)
const scanMessage = ref<string | null>(null)

const openScanner = async (mode: "checkin" | "checkout") => {
  console.log("openScanner called", mode)
  scanningMode.value = mode
  scanMessage.value = null

  // only run camera on client
  if (typeof window === "undefined") {
    scanMessage.value = "Scanner hanya tersedia di browser."
    return
  }

  // dynamic import
  if (!QrScanner) {
    try {
      const mod = await import("qr-scanner")
      QrScanner = mod?.default ?? mod
    } catch (e) {
      console.error("Import qr-scanner gagal:", e)
      scanMessage.value = "Gagal memuat library scanner."
      return
    }
  }

  if (!videoEl.value) {
    scanMessage.value = "Video element belum tersedia."
    return
  }

  showScanner.value = true

  // stop existing if any
  if (scannerInstance) {
    try { await scannerInstance.stop() } catch {}
    scannerInstance = null
  }

  try {
    scannerInstance = new QrScanner(
      videoEl.value,
      (result: string) => onScanned(result),
      { highlightScanRegion: true }
    )
    await scannerInstance.start()
    scanning.value = true
    console.log("scanner started")
  } catch (e: any) {
    console.error("Gagal memulai scanner:", e)
    scanMessage.value = e?.message ?? "Gagal akses kamera. Cek permission."
    // close scanner UI jika gagal start
    showScanner.value = false
    scanning.value = false
  }
}

const closeScanner = async () => {
  try {
    if (scannerInstance) {
      await scannerInstance.stop()
      scannerInstance.destroy && scannerInstance.destroy()
    }
  } catch (e) {
    console.warn("closeScanner error:", e)
  } finally {
    scannerInstance = null
    showScanner.value = false
    scanning.value = false
    scanningMode.value = null
    scanMessage.value = null
  }
}

const onScanned = async (qrValue: string) => {
  console.log("onScanned:", qrValue)
  try { if (scannerInstance) await scannerInstance.stop() } catch {}
  scanning.value = false

  const mode = scanningMode.value
  if (!mode) {
    alert("Mode tidak diketahui")
    await closeScanner()
    return
  }

  try {
    const url = mode === "checkin" ? "/api/attendance/checkin" : "/api/attendance/checkout"
    await $fetch(url, { method: "POST", body: { qrValue } })
    alert(`${mode === "checkin" ? "Check-in" : "Check-out"} berhasil!`)
  } catch (err: any) {
    console.error("submit error:", err)
    const message = err?.data?.message ?? err?.message ?? "Gagal melakukan absen"
    alert(message)
  } finally {
    await closeScanner()
  }
}

/* Buttons handlers with debug logs */
const checkIn = async () => {
  console.log("checkIn clicked")
  if (!user.value) {
    alert("User belum terautentikasi.")
    return
  }
  await openScanner("checkin")
}

const checkOut = async () => {
  console.log("checkOut clicked")
  if (!user.value) {
    alert("User belum terautentikasi.")
    return
  }
  await openScanner("checkout")
}
</script>

<template>
  <div class="flex h-screen bg-white-100 relative">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-8 flex flex-col z-10">
      <div class="flex items-center justify-center h-20 mb-6"></div>
      <nav class="flex flex-col space-y-2 text-gray-700">
        <a href="/pekerja/pekerja" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a href="/pekerja/profilpekerja" class="p-2 rounded hover:bg-gray-100">Profile</a>
        <a href="/pekerja/reports" class="p-2 rounded hover:bg-gray-100">Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto z-10">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
        </div>

        <div class="flex items-center gap-4">
          <button @click="logout" type="button" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Log Out</button>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center mt-20">
        <p class="text-8xl font-bold">{{ time }}</p>
        <p class="mt-4 text-gray-600">You have not checked in today</p>

        <div class="flex gap-4 mt-6">
          <button @click="checkIn" type="button" class="bg-blue-500 text-white font-semibold px-6 py-2 rounded hover:bg-blue-600 transition">Check In</button>

          <button @click="checkOut" type="button" class="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition">Check Out</button>
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

<style scoped>
/* memastikan overlay tidak menangkap klik saat v-show=false karena pointer-events-none ditambahkan via class */
</style>
