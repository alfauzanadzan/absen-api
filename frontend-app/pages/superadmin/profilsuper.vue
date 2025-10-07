<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white shadow-md p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6 font-bold text-lg text-blue-600">
        SUPERADMIN
      </div>
      <nav class="flex flex-col space-y-2 text-gray-700">
        <a href="/superadmin/super" class="p-2 rounded hover:bg-gray-100 transition">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded bg-blue-100 text-blue-600 font-medium shadow-sm">
          Profile
        </a>
        <a href="/superadmin/addaccount" class="p-2 rounded hover:bg-gray-100 transition">Add Account</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center p-8">
      <div
        class="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm text-center transition-transform hover:scale-[1.02]"
      >
        <!-- Garis atas -->
        <div class="w-12 h-1 bg-blue-600 mx-auto mb-4 rounded"></div>

        <!-- Judul -->
        <h2 class="text-base font-semibold text-gray-700 mb-6 tracking-wide uppercase">
          Profil Saya
        </h2>

        <!-- Foto Profil -->
        <div class="relative flex items-center justify-center mb-4">
          <div
            class="h-24 w-24 rounded-full border-4 border-blue-100 bg-gray-100 flex items-center justify-center overflow-hidden"
          >
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              alt="Profile"
              class="h-full w-full object-cover"
            />
            <span v-else class="text-3xl font-semibold text-blue-600">
              {{ user?.username?.charAt(0).toUpperCase() || 'A' }}
            </span>
          </div>
          <div
            class="absolute bottom-0 right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white"
            title="Online"
          ></div>
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
        <div class="w-full h-px bg-gray-200 mt-6 mb-4"></div>

        <!-- Tombol Logout -->
        <button
          @click="logout"
          class="px-4 py-2 bg-red-500 text-white text-sm rounded-md shadow hover:bg-red-600 transition"
        >
          Keluar Akun
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, loadUser, logout } = useAuth()

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
})
</script>

<style scoped>
a {
  transition: all 0.2s ease;
}
</style>
