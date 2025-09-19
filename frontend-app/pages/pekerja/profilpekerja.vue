<template>
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-8 flex flex-col ">
        <div class="flex items-center justify-center h-20 mb-6">
        </div>

        <nav class="flex flex-col space-y-2 text-gray-700">
          <a href="/pekerja/pekerja" class="p-2 rounded hover:bg-gray-100">Dashboard</a>
          <a href="/pekerja/profilpekerja" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Profile</a>
          <a href="/pekerja/reports" class="p-2 rounded hover:bg-gray-100">Reports</a>
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
        <p class="text-gray-600 text-sm">{{ user?.email ?? 'Belum ada email' }}</p>

        <!-- Nama -->
        <h3 class="font-bold text-lg mt-1">{{ user?.username ?? 'Pekerja' }}</h3>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-2">
          {{ user?.position ?? 'DIVISI PROGRAMING' }}
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
const goDashboard = () => {
  navigateTo('/dashboard/kaprog')
}
</script>