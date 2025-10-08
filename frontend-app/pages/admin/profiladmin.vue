<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
      <div>
        <!-- Header -->
        <div class="flex items-center justify-center mb-10">
          <h1 class="text-xl font-bold text-blue-600 tracking-wide">ADMIN PANEL</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-col space-y-2">
          <NuxtLink
            to="/admin/admin"
            class="p-2 rounded-md transition hover:bg-blue-50 hover:text-blue-600"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/admin/profiladmin"
            class="p-2 rounded-md bg-blue-100 text-blue-600 font-semibold"
          >
            Profile
          </NuxtLink>
          <NuxtLink
            to="/admin/addaccount"
            class="p-2 rounded-md transition hover:bg-blue-50 hover:text-blue-600"
          >
            Add Account
          </NuxtLink>
          <NuxtLink
            to="/admin/attendance"
            class="p-2 rounded-md transition hover:bg-blue-50 hover:text-blue-600"
          >
            Attendance
          </NuxtLink>
          <NuxtLink
            to="/admin/reports"
            class="p-2 rounded-md transition hover:bg-blue-50 hover:text-blue-600"
          >
            Reports
          </NuxtLink>
        </nav>
      </div>

      <!-- Footer -->
      <div class="text-center text-xs text-gray-400 mt-6">
        © 2025 Diskominfo Sumut
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center p-8">
      <div
        class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center border border-gray-100"
      >
        <!-- Garis atas -->
        <div class="w-12 h-1 bg-blue-500 mx-auto mb-3 rounded"></div>

        <!-- Judul -->
        <h2 class="text-lg font-bold text-gray-700 mb-6">Profil Saya</h2>

        <!-- Foto Profil -->
        <div class="relative flex items-center justify-center mb-5">
          <div
            v-if="!user?.avatar"
            class="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600 border border-blue-300"
          >
            {{ user?.username?.charAt(0)?.toUpperCase() ?? 'A' }}
          </div>
          <img
            v-else
            :src="user.avatar"
            alt="Profile"
            class="h-24 w-24 rounded-full border object-cover"
          />
        </div>

        <!-- Info User -->
        <div class="space-y-1">
          <h3 class="font-bold text-xl text-gray-800">
            {{ user?.username ?? 'Admin' }}
          </h3>
          <p class="text-gray-500 text-sm">
            {{ user?.email ?? 'admin@diskominfo.sumutprov.go.id' }}
          </p>
          <p class="text-gray-600 font-semibold text-sm mt-2">
            {{ user?.position ?? 'ADMINISTRATOR' }}
          </p>
          <p class="text-xs text-gray-500 mt-1 leading-snug">
            {{ user?.instansi ?? 'Dinas Komunikasi dan Informatika Provinsi Sumatera Utara' }}
          </p>
        </div>

        <!-- Garis bawah -->
        <div class="w-full h-px bg-gray-200 mt-6 mb-3"></div>

        <!-- Tombol -->
        <button
          @click="goDashboard"
          class="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { navigateTo } from '#app'

const { user, loadUser } = useAuth()

onMounted(() => {
  loadUser()
})

const goDashboard = () => {
  navigateTo('/admin/admin')
}
</script>
