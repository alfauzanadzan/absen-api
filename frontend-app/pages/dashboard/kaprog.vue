<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Dashboard Kaprog</h1>
    <p class="mb-2">Selamat datang, {{ user?.username }} 🎉</p>
    <p class="text-gray-600">Role: {{ user?.role }}</p>

    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="p-4 bg-blue-100 rounded-lg shadow">
        <h2 class="font-semibold">Jumlah Guru</h2>
        <p class="text-2xl">12</p>
      </div>
      <div class="p-4 bg-green-100 rounded-lg shadow">
        <h2 class="font-semibold">Jumlah Siswa</h2>
        <p class="text-2xl">320</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { user } = useAuth()
</script>
