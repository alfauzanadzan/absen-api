<script setup lang="ts">
definePageMeta({ middleware: ["role"] });

import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "#imports";
import { useAuth } from "@/composables/useAuth";

const { user, loadUser } = useAuth();
const router = useRouter();

const time = ref("");
let clockInterval: number | null = null;
const videoRef = ref<HTMLVideoElement | null>(null);
const scanning = ref(false);
const message = ref<string | null>(null);
const cameraError = ref<string | null>(null);

const manualCode = ref(""); // ✅ Tambahan untuk input manual

let qrReader: any = null;
let debounceLock = false;

const updateClock = () => {
  time.value = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// ---------- CHECK-IN ----------
const checkIn = async (qrValue: string) => {
  if (!user.value?.id) {
    message.value = "⚠️ User belum login";
    return;
  }

  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan, silakan login ulang.");
      router.push("/login");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const body = {
          userId: user.value.id,
          role: user.value.role,
          qrValue,
          latitude,
          longitude,
        };

        const res = await $fetch("http://localhost:3000/attendance/checkin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body,
        });

        console.log("Check-in response:", res);
        message.value = "✅ Absen berhasil!";
        alert("✅ Absen berhasil!");

        setTimeout(() => {
          router.push("/pekerja-marketing/pekerjait");
        }, 1000);
      },
      (err) => {
        console.error("❌ Gagal ambil lokasi:", err);
        alert("⚠️ Aktifkan izin lokasi browser kamu.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } catch (err: any) {
    console.error("Check-in error:", err);
    message.value = `❌ Gagal check-in: ${
      err?.data?.message || err.message || err
    }`;
  }
};

const handleDecodedRaw = async (raw: string) => {
  if (!raw || debounceLock) return;
  debounceLock = true;

  await loadUser();
  console.log("QR scanned:", raw);
  await checkIn(raw);

  setTimeout(() => (debounceLock = false), 2000);
};

const startScanner = async () => {
  cameraError.value = null;

  if (!videoRef.value) {
    cameraError.value = "Video element belum siap";
    return;
  }

  try {
    const ZXing = await import("@zxing/browser");
    qrReader = new ZXing.BrowserMultiFormatReader();

    const constraints = { video: { facingMode: { ideal: "environment" } } };

    await qrReader.decodeFromConstraints(
      constraints,
      videoRef.value,
      (result: any, err: any) => {
        if (result) handleDecodedRaw(result.getText());
      }
    );

    scanning.value = true;
  } catch (err: any) {
    console.error("ZXing init error:", err);
    cameraError.value = err?.message || "Gagal inisialisasi kamera";
    scanning.value = false;
  }
};

const stopScanner = () => {
  if (qrReader) qrReader.reset?.();
  scanning.value = false;
};

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

// ✅ Tambahan fungsi input manual
const handleManualCheckin = async () => {
  if (!manualCode.value.trim()) {
    alert("Masukkan kode QR secara manual!");
    return;
  }
  await checkIn(manualCode.value.trim());
};
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- SIDEBAR -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">
          PEKERJA MARKETING
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/pekerja-marketing/pekerjamarketing" class="p-3 rounded-lg hover:bg-white/20 transition"
          >🏠 Dashboard</a
        >
        <a
          href="/pekerja-marketing/checkin"
          class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"
          >🕓 Check-in</a
        >
        <a href="/pekerja-marketing/checkout" class="p-3 rounded-lg hover:bg-white/20 transition"
          >⏰ Check-out</a
        >
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8 flex flex-col items-center justify-center">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-bold">Check-in Absensi</h1>
          <div class="text-3xl font-bold mt-2">{{ time }}</div>
          <p class="text-gray-100 mt-1">{{ user?.username ?? "User" }}</p>
        </div>

        <!-- CAMERA PREVIEW -->
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

        <!-- ✅ INPUT MANUAL SECTION -->
        <div class="mt-6 text-center bg-white/20 p-4 rounded-lg shadow-lg">
          <p class="text-white mb-2 font-semibold">Atau masukkan kode QR secara manual:</p>
          <input
            v-model="manualCode"
            type="text"
            placeholder="Masukkan kode QR..."
            class="w-full p-2 rounded text-black focus:outline-none"
          />
          <button
            @click="handleManualCheckin"
            class="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Kirim Manual
          </button>
        </div>

        <!-- STATUS -->
        <div class="text-center mt-4">
          <p v-if="cameraError" class="text-sm text-red-600">{{ cameraError }}</p>
          <p
            v-else-if="message"
            class="text-sm"
            :class="message.includes('✅') ? 'text-green-600' : 'text-red-600'"
          >
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
