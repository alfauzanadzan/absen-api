<script setup lang="ts">
definePageMeta({
  middleware: ["role"], // Middleware untuk cek role user
})

import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuth } from "@/composables/useAuth"

const { user, loadUser } = useAuth()
const router = useRouter()

onMounted(async () => {
  await loadUser()
})

function logout() {
  localStorage.removeItem("token")
  router.push("/login")
}

function getInitials(name: string): string {
  if (!name) return "P"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-blue-600">PEKERJA IT</h1>
      </div>

      <nav class="flex flex-col space-y-2">
        <NuxtLink
          to="/pekerja-it/pekerjait"
          class="p-2 rounded hover:bg-gray-100"
        >
          🏠 Dashboard
        </NuxtLink>

        <NuxtLink
          to="/pekerja-it/profilpekerja"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          👤 Profile
        </NuxtLink>

        <NuxtLink
          to="/pekerja-it/reports"
          class="p-2 rounded hover:bg-gray-100"
        >
          📄 Reports
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center">
      <div
        class="bg-white shadow-md rounded-xl p-6 w-80 text-center border border-gray-100"
      >
        <!-- Garis atas kecil -->
        <div class="w-10 h-0.5 bg-blue-600 mx-auto mb-3 rounded-full"></div>

        <!-- Judul -->
        <h2
          class="text-sm font-semibold mb-4 tracking-wide uppercase text-gray-600"
        >
          Profil Saya
        </h2>

        <!-- Foto Profil / Inisial -->
        <div class="flex items-center justify-center mb-4 relative">
          <div v-if="user?.avatar" class="relative">
            <img
              :src="user.avatar"
              alt="Profile"
              class="h-24 w-24 rounded-full border-2 border-blue-200 object-cover"
            />
          </div>

          <div
            v-else
            class="h-24 w-24 rounded-full border-2 border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-4xl select-none"
          >
            {{ getInitials(user?.username || "P") }}
          </div>

          <!-- Indikator online -->
          <span
            class="absolute bottom-2 right-2 h-3 w-3 bg-green-500 rounded-full border-2 border-white"
          ></span>
        </div>

        <!-- Username -->
        <h3 class="font-bold text-lg text-gray-800">
          {{ user?.username ?? "Pekerja IT" }}
        </h3>

        <!-- Email -->
        <p class="text-gray-500 text-sm mt-1">
          {{ user?.email ?? "Belum ada email" }}
        </p>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-3">
          {{ user?.position ?? "Divisi Programming" }}
        </p>

        <!-- Instansi -->
        <p class="text-xs text-gray-500 mt-1">
          {{
            user?.instansi ??
              "Dinas Komunikasi dan Informatika Provinsi Sumatera Utara"
          }}
        </p>

        <!-- Garis bawah -->
        <div class="w-full h-px bg-gray-200 mt-4 mb-3"></div>

        <!-- Tombol Logout -->
        <button
          @click="logout"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm"
        >
          Keluar Akun
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Gaya tambahan opsional untuk konsistensi antar halaman profil */
aside {
  box-shadow: inset -1px 0 0 #f1f1f1;
}

button {
  transition: background-color 0.2s ease;
}
</style>
