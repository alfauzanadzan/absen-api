<template>
  <div class="p-10 text-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold text-green-600 mb-4">Dashboard Pekerja Marketing</h1>
    <p>Selamat datang, {{ user?.name || user?.username }}!</p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { user } = useAuth()
</script>
