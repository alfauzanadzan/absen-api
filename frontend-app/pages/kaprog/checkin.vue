<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount } from "vue"
import { useRuntimeConfig } from "#imports"
import { useAuth } from "@/composables/useAuth"

const config = useRuntimeConfig()
const apiBase = config.public?.apiBase ?? "http://localhost:3000"

// user: { id: string, username: string, role: string }
const { user, loadUser } = useAuth()

// UI state
const time = ref("")
const message = ref<string | null>(null)
const scanning = ref(false)
const cameraError = ref<string | null>(null)
let clockInterval: number | null = null

// ZXing reader + video ref
let qrReader: any = null
const videoRef = ref<HTMLVideoElement | null>(null)

// clock
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// helper get token
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null

// send attendance POST
const postAttendance = async (payload: { userId: string; role: "PEKERJA" | "KAPROG"; qrValue: string }) => {
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
      message.value = `Gagal: ${res.status} ${text || res.statusText}`
      return false
    }

    try {
      const json = text ? JSON.parse(text) : {}
      message.value = json?.message ?? "Absen berhasil"
    } catch {
      message.value = text || "Absen berhasil"
    }
    return true
  } catch (err: any) {
    console.error("postAttendance error", err)
    message.value = `Error koneksi: ${err?.message || err}`
    return false
  }
}

// decode handler
let debounceLock = false
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return
  debounceLock = true

  if (!user.value?.id || !user.value?.role) {
    message.value = "User belum terload"
    debounceLock = false
    return
  }

  const actorRole: "PEKERJA" | "KAPROG" = (unref(user)?.role as "PEKERJA" | "KAPROG") ?? "KAPROG"
  
  // Payload sesuai DTO
  const payload = {
    userId: String(user.value.id),
    role: actorRole,
    qrValue: raw, // Bisa diubah "ABSEN-PINTU-1" jika scan pintu
  }

  await postAttendance(payload)

  setTimeout(() => {
    debounceLock = false
  }, 900)
}

// start ZXing
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
      } catch (e) {}
      qrReader = null
    }
  } finally {
    scanning.value = false
  }
}

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
    <aside class="w-60 bg-white p-6 border-r">
      <div class="flex items-center justify-center h-20 mb-6">
        <div class="text-lg font-bold">KAPROG</div>
      </div>
      <nav class="flex flex-col space-y-2">
        <NuxtLink to="/kaprog/kaprog" class="p-2 rounded hover:bg-gray-100">Dashboard</NuxtLink>
        <NuxtLink to="/kaprog/checkin" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Check-in</NuxtLink>
        <NuxtLink to="/kaprog/checkout" class="p-2 rounded hover:bg-gray-100">Check-out</NuxtLink>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto flex flex-col items-center">
      <div class="w-full max-w-2xl">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold">Scan QR Absen Kaprog</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code karyawan</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ time }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ user?.username ?? "KAPROG" }}</div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-4">
          <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow">
            <client-only>
              <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover"></video>
            </client-only>

            <div class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm">
              <div>
                <span v-if="scanning">🔍 Scanning...</span>
                <span v-else>⏸ Paused</span>
              </div>
              <div>
                <button v-if="scanning" @click="stopScanner" class="px-3 py-1 bg-red-500 rounded text-xs">Stop</button>
                <button v-else @click="startScanner" class="px-3 py-1 bg-green-500 rounded text-xs">Start</button>
              </div>
            </div>
          </div>

          <div class="text-center">
            <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
            <p v-else-if="message" class="text-sm text-green-600">{{ message }}</p>
            <p v-else class="text-sm text-gray-500">Siap memindai</p>
          </div>

          <div class="text-xs text-gray-500">Pastikan beri izin akses kamera pada browser. Gunakan localhost atau HTTPS.</div>
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
  transform: scaleX(-1); /* mirror front cam, bisa dihapus kalau pakai kamera belakang */
}
</style>
