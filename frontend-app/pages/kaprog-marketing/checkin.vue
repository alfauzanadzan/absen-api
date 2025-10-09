<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig, useRouter } from '#imports'
import { useAuth } from '@/composables/useAuth'

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? 'http://localhost:3000'
const router = useRouter()
const { user, loadUser } = useAuth()

// ---------- STATE ----------
const time = ref('')
const message = ref<string | null>(null)
const scanning = ref(false)
const cameraError = ref<string | null>(null)
let clockInterval: number | null = null
let qrReader: any = null
const videoRef = ref<HTMLVideoElement | null>(null)

// ---------- CLOCK ----------
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ---------- JWT ----------
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null

// ---------- POST ATTENDANCE ----------
const postAttendance = async (payload: { userId: string; role: string; qrValue: string }) => {
  message.value = "⏳ Mengirim data absen..."
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      message.value = `❌ Gagal absen: ${data?.message || res.statusText}`
      return false
    }

    message.value = "✅ Absen berhasil!"
    alert("✅ Absen berhasil!")

    setTimeout(() => {
      if (user.value?.role === "KAPROG") router.push("/kaprog-marketing/kaprogmarketing")
      else if (user.value?.role === "ADMIN") router.push("/admin/dashboard")
      else router.push("/dashboard")
    }, 1000)

    return true
  } catch (err: any) {
    console.error(err)
    message.value = `⚠️ Gagal kirim ke server: ${err.message}`
    return false
  }
}

// ---------- HANDLE QR SCAN ----------
let debounceLock = false
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return
  debounceLock = true

  await loadUser()
  if (!user.value?.id || !user.value?.role) {
    message.value = "⚠️ Data user belum siap. Tunggu beberapa detik..."
    debounceLock = false
    return
  }

  // ✅ Pastikan hanya KAPROG Marketing yang bisa absen
  if (user.value.departmentName?.toLowerCase() !== "marketing" || user.value.role !== "KAPROG") {
    message.value = "❌ Hanya KAPROG Marketing yang bisa absen di sini"
    debounceLock = false
    return
  }

  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/departments/barcode/${encodeURIComponent(raw)}`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
    if (!res.ok) {
      message.value = "❌ QR Code tidak valid atau tidak sesuai department"
      debounceLock = false
      return
    }

    const payload = { userId: String(user.value.id), role: String(user.value.role), qrValue: raw }
    await postAttendance(payload)
  } catch (error: any) {
    console.error(error)
    message.value = "⚠️ Gagal ambil data barcode"
  }

  setTimeout(() => (debounceLock = false), 2000)
}

// ---------- ZXING SCANNER ----------
const startScanner = async () => {
  cameraError.value = null
  scanning.value = false
  if (!videoRef.value) { cameraError.value = "Video element belum siap"; return }

  try {
    const ZXing = await import("@zxing/browser")
    qrReader = new ZXing.BrowserMultiFormatReader()
    scanning.value = true
    await qrReader.decodeFromConstraints(
      { video: { facingMode: { ideal: "environment" } } },
      videoRef.value,
      (result: any, err: any) => { if (result) handleDecodedRaw(result.getText()) }
    )
  } catch (e: any) { cameraError.value = e?.message || "Gagal inisialisasi kamera"; scanning.value = false }
}

const stopScanner = () => { qrReader?.reset?.(); qrReader = null; scanning.value = false }

// ---------- LIFECYCLE ----------
onMounted(async () => { await loadUser(); updateClock(); clockInterval = window.setInterval(updateClock, 1000); await startScanner() })
onBeforeUnmount(() => { if (clockInterval) clearInterval(clockInterval); stopScanner() })
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-green-600">KAPROG MARKETING</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-2 rounded hover:bg-gray-400">🏠 Dashboard</a>
        <a href="/kaprog-marketing/checkin" class="p-2 rounded bg-green-50 text-green-600 font-medium">🕓 Check-in</a>
        <a href="/kaprog-marketing/checkout" class="p-2 rounded hover:bg-gray-400">⏰ Check-out</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Scan QR Department</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code Marketing Department</p>
            <p class="text-xs text-gray-400 mt-1">Department: {{ user?.department?.name || "Belum ada" }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ time }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ user?.username ?? "User" }}</div>
          </div>
        </div>

        <!-- Scanner -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow">
            <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover"></video>
            <div class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm">
              <div><span v-if="scanning">🔍 Scanning...</span><span v-else>⏸ Paused</span></div>
              <div>
                <button v-if="scanning" @click="stopScanner" class="px-3 py-1 bg-red-500 rounded text-xs">Stop</button>
                <button v-else @click="startScanner" class="px-3 py-1 bg-green-500 rounded text-xs">Start</button>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="text-center mt-2">
            <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
            <p v-else-if="message" class="text-sm" :class="message.includes('✅') ? 'text-green-600' : 'text-red-600'">{{ message }}</p>
            <p v-else class="text-sm text-gray-500">📱 Siap melakukan Check-in</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
</style>
