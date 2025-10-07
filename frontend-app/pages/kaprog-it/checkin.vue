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
      message.value = json?.message ?? "✅ Absen berhasil!"
    } catch {
      message.value = text || "✅ Absen berhasil!"
    }

    // ✅ Notifikasi sukses
    alert("✅ Absen berhasil!")

    // ✅ Redirect ke dashboard setelah 1 detik
    setTimeout(() => {
      router.push("/kaprog-it/kaprogit")
    }, 1000)

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

  await loadUser()

  if (!user.value?.id || !user.value?.role) {
    message.value = "⚠️ User belum terload atau role tidak tersedia"
    debounceLock = false
    return
  }

  console.log("🔍 Barcode yang di-scan:", raw)

  try {
    const token = getToken()
    const res = await fetch(`${apiBase}/departments/barcode/${encodeURIComponent(raw)}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) {
      message.value = "❌ Barcode tidak valid atau tidak ditemukan"
      debounceLock = false
      return
    }

    const barcode = await res.json()
    console.log("🏢 Barcode result:", barcode)

    const payload = {
      userId: String(user.value.id),
      role: String(user.value.role),
      qrValue: String(raw),
    }

    console.log("📦 Payload final (checkin):", payload)
    await postAttendance(payload)
  } catch (error: any) {
    console.error("❌ Gagal ambil data barcode:", error)
    message.value = "⚠️ Gagal ambil data barcode"
  }

  setTimeout(() => {
    debounceLock = false
  }, 2000)
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
      qrReader.reset?.()
      qrReader = null
    }
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
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
     <aside class="w-60 bg-white p-6 flex flex-col">
       <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-blue-600">KAPROG IT</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-it/kaprogit" class="p-2 rounded hover:bg-gray-400">🏠 Dashboard</a>
        <a href="/kaprog-it/checkin" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">🕓 Check-in</a>
        <a href="/kaprog-it/checkout" class="p-2 rounded hover:bg-gray-400">⏰ Check-out</a>
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
