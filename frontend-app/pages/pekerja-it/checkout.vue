<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useRuntimeConfig, useRoute } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"

const { user, loadUser } = useAuth()
const route = useRoute()

// ⚙️ UI State
const time = ref("")
const message = ref<string | null>(null)
const scanning = ref(false)
const cameraError = ref<string | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
let qrReader: any = null
let clockInterval: number | null = null

// 🧭 Mode otomatis (check-in / check-out)
const mode = ref<"checkin" | "checkout">("checkin")
const updateMode = () => {
  mode.value = route.path.toLowerCase().includes("checkout") ? "checkout" : "checkin"
  console.log("🧭 Mode aktif:", mode.value)
}
updateMode()
watch(route, updateMode)

// 🕒 Jam real-time
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// 🔑 Token
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

// 📤 Kirim data ke backend
const postAttendance = async (payload: Record<string, any>) => {
  message.value = null
  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/attendance/${mode.value}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text().catch(() => "")
    if (!res.ok) {
      message.value = `❌ Gagal ${mode.value}: ${text || res.statusText}`
      console.error(`❌ Gagal ${mode.value}:`, text)
      return false
    }

    const json = text ? JSON.parse(text) : {}
    message.value =
      json?.message ?? `✅ ${mode.value === "checkin" ? "Check-in" : "Check-out"} berhasil`
    return true
  } catch (err: any) {
    message.value = `⚠️ Error koneksi: ${err?.message || err}`
    console.error("postAttendance error", err)
    return false
  }
}

// 🔍 Proses hasil QR
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

  console.log(`🔍 Barcode hasil scan (${mode.value}):`, raw)

  // 🚫 Batas jam check-out = 17:00 (jam 5 sore)
  if (mode.value === "checkout") {
    const now = new Date()
    if (now.getHours() < 17) {
      message.value = "⚠️ Check-out hanya dapat dilakukan setelah pukul 17:00"
      debounceLock = false
      return
    }
  }

  const payload =
    mode.value === "checkin"
      ? { userId: String(user.value.id), role: String(user.value.role), qrValue: String(raw) }
      : { userId: String(user.value.id), qrValue: String(raw) }

  await postAttendance(payload)

  setTimeout(() => (debounceLock = false), 2000)
}

// 📸 Scanner
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

    const constraints = { video: { facingMode: { ideal: "environment" } } }
    await qrReader.decodeFromConstraints(constraints, videoRef.value, (result: any, err: any) => {
      if (result) handleDecodedRaw(result.getText())
      else if (err && err.name !== "NotFoundException") console.debug("Scanner error:", err)
    })
  } catch (e: any) {
    cameraError.value = e?.message || "Gagal inisialisasi kamera"
    scanning.value = false
    console.error("ZXing init error:", e)
  }
}

// 🛑 Stop scanner
const stopScanner = () => {
  try {
    qrReader?.reset?.()
    qrReader = null
  } finally {
    scanning.value = false
  }
}

// 🚀 Lifecycle
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
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">PEKERJA IT</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/pekerja-it/pekerjait" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/pekerja-it/checkin" class="p-3 rounded-lg hover:bg-white/20 transition">🕓 Check-in</a>
        <a href="/pekerja-it/checkout" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"> ⏰ Check-out</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">
              {{ mode === "checkin" ? "Check-in Department" : "Check-out Department" }}
            </h1>
            <p class="text-sm text-gray-500">
              {{
                mode === "checkin"
                  ? "Arahkan kamera ke QR Code untuk Check-in"
                  : "Arahkan kamera ke QR Code untuk Check-out"
              }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              Department Anda: {{ user?.department?.name || "Belum ada" }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ time }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ user?.username ?? "User" }}
            </div>
          </div>
        </div>

        <!-- Scanner -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow-lg">
            <client-only>
              <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover" />
            </client-only>

            <div
              class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm"
            >
              <span>{{ scanning ? "🔍 Scanning..." : "⏸ Paused" }}</span>
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

          <!-- Status -->
          <div class="text-center mt-2">
            <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
            <p
              v-else-if="message"
              class="text-sm font-medium"
              :class="{
                'text-green-600': message.includes('✅'),
                'text-red-600': message.includes('❌'),
                'text-yellow-600': message.includes('⚠️'),
              }"
            >
              {{ message }}
            </p>
            <p v-else class="text-sm text-gray-500">
              {{
                mode === "checkin"
                  ? "📱 Siap melakukan Check-in"
                  : "📱 Siap melakukan Check-out"
              }}
            </p>
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
