<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col border-r">
      <div class="flex items-center justify-center h-20 mb-6">
        <!-- Bisa taruh logo -->
        <h1 class="text-lg font-bold text-blue-600">KAPROG IT</h1>
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-it/kaprogit" class="p-2 rounded hover:bg-gray-200">
          Dashboard
        </a>
        <a
          href="/kaprog-it/profilkaprog"
          class="p-2 rounded bg-blue-50 text-blue-600 font-medium"
        >
          Profile
        </a>
        <a href="/kaprog-it/employees" class="p-2 rounded hover:bg-gray-200">
          Employees
        </a>
        <a href="/kaprog-it/attendance" class="p-2 rounded hover:bg-gray-200">
          Attendance
        </a>
        <a href="/kaprog-it/reports" class="p-2 rounded hover:bg-gray-200">
          Reports
        </a>
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
          {{ user?.username ?? "Kaprog" }}
        </h3>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-2">
          {{ user?.position ?? "KEPALA SEKSI PENGEMBANGAN BIDANG IT" }}
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

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useFetch } from "#app"

const user = ref<any>(null)

onMounted(async () => {
  try {
    // Ganti URL sesuai API backend kamu
    const { data, error } = await useFetch("http://localhost:3000/users/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // pakai JWT kalau ada
      },
    })

    if (!error.value && data.value) {
      user.value = data.value
    } else {
      console.error("Gagal memuat user:", error.value)
    }
  } catch (err) {
    console.error("Terjadi kesalahan:", err)
  }
})
</script>

<style scoped>
/* styling khusus halaman profil */
</style>
