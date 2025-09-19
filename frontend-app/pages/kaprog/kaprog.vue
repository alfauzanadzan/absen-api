<script setup lang="ts">
definePageMeta({ middleware: ["role"] })

import { ref, onMounted, onBeforeUnmount } from "vue"
const { user, loadUser, logout } = useAuth()

// ---------- JAM REALTIME ----------
const time = ref("")
let clockInterval: NodeJS.Timer | null = null
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

// ---------- STATE ----------
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const statusMessage = ref("")
const mode = ref<"checkin" | "checkout" | null>(null)

let stream: MediaStream | null = null
let animationId: number | null = null
let barcodeDetector: any = null
let jsQRFn: any = null
let jsQRReady = false

// ---------- INIT ----------
onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  stopScanner()
  if (clockInterval) clearInterval(clockInterval)
})

// ---------- LOAD JSQR ----------
const loadJsQR = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as any).jsQR) {
      jsQRFn = (window as any).jsQR
      jsQRReady = true
      return resolve()
    }
    const s = document.createElement("script")
    s.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"
    s.onload = () => {
      jsQRFn = (window as any).jsQR
      jsQRReady = true
      resolve()
    }
    s.onerror = () => reject()
    document.head.appendChild(s)
  })

// ---------- START SCANNER ----------
const startScanner = async (type: "checkin" | "checkout") => {
  mode.value = type
  statusMessage.value = `Mode ${type.toUpperCase()} - Mengaktifkan kamera...`
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    if (!videoRef.value) throw new Error("Video tidak ditemukan")
    videoRef.value.srcObject = stream
    await videoRef.value.play()

    if ((window as any).BarcodeDetector) {
      const formats = await (window as any).BarcodeDetector.getSupportedFormats()
      barcodeDetector = new (window as any).BarcodeDetector({ formats })
      statusMessage.value = `Arahkan barcode untuk ${type}`
    } else {
      await loadJsQR()
      statusMessage.value = `Arahkan QR untuk ${type} (jsQR fallback)`
    }
    tick()
  } catch (err: any) {
    statusMessage.value = "Gagal akses kamera: " + err.message
  }
}

// ---------- STOP SCANNER ----------
const stopScanner = () => {
  if (animationId) cancelAnimationFrame(animationId)
  animationId = null
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.srcObject = null
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
}

// ---------- LOOP DETEKSI ----------
const tick = async () => {
  if (!videoRef.value) {
    animationId = requestAnimationFrame(tick)
    return
  }
  try {
    if (barcodeDetector) {
      const detections = await barcodeDetector.detect(videoRef.value)
      if (detections?.length) {
        const raw = detections[0].rawValue ?? ""
        if (raw) return handleCode(raw)
      }
    }
    if (canvasRef.value && jsQRReady) {
      const video = videoRef.value
      const ctx = canvasRef.value.getContext("2d")
      if (ctx && video.videoWidth) {
        canvasRef.value.width = video.videoWidth
        canvasRef.value.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const img = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight)
        const code = jsQRFn(img.data, video.videoWidth, video.videoHeight)
        if (code) return handleCode(code.data)
      }
    }
  } catch (e) {
    console.error(e)
  }
  animationId = requestAnimationFrame(tick)
}
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
        <aside class="w-60 bg-white p-6 flex flex-col ">
      <div class="flex items-center justify-center h-20 mb-6">
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog/kaprog" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a href="/kaprog/profilkaprog" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/kaprog/employees" class="p-2 rounded hover:bg-gray-200">Employees</a>
        <a href="/kaprog/attendance" class="p-2 rounded hover:bg-gray-200">Attendance</a>
        <a href="/kaprog/reports" class="p-2 rounded hover:bg-gray-200">Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, {{ user?.username }}</h2>
          <p class="text-sm text-gray-600 uppercase">{{ user?.role }}</p>
        </div>
        <button @click="logout" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
          Log Out
        </button>
      </div>

      <div class="flex flex-col items-center mt-20">
        <p class="text-8xl font-bold">{{ time }}</p>
        <p class="mt-4 text-gray-600">Pilih mode check-in / check-out dan scan barcode</p>

                <div class="flex gap-4 mt-8">
          <!-- Ganti event @click dengan router-link -->
          <router-link
            to="/kaprog/checkin"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Check In (Scan)
          </router-link>

          <router-link
            to="/kaprog/checkout"
            class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Check Out (Scan)
          </router-link>
        </div>

        <p class="mt-4 text-gray-600">{{ statusMessage }}</p>
        
      </div>
    </main>
  </div>
</template>

<style scoped>
video {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
