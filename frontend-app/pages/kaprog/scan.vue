<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 class="text-2xl font-bold mb-6">Scan QR Absen Kaprog</h1>

    <qrcode-stream @decode="onDecode" @init="onInit" />

    <p class="mt-4 text-gray-600">
      Arahkan kamera ke QR Code untuk absen
    </p>

    <p v-if="message" class="mt-2 font-semibold text-green-600">
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { QrcodeStream } from "vue-qrcode-reader"

const message = ref("")

const onDecode = async (userId) => {
  try {
    const res = await fetch("http://localhost:3000/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      message.value = "✅ Absen berhasil (Kaprog)!"
    } else {
      message.value = "❌ Gagal absen!"
    }
  } catch (err) {
    console.error(err)
    message.value = "⚠️ Error koneksi!"
  }
}

const onInit = (promise) => {
  promise.catch((e) => {
    console.error("Camera init error:", e)
    message.value = "⚠️ Kamera tidak bisa diakses"
  })
}
</script>
