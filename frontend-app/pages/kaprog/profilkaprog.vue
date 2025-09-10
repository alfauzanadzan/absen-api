<template>
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-59 bg-white p-6 flex flex-col">
      <!-- Logo -->
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <!-- Menu -->
      <nav class="flex flex-col space-y-2">
        <a href="/kaprog/kaprog" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/kaprog/profilkaprog" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/kaprog/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/kaprog/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/kaprog/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
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
        <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
        <!-- Email -->
        <p class="text-gray-600 text-sm">pakozan@gmail.com</p>

        <!-- Nama -->
        <h3 class="font-bold text-lg mt-1"> {{ user?.username }} </h3>

        <!-- Jabatan -->
        <p class="text-xs text-gray-700 font-semibold mt-2">
          KEPALA SEKSI PENGEMBANGAN BIDANG INFORMATIKA
        </p>

        <!-- Instansi -->
        <p class="text-xs text-gray-500 mt-1">
          Dinas Komunikasi dan Informatika Provinsi Sumatera Utara
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