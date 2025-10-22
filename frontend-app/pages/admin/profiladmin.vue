<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/daftar-department" class="p-3 rounded-lg hover:bg-white/20 transition">🏢 Daftar Department</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <main class="flex-1 p-8 relative overflow-y-auto">
      <div class="flex flex-col items-center justify-center h-[75vh]">
        <div
          class="bg-white/25 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-10 text-center max-w-md w-full">
          <div class="relative flex items-center justify-center mb-5">
            <div
              v-if="!user?.avatar"
              class="h-24 w-24 rounded-full bg-white/50 flex items-center justify-center text-3xl font-bold text-pink-600 border border-white shadow-lg" >
              {{ user?.username?.charAt(0)?.toUpperCase() ?? 'A' }}
            </div>
            <img
              v-else
              :src="user.avatar"
              alt="Profile"
              class="h-24 w-24 rounded-full border border-white shadow-lg object-cover" />
          </div>

          <h3 class="text-2xl font-bold text-white drop-shadow-sm">
            {{ user?.username ?? 'Admin' }}
          </h3>
          <p class="text-white/90 text-sm mt-1">
            {{ user?.email ?? 'admin@diskominfo.sumutprov.go.id' }}
          </p>
          <p class="text-white/80 text-sm mt-3 font-semibold">
            {{ user?.position ?? 'ADMINISTRATOR' }}
          </p>
          <p class="text-white/80 text-xs mt-1 leading-snug">
            {{ user?.instansi ?? 'Dinas Komunikasi dan Informatika Provinsi Sumatera Utara' }}
          </p>

          <div class="w-full h-px bg-white/40 my-6"></div>

          <button
            @click="goDashboard"
            class="px-6 py-2 bg-white/40 hover:bg-white/60 text-pink-700 font-semibold rounded-lg transition shadow-md"
          >
            Kembali ke Dashboard
          </button>
        </div>
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

profile admin