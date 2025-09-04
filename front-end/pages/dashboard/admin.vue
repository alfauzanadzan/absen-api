<template>
  <div class="dashboard-container">
    <h1>Dashboard Admin</h1>
    <p>Selamat datang, Admin!</p>
    <!-- Fitur yang sama dengan superadmin -->
    <div>
      <nuxt-link to="/dashboard/superadmin">Lihat Dashboard Superadmin</nuxt-link>
    </div>
    <!-- Tambahkan fitur lain sesuai kebutuhan -->
  </div>
</template>

<script setup lang="ts">
// ...import dan logic yang sama dengan superadmin jika diperlukan
</script>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 32px;
  text-align: center;
}
</style>
