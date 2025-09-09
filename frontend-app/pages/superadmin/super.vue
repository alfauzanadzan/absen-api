<template>
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-59 bg-white-100 p-6 flex flex-col">
      <!-- Logo -->
      

      <!-- Menu -->
      <nav class="flex flex-col space-y-4">
        <a href="/dashboard" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/superadmin/profilsuperadmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/superadmin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
      </nav>
    </aside>

    <!-- Main Content -->
          <main class="flex-1 p-8 overflow-y-auto">
            <!-- Header -->
            <div class="flex justify-between items-center mb-6 relative">
        <div>
          <h2 class="text-2xl font-bold">WELCOME, Ozan</h2>
          <p class="text-sm text-gray-600">SUPER ADMIN</p>
        </div>

        <!-- Tombol Log Out selalu muncul -->
        <button
          @click="logout"
          class="bg-red-600 text-white px-2 py- rounded hover:bg-red-700 transition"
        >
          Log Out
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-4 gap-4 mb-10">
        <div class="bg-white p-6 rounded-lg text-center shadow">
          <p class="text-3xl font-bold text-green-600">128</p>
          <p class="mt-2 text-gray-600">Worker</p>
        </div>
        <div class="bg-white p-6 rounded-lg text-center shadow">
          <p class="text-3xl font-bold text-red-600">3</p>
          <p class="mt-2 text-gray-600">Kaprog</p>
        </div>
        <div class="bg-white p-6 rounded-lg text-center shadow">
          <p class="text-3xl font-bold text-yellow-500">3</p>
          <p class="mt-2 text-gray-600">Divisi</p>
        </div>
        <div class="bg-white p-6 rounded-lg text-center shadow">
          <p class="text-3xl font-bold text-purple-600">12</p>
          <p class="mt-2 text-gray-600">Admin</p>
        </div>
      </div>

      <!-- Division Summary -->
      <div class="bg-white p-6 rounded-lg shadow mb-10">
        <h2 class="text-xl font-bold mb-4">Division Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between border-b pb-1">
            <span class="font-semibold">PROGRAMING</span>
            <span>40</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="font-semibold">DESAINER</span>
            <span>40</span>
          </div>
          <div class="flex justify-between border-b pb-1">
            <span class="font-semibold">MARKETING</span>
            <span>48</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"

const time = ref("")
const dropdownOpen = ref(false)

let interval = null

// Update clock function
const updateClock = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

onMounted(() => {
  updateClock()
  interval = setInterval(updateClock, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})

// Toggle dropdown
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

// Logout action (dummy)
const logout = () => {
  alert("Logout berhasil!")
  navigateTo("/login")
}
</script>
