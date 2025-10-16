<script setup lang="ts">
definePageMeta({ middleware: ["role"] });

import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "#imports";
import { useAuth } from "@/composables/useAuth";

const { user, loadUser } = useAuth();
const router = useRouter();

const time = ref("");
const message = ref<string | null>(null);
const cameraError = ref<string | null>(null);
const scanning = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);

let clockInterval: number | null = null;
let qrReader: any = null;
let debounceLock = false;

// 🕓 CLOCK
const updateClock = () => {
  time.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// ✅ CHECK-IN DENGAN GPS (KAPROG IT)
const checkIn = async (qrValue: string) => {
  if (!user.value?.id) {
    message.value = "⚠️ User belum login";
    return;
  }

  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("❌ Token tidak ditemukan. Silakan login ulang.");
      router.push("/login");
      return;
    }

    // ✅ Pastikan hanya KAPROG IT
    if (user.value.departmentName?.toLowerCase() !== "it" || user.value.role !== "KAPROG") {
      message.value = "❌ Hanya KAPROG IT yang bisa absen di sini.";
      return;
    }

    // 📍 Ambil lokasi GPS
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("📍 Lokasi:", latitude, longitude);

        const payload = {
          userId: user.value.id,
          role: user.value.role,
          qrValue,
          latitude,
          longitude,
        };

        // 🔍 Validasi QR Code Department
        const resDept = await fetch(
          `http://localhost:3000/departments/barcode/${encodeURIComponent(qrValue)}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resDept.ok) {
          message.value = "❌ QR Code tidak valid atau bukan untuk department IT.";
          return;
        }

        // 🚀 Kirim ke endpoint checkin
        const res = await fetch("http://localhost:3000/attendance/checkin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          message.value = `❌ Gagal absen: ${data?.message || res.statusText}`;
          return;
        }

        message.value = "✅ Check-in berhasil!";
        alert("✅ Check-in berhasil!");

        setTimeout(() => router.push("/kaprog-it/kaprogit"), 1000);
      },
      (err) => {
        console.error("GPS error:", err);
        alert("⚠️ Aktifkan izin lokasi browser kamu.");
        message.value = "❌ Gagal ambil lokasi GPS.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  } catch (err: any) {
    console.error("Check-in error:", err);
    message.value = `⚠️ Gagal check-in: ${err.message}`;
  }
};

// 🔍 HANDLE QR
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return;
  debounceLock = true;

  await loadUser();
  console.log("QR scanned:", raw);
  await checkIn(raw);

  setTimeout(() => (debounceLock = false), 2000);
};

// 📷 START SCANNER
const startScanner = async () => {
  cameraError.value = null;

  if (!videoRef.value) {
    cameraError.value = "Video element belum siap.";
    return;
  }

  try {
    const ZXing = await import("@zxing/browser");
    qrReader = new ZXing.BrowserMultiFormatReader();

    await qrReader.decodeFromConstraints(
      { video: { facingMode: { ideal: "environment" } } },
      videoRef.value,
      (result: any, err: any) => {
        if (result) handleDecodedRaw(result.getText());
        else if (err && err.name !== "NotFoundException") console.debug("Scanner error:", err);
      }
    );

    scanning.value = true;
  } catch (err: any) {
    console.error("ZXing init error:", err);
    cameraError.value = err?.message || "Gagal inisialisasi kamera";
    scanning.value = false;
  }
};

// 🛑 STOP SCANNER
const stopScanner = () => {
  if (qrReader) qrReader.reset?.();
  scanning.value = false;
};

// 🔄 LIFECYCLE
onMounted(async () => {
  await loadUser();
  updateClock();
  clockInterval = window.setInterval(updateClock, 1000);
  if (user.value?.role === "KAPROG") await startScanner();
});

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval);
  stopScanner();
});
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- SIDEBAR -->
    <aside class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide text-center">
          KAPROG IT
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-it/kaprogit" class="p-3 rounded-lg hover:bg-white/20 transition">
          🏠 Dashboard
        </a>
        <a href="/kaprog-it/checkin" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">
          🕓 Check-in
        </a>
        <a href="/kaprog-it/checkout" class="p-3 rounded-lg hover:bg-white/20 transition">
          ⏰ Check-out
        </a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8 flex flex-col items-center justify-center">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold">Check-in Department IT</h1>
          <div class="text-3xl font-bold mt-2">{{ time }}</div>
          <p class="text-gray-100 mt-1">{{ user?.username ?? "User" }}</p>
        </div>

        <!-- CAMERA -->
        <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow mx-auto">
          <video ref="videoRef" autoplay muted playsinline class="w-full h-full object-cover"></video>

          <div class="absolute left-0 right-0 bottom-0 p-3 bg-black/40 text-white flex items-center justify-between text-sm">
            <div><span v-if="scanning">🔍 Scanning...</span><span v-else>⏸ Paused</span></div>
            <div>
              <button v-if="scanning" @click="stopScanner" class="px-3 py-1 bg-red-500 rounded text-xs">Stop</button>
              <button v-else @click="startScanner" class="px-3 py-1 bg-green-500 rounded text-xs">Start</button>
            </div>
          </div>
        </div>

        <!-- STATUS -->
        <div class="text-center mt-4">
          <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
          <p v-else-if="message" class="text-sm" :class="message.includes('✅') ? 'text-green-600' : 'text-red-600'">
            {{ message }}
          </p>
          <p v-else class="text-sm text-gray-100">📱 Siap melakukan Check-in</p>
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
