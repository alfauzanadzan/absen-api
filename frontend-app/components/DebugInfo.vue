<template>
  <div v-if="showDebug" class="fixed top-4 right-4 bg-red-100 border border-red-300 p-4 rounded-lg z-50 max-w-md">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-red-700">DEBUG INFO</h3>
      <button @click="showDebug = false" class="text-red-500">×</button>
    </div>
    <pre class="text-xs whitespace-pre-wrap">{{ debugData }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showDebug = ref(true)
const debugData = ref<any>({})

onMounted(() => {
  const user = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  
  debugData.value = {
    user: user ? JSON.parse(user) : null,
    hasToken: !!token,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  }
  
  console.log('🔍 DEBUG INFO:', debugData.value)
})
</script>