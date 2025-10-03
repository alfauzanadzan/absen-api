<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col shadow-md">
      <div class="flex items-center justify-center h-20 mb-6">
        <h1 class="text-lg font-bold text-gray-700">Kaprog IT</h1>
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/kaprog-marketing/profilkaprog" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Profile</a>
        <a href="/kaprog-marketing/employees" class="p-2 rounded hover:bg-gray-200">Employees</a>
        <a href="/kaprog-marketing/attendance" class="p-2 rounded hover:bg-gray-200">Attendance</a>
        <a href="/kaprog-marketing/reports" class="p-2 rounded hover:bg-gray-200">Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center">
      <div class="bg-white shadow-md rounded-lg p-6 w-80 text-center">
        <!-- Garis atas kecil -->
        <div class="w-10 h-0.5 bg-black mx-auto mb-2"></div>

        <!-- Judul -->
        <h2 class="text-sm font-semibold mb-4">Profil Saya</h2>

        <!-- Avatar -->
        <div class="flex items-center justify-center mb-4">
          <img
            :src="user?.avatar || '/images/default-avatar.png'"
            alt="Profile"
            class="h-20 w-20 rounded-full border object-cover"
          />
        </div>

        <!-- Email -->
        <p class="text-gray-600 text-sm">{{ user?.email ?? 'Belum ada email' }}</p>

        <!-- Nama -->
        <h3 class="font-bold text-lg mt-1">{{ user?.username ?? 'Kaprog' }}</h3>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-2">
          {{ user?.position ?? 'KEPALA SEKSI PENGEMBANGAN BIDANG IT' }}
        </p>

        <!-- Instansi -->
        <p class="text-xs text-gray-500 mt-1">
          {{ user?.instansi ?? 'Dinas Komunikasi dan Informatika Provinsi Sumatera Utara' }}
        </p>

        <!-- Garis bawah kecil -->
        <div class="w-full h-px bg-gray-300 mt-4"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFetch } from '#app'

const user = ref(null)

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')

    const { data, error } = await useFetch('http://localhost:3000/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!error.value) {
      user.value = data.value
    } else {
      console.error('Gagal memuat user:', error.value)
    }
  } catch (err) {
    console.error('Error:', err)
  }
})
</script>
