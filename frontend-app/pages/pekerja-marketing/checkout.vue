<script setup lang="ts">
definePageMeta({ middleware: ["role"] });

import { ref, onMounted, onBeforeUnmount } from "vue";
import { useAuth } from "@/composables/useAuth";

const { user, loadUser } = useAuth();

// Jam realtime
const time = ref("");
let clockInterval: number | null = null;

// Scanner
const videoRef = ref<HTMLVideoElement | null>(null);
const scanning = ref(false);
const message = ref<string | null>(null);
const cameraError = ref<string | null>(null);

let qrReader: any = null;
let debounceLock = false;

// Update jam realtime
const updateClock = () => {
  time.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// ✅ Checkout pekerja via QR
const checkOut = async (qrValue: string) => {
  if (!user.value?.id) {
    message.value = "⚠️ User belum login";
    return;
  }

  try {
    const body = { userId: user.value.id, qrValue };

    // 🔥 FIX: tanpa /api, karena backend lo gak pakai global prefix
    const res = await $fetch("http://localhost:3000/attendance/checkout", {
      method: "POST",
      body,
    });

    message.value = res ? "✅ Check-out berhasil" : "✅ Check-out selesai";
  } catch (err: any) {
    console.error(err);
    message.value = `❌ Gagal check-out: ${err?.data?.message || err.message || err}`;
  }
};

// Handle QR hasil scan
const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return;
  debounceLock = true;

  await loadUser();
  console.log("QR scanned:", raw);
  await checkOut(raw);

  setTimeout(() => (debounceLock = false), 2000);
};

// Start scanner
const startScanner = async () => {
  cameraError.value = null;
  scanning.value = false;

  if (!videoRef.value) return (cameraError.value = "Video element belum siap");

  try {
    const ZXing = await import("@zxing/browser");
    qrReader = new ZXing.BrowserMultiFormatReader();
    scanning.value = true;

    const constraints = { video: { facingMode: { ideal: "environment" } } };

    await qrReader.decodeFromConstraints(constraints, videoRef.value, (result: any, err: any) => {
      if (result) handleDecodedRaw(result.getText());
      else if (err && err.name !== "NotFoundException") console.debug("Scanner error:", err);
    });
  } catch (err: any) {
    console.error("ZXing init error:", err);
    cameraError.value = err?.message || "Gagal inisialisasi kamera";
    scanning.value = false;
  }
};

// Stop scanner
const stopScanner = () => {
  if (qrReader) qrReader.reset?.();
  scanning.value = false;
};

// Lifecycle
onMounted(async () => {
  await loadUser();
  updateClock();
  clockInterval = window.setInterval(updateClock, 1000);

  if (user.value?.role === "PEKERJA") {
    await startScanner();
  }
});

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval);
  stopScanner();
});
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <main class="flex-1 p-8 flex flex-col items-center justify-center">
      <div class="w-full max-w-md">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold">Check-Out Absensi</h1>
          <div class="text-3xl font-bold mt-2">{{ time }}</div>
          <p class="text-gray-500 mt-1">{{ user?.username ?? "User" }}</p>
        </div>

        <div class="w-80 h-80 bg-black rounded overflow-hidden relative shadow mx-auto">
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

        <div class="text-center mt-4">
          <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
          <p
            v-else-if="message"
            class="text-sm"
            :class="message.includes('✅') ? 'text-green-600' : 'text-red-600'"
          >
            {{ message }}
          </p>
          <p v-else class="text-sm text-gray-500">📱 Siap melakukan Check-out</p>
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
