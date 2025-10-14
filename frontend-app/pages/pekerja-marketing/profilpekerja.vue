<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1
          class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide text-center"
        >
          PEKERJA MARKETING
        </h1>
      </div>
      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/pekerja-marketing/pekerjamarketing" class="p-3 rounded-lg hover:bg-white/20 transition">
          🏠 Dashboard
        </a>
        <a href="/pekerja-marketing/profilpekerja" class="p-3 rounded-lg bg-white/30 shadow hover:bg-white/40 transition">
          👤 Profile
        </a>
        <a href="/pekerja-marketing/reports" class="p-3 rounded-lg hover:bg-white/20 transition">
          📊 Reports
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 relative overflow-y-auto">
      <div class="flex flex-col items-center justify-center h-[75vh]">
        <div
          class="bg-white/25 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-10 text-center max-w-md w-full"
        >
          <!-- Foto Profil -->
          <div class="relative flex items-center justify-center mb-5">
            <div
              v-if="!user?.avatar"
              class="h-24 w-24 rounded-full bg-white/50 flex items-center justify-center text-3xl font-bold text-pink-600 border border-white shadow-lg"
            >
              {{ getInitials(user?.username) }}
            </div>
            <img
              v-else
              :src="user.avatar"
              alt="Profile"
              class="h-24 w-24 rounded-full border border-white shadow-lg object-cover"
            />
          </div>

          <!-- Username -->
          <h3 class="font-bold text-lg text-gray-800">
            {{ user?.username || "Pekerja MARKETING" }}
          </h3>

          <!-- Email -->
          <p class="text-gray-500 text-sm mt-1">
            {{ user?.email || "Belum ada email" }}
          </p>

          <!-- Jabatan -->
          <p class="text-xs text-gray-700 font-semibold mt-3">
            {{ user?.position || "Divisi Programming" }}
          </p>

          <!-- Instansi -->
          <p class="text-xs text-gray-500 mt-1">
            {{ user?.instansi || "Dinas Komunikasi dan Informatika Provinsi Sumatera Utara" }}
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
definePageMeta({
  middleware: ["role"],
})

import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser } = useAuth()
const router = useRouter()

onMounted(async () => {
  await loadUser()
})

const goDashboard = () => {
  router.push("/pekerja-marketing/pekerjamarketing")
}

function getInitials(name?: string): string {
  if (!name) return "A"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
}
</style>