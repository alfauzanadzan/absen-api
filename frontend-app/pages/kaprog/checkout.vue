<script setup lang="ts">
definePageMeta({ middleware: ["role"] })
import { ref, onMounted, onBeforeUnmount } from "vue"
const { user, loadUser, logout } = useAuth()

// clock
const time = ref("")
let clockInterval: number | null = null
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit", // ✅ koma sudah benar
  })
}

// scanner state
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const statusMessage = ref("")
const mode = ref<"checkout">("checkout")

let stream: MediaStream | null = null
let animationId: number | null = null
let barcodeDetector: any = null
let jsQRFn: any = null
let jsQRReady = false
let processingLock = false

onMounted(async () => {
  await loadUser()
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  startScanner("checkout")
})

onBeforeUnmount(() => {
  stopScanner()
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }
})

// load jsQR fallback
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
    s.onerror = () => reject(new Error("Failed load jsQR"))
    document.head.appendChild(s)
  })

// start scanner
const startScanner = async (type: "checkout") => {
  statusMessage.value = `Mode ${type.toUpperCase()} - Mengaktifkan kamera...`
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    })
    if (!videoRef.value) throw new Error("Video element tidak tersedia")
    videoRef.value.srcObject = stream
    await videoRef.value.play()

    if ((window as any).BarcodeDetector) {
      try {
        const formats = await (window as any).BarcodeDetector.getSupportedFormats()
        barcodeDetector = new (window as any).BarcodeDetector({ formats })
        statusMessage.value = `Arahkan barcode untuk ${type}`
      } catch {
        barcodeDetector = null
        await loadJsQR()
        statusMessage.value = `Arahkan QR untuk ${type} (jsQR fallback)`
      }
    } else {
      await loadJsQR()
      statusMessage.value = `Arahkan QR untuk ${type} (jsQR fallback)`
    }
    tick()
  } catch (err: any) {
    statusMessage.value = "Gagal akses kamera: " + (err?.message || err)
    console.error("startScanner error:", err)
  }
}

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
  processingLock = false
}

// handle detected code
const handleCode = async (raw: string) => {
  if (!raw) return
  if (processingLock) return
  processingLock = true
  try {
    let userId = raw
    try {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.userId) userId = parsed.userId
    } catch {
      // not json
    }

    const token = localStorage.getItem("token")
    const endpoint = "http://localhost:3000/attendance/checkout"

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    })

    if (res.ok) {
      statusMessage.value = `✅ Absen checkout berhasil untuk ${userId}`
    } else {
      const text = await res.text().catch(() => "")
      statusMessage.value = `❌ Gagal absen: ${res.status} ${text}`
    }
  } catch (err) {
    console.error("handleCode error:", err)
    statusMessage.value = "⚠ Error saat proses absen"
  } finally {
    setTimeout(() => {
      processingLock = false
    }, 900)
  }
}

// main loop
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
        if (raw) {
          await handleCode(raw)
          return
        }
      }
    }

    if (canvasRef.value && jsQRReady) {
      const video = videoRef.value
      const ctx = canvasRef.value.getContext("2d")
      if (ctx && video.videoWidth) {
        canvasRef.value.width = video.videoWidth
        canvasRef.value.height = video.videoHeight
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const img = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight)
        const code = jsQRFn(img.data, video.videoWidth, video.videoHeight)
        if (code && code.data) {
          await handleCode(code.data)
          return
        }
      }
    }
  } catch (e) {
    console.error("tick error:", e)
  }
  animationId = requestAnimationFrame(tick)
}
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6"></div>
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

      <div class="flex flex-col items-center mt-10">
        <p class="text-6xl font-bold">{{ time }}</p>
        <p class="mt-4 text-gray-600">Arahkan QR ke kamera untuk Check Out</p>

        <video ref="videoRef" autoplay muted playsinline class="mt-8 rounded shadow"></video>
        <canvas ref="canvasRef" class="hidden"></canvas>

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
