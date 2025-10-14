<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRuntimeConfig, useRouter } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"
const router = useRouter()
const { user, loadUser } = useAuth()

// ---------- STATE ----------
const time = ref("")
const message = ref<string | null>(null)
const scanning = ref(false)
const cameraError = ref<string | null>(null)
let clockInterval: number | null = null
let qrReader: any = null
const videoRef = ref<HTMLVideoElement | null>(null)

// ---------- CLOCK ----------
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// ---------- JWT ----------
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

// ---------- API POST ATTENDANCE ----------
const postAttendance = async (payload: {
  userId: string
  role: string
  qrValue: string
}) => {
  message.value = "⏳ Mengirim data absen..."
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {}

    if (!res.ok) {
      console.error("❌ Error response:", data)
      message.value = `❌ Gagal simpan absen: ${data?.message || text || res.statusText}`
      return false
    }

    message.value = "✅ Absen berhasil!"
    alert("✅ Absen berhasil!")

    // 🔁 Redirect sesuai role user
    setTimeout(() => {
      if (user.value?.role === "KAPROG") {
        router.push("/kaprog-it/kaprogit")
      } else if (user.value?.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    }, 1000)

    return true
  } catch (err: any) {
    console.error("⚠️ postAttendance error:", err)
    message.value = `⚠️ Gagal kirim ke server: ${err.message}`
    return false
  }
}

// ---------- QR SCANNER ----------
let debounceLock = false
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return
  debounceLock = true

  console.log("🔍 QR Terdeteksi:", raw)
  await loadUser()

  if (!user.value?.id || !user.value?.role) {
    message.value = "⚠️ Data user belum siap. Coba lagi."
    debounceLock = false
    return
  }

  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/departments/barcode/${encodeURIComponent(raw)}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) {
      message.value = "❌ QR Code tidak valid atau tidak ditemukan."
      debounceLock = false
      return
    }

    const barcode = await res.json()
    console.log("🏢 Data barcode:", barcode)

    const payload = {
      userId: String(user.value.id),
      role: String(user.value.role),
      qrValue: String(raw),
    }

    console.log("📦 Payload dikirim:", payload)
    await postAttendance(payload)
  } catch (error: any) {
    console.error("❌ Error ambil data barcode:", error)
    message.value = "⚠️ Gagal ambil data barcode"
  }

  setTimeout(() => (debounceLock = false), 2000)
}

// ---------- ZXING SCANNER ----------
const startScanner = async () => {
  cameraError.value = null
  scanning.value = false

  if (!videoRef.value) {
    cameraError.value = "Video element belum siap"
    return
  }

  try {
    const ZXing = await import("@zxing/browser")
    qrReader = new ZXing.BrowserMultiFormatReader()
    scanning.value = true

    await qrReader.decodeFromConstraints(
      { video: { facingMode: { ideal: "environment" } } },
      videoRef.value,
      (result: any, err: any) => {
        if (result) handleDecodedRaw(result.getText())
        else if (err && err.name !== "NotFoundException")
          console.debug("Scanner error:", err)
      }
    )
  } catch (e: any) {
    console.error("ZXing init error:", e)
    cameraError.value = e?.message || "Gagal inisialisasi kamera"
    scanning.value = false
  }
}

const stopScanner = () => {
  try {
    qrReader?.reset?.()
    qrReader = null
  } finally {
    scanning.value = false
  }
}

// ---------- LIFECYCLE ----------
onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  await startScanner()
})

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval)
  stopScanner()
})
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">KAPROG IT</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-it/kaprogit" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/kaprog-it/checkin" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">🕓 Check-in</a>
        <a href="/kaprog-it/checkout" class="p-3 rounded-lg hover:bg-white/20 transition">⏰ Check-out</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Scan QR Department</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code department Anda</p>
            <p class="text-xs text-gray-400 mt-1">
              Department: {{ user?.department?.name || "Belum ada" }}
            </p>
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

            <div
              class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm"
            >
              <div>
                <span v-if="scanning">🔍 Scanning...</span>
                <span v-else>⏸ Paused</span>
              </div>
              <div>
                <button
                  v-if="scanning"
                  @click="stopScanner"
                  class="px-3 py-1 bg-red-500 rounded text-xs"
                >
                  Stop
                </button>
                <button
                  v-else
                  @click="startScanner"
                  class="px-3 py-1 bg-green-500 rounded text-xs"
                >
                  Start
                </button>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="text-center mt-2">
            <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
            <p
              v-else-if="message"
              class="text-sm"
              :class="message.includes('✅') ? 'text-green-600' : 'text-red-600'"
            >
              {{ message }}
            </p>
            <p v-else class="text-sm text-gray-500">📱 Siap melakukan Check-in</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}
</style>
