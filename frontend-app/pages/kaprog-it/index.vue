<template>
  <div class="p-10 text-center min-h-screen bg-gray-100">
    <h1 class="text-4xl font-bold text-blue-600 mb-4">Dashboard Kaprog IT</h1>
    <p>Selamat datang, Kaprog IT!</p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { user } = useAuth()
</script>
