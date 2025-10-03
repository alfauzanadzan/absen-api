<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r p-6 flex flex-col">
      <div class="flex items-center justify-center h-16 mb-6">
        <h1 class="text-lg font-bold text-blue-600">Marketing</h1>
      </div>

      <nav class="flex flex-col space-y-2 text-gray-700">
        <NuxtLink
          to="/pekerja-marketing/pekerjamarketing"
          class="p-2 rounded hover:bg-gray-100"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink
          to="/pekerja-marketing/profilpekerja"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Profile
        </NuxtLink>
        <NuxtLink
          to="/pekerja-marketing/reports"
          class="p-2 rounded hover:bg-gray-100"
        >
          Reports
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center">
      <div class="bg-white shadow-md rounded-lg p-6 w-80 text-center">
        <!-- Garis atas kecil -->
        <div class="w-10 h-0.5 bg-black mx-auto mb-2"></div>

        <!-- Judul -->
        <h2 class="text-sm font-semibold mb-4">Profil Saya</h2>

        <!-- Foto Profil -->
        <div class="flex items-center justify-center mb-4">
          <img
            :src="user?.avatar || '/images/default-avatar.png'"
            alt="Profile"
            class="h-20 w-20 rounded-full border object-cover"
          />
        </div>

        <!-- Email -->
        <p class="text-gray-600 text-sm">
          {{ user?.email ?? "Belum ada email" }}
        </p>

        <!-- Nama -->
        <h3 class="font-bold text-lg mt-1">
          {{ user?.username ?? "Pekerja" }}
        </h3>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-2">
          {{ user?.position ?? "DIVISI MARKETING" }}
        </p>

        <!-- Instansi -->
        <p class="text-xs text-gray-500 mt-1">
          {{
            user?.instansi ??
              "Dinas Komunikasi dan Informatika Provinsi Sumatera Utara"
          }}
        </p>

        <!-- Garis bawah kecil -->
        <div class="w-full h-px bg-gray-300 mt-4"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
</script>
