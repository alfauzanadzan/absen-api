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

// 🧭 Mode
const mode = ref<"checkin" | "checkout">("checkout")

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
    const res = await fetch(`${apiBase}/attendance/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text().catch(() => "")
    if (!res.ok) {
      message.value = `❌ Gagal checkout: ${text || res.statusText}`
      console.error(`❌ Gagal checkout:`, text)
      return false
    }

    const json = text ? JSON.parse(text) : {}
    message.value = json?.message ?? "✅ Checkout berhasil"
    return true
  } catch (err: any) {
    message.value = `⚠️ Error koneksi: ${err?.message || err}`
    console.error("postAttendance error", err)
    return false
  }
}

// 🧾 Modal alasan keluar awal
const showReasonModal = ref(false)
const reason = ref("")

const submitReason = async () => {
  if (!reason.value.trim()) {
    message.value = "⚠️ Isi alasan dulu sebelum checkout!"
    return
  }
  showReasonModal.value = false
  await postAttendance({
    userId: String(user.value?.id),
    qrValue: String(lastQr.value),
    reason: reason.value,
  })
}

// 🔍 QR Handling
let debounceLock = false
const lastQr = ref<string | null>(null)

const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return
  debounceLock = true

  await loadUser()
  if (!user.value?.id) {
    message.value = "⚠️ Data user belum siap"
    debounceLock = false
    return
  }

  const now = new Date()
  lastQr.value = raw

  // 💡 Kalau checkout sebelum jam 17:00 → minta alasan
  if (now.getHours() < 17) {
    showReasonModal.value = true
    debounceLock = false
    return
  }

  await postAttendance({
    userId: String(user.value.id),
    qrValue: String(raw),
  })

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
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">KAPROG Marketing</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/kaprog-marketing/checkin" class="p-3 rounded-lg hover:bg-white/20 transition">🕓 Check-in</a>
        <a href="/kaprog-marketing/checkout" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"> ⏰ Check-out</a>
      </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Check-out Department</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code untuk Check-out</p>
            <p class="text-xs text-gray-400 mt-1">Department Anda: {{ user?.department?.name || "Belum ada" }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ time }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ user?.username ?? "User" }}</div>
          </div>
        </div>

        <!-- Scanner -->
        <div class="flex flex-col items-center gap-4">
          <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow-lg">
            <client-only>
              <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover" />
            </client-only>

            <div class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm">
              <span>{{ scanning ? "🔍 Scanning..." : "⏸ Paused" }}</span>
              <button v-if="scanning" @click="stopScanner" class="px-3 py-1 bg-red-500 rounded text-xs">
                Stop
              </button>
              <button v-else @click="startScanner" class="px-3 py-1 bg-green-500 rounded text-xs">
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
            <p v-else class="text-sm text-gray-500">📱 Siap melakukan Check-out</p>
          </div>
        </div>
      </div>

      <!-- 🧾 Modal Alasan -->
      <div
        v-if="showReasonModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-96">
          <h2 class="text-lg font-bold mb-3">Alasan Keluar Sebelum Jam 17:00</h2>
          <textarea
            v-model="reason"
            rows="3"
            placeholder="Tulis alasan di sini..."
            class="w-full p-2 border rounded text-sm"
          ></textarea>
          <div class="flex justify-end mt-4 gap-2">
            <button @click="showReasonModal = false" class="px-3 py-1 bg-gray-300 rounded">Batal</button>
            <button @click="submitReason" class="px-3 py-1 bg-blue-500 text-white rounded">Kirim</button>
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
