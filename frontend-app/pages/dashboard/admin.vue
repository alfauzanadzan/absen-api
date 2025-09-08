<script setup lang="ts">
definePageMeta({
  middleware: ["role"]
})

const { user, loadUser } = useAuth()
onMounted(() => loadUser())
</script>

<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    <p class="mt-4">Selamat datang, {{ user?.username }} (Role: {{ user?.role }})</p>
  </div>
</template>
