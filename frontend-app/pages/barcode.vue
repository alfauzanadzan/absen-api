<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <h1 class="text-2xl font-bold mb-6">Barcode Absen Pintu</h1>

    <qrcode-vue
      value="ABSEN-PINTU-1"
      :size="250"
      level="H"
      class="mx-auto"
    />

    <p class="mt-4 text-gray-600">Scan barcode ini sebelum masuk</p>
  </div>
</template>

<script setup>
import QrcodeVue from 'qrcode.vue'
</script>
