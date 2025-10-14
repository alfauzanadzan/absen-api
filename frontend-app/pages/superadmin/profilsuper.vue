<template>
   <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">SUPERADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/superadmin/super" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">👤 Profile</a>
        <a href="/superadmin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
      </nav>
    </aside>

    <!-- Main Content -->
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

        <!-- Info -->
        <div class="space-y-2">
          <h3 class="font-bold text-xl text-gray-800">
            {{ user?.username ?? 'Super Admin' }}
          </h3>

          <p class="text-gray-600 text-sm">
            {{ user?.email ?? 'Belum ada email' }}
          </p>

          <p class="text-xs text-gray-700 font-semibold mt-2">
            {{ user?.position ?? 'Super Administrator' }}
          </p>

          <p class="text-xs text-gray-500 mt-1">
            {{ user?.instansi ?? 'Dinas Komunikasi dan Informatika Provinsi Sumatera Utara' }}
          </p>
        </div>

        <!-- Garis bawah -->
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
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { user, loadUser, logout } = useAuth()
const router = useRouter()

const goDashboard = () => {
  router.push('/superadmin/super')
}

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
})
</script>

<style scoped>
a {
  transition: all 0.2s ease;
}
</style>