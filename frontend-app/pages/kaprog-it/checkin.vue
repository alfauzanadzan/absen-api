<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRuntimeConfig } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"

const { user, loadUser } = useAuth()

// ---------- STATE ----------
const time = ref("")
const message = ref<string | null>(null)
const scanning = ref(false)
const cameraError = ref<string | null>(null)
let clockInterval: number | null = null

// ZXing reader + video ref
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

// Ambil token JWT
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

// ---------- API POST ATTENDANCE ----------
const postAttendance = async (payload: { userId: string; role: string; qrValue: string }) => {
  message.value = null
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

    const text = await res.text().catch(() => "")

    if (!res.ok) {
      message.value = `❌ Gagal: ${res.status} ${text || res.statusText}`
      return false
    }

    try {
      const json = text ? JSON.parse(text) : {}
      message.value = json?.message ?? "✅ Absen berhasil"
    } catch {
      message.value = text || "✅ Absen berhasil"
    }
    return true
  } catch (err: any) {
    console.error("postAttendance error", err)
    message.value = `⚠️ Error koneksi: ${err?.message || err}`
    return false
  }
}

// ---------- QR DECODE ----------
let debounceLock = false
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return
  debounceLock = true

  if (!user.value?.id || !user.value?.role) {
    message.value = "⚠️ User belum terload atau role tidak tersedia"
    debounceLock = false
    return
  }

  console.log("🔍 Barcode yang di-scan:", raw)

  if (raw.startsWith("DEPT-")) {
    console.log("✅ Barcode department terdeteksi")
  } else {
    console.log("❌ Barcode bukan format department")
  }

  const payload = {
    userId: String(user.value.id),
    role: String(user.value.role),
    qrValue: String(raw),
  }

  console.log("📤 Payload ke backend:", JSON.stringify(payload))
  await postAttendance(payload)

  setTimeout(() => {
    debounceLock = false
  }, 2000)
}

// ---------- ZXing SCANNER ----------
const startScanner = async () => {
  cameraError.value = null
  scanning.value = false

  if (typeof window === "undefined") {
    cameraError.value = "Client-only"
    return
  }
  if (!videoRef.value) {
    cameraError.value = "Video element belum siap"
    return
  }

  try {
    const ZXing = await import("@zxing/browser")
    qrReader = new ZXing.BrowserMultiFormatReader()
    scanning.value = true

    const constraints = { video: { facingMode: { ideal: "environment" } } }

    await qrReader.decodeFromConstraints(
      constraints,
      videoRef.value,
      (result: any, err: any) => {
        if (result) {
          handleDecodedRaw(result.getText())
        } else if (err && err.name !== "NotFoundException") {
          console.debug("Scanner error:", err)
        }
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
    if (qrReader) {
      try {
        qrReader.reset()
      } catch {}
      qrReader = null
    }
  } finally {
    scanning.value = false
  }
}

// ---------- LIFECYCLE ----------
onMounted(async () => {
  if (typeof window !== "undefined") await loadUser()
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  if (typeof window !== "undefined") await startScanner()
})

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval)
  stopScanner()
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6"></div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-it/kaprogit" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/kaprog-it/checkin" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Check-in</a>
        <a href="/kaprog-it/checkout" class="p-2 rounded hover:bg-gray-400">Check-out</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Scan QR Department</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code di depan ruangan department Anda</p>
            <p class="text-xs text-gray-400 mt-1">Department Anda: {{ user?.department?.name || 'Belum ada' }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ time }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ user?.username ?? "KAPROG" }}</div>
          </div>
        </div>

        <!-- Scanner -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow">
            <client-only>
              <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover"></video>
            </client-only>

            <div class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm">
              <div>
                <span v-if="scanning">🔍 Scanning QR Department...</span>
                <span v-else>⏸ Paused</span>
              </div>
              <div>
                <button v-if="scanning" @click="stopScanner" class="px-3 py-1 bg-red-500 rounded text-xs">Stop</button>
                <button v-else @click="startScanner" class="px-3 py-1 bg-green-500 rounded text-xs">Start</button>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="text-center">
            <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
            <p v-else-if="message" class="text-sm" :class="message.includes('berhasil') ? 'text-green-600' : 'text-red-600'">{{ message }}</p>
            <p v-else class="text-sm text-gray-500">Siap memindai QR Department</p>
          </div>

          <!-- Info tambahan -->
          <div class="text-xs text-gray-500 text-center">
            <p>📱 Scan QR Code yang ditempel di depan ruangan department Anda</p>
            <p>🔒 Hanya bisa absen di department sendiri</p>
            <p>📍 Pastikan Anda berada di lokasi yang benar</p>
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
  transform: scaleX(-1); /* mirror camera agar natural */
}
</style>
