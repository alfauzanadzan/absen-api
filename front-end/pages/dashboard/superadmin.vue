<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-blue-700">Dashboard Super Admin</h1>
    <p>Halo, ini halaman khusus untuk <strong>Super Admin</strong>.</p>

    <button
      class="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      @click="logout"
    >
      Logout
    </button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  router.push("/auth/login")
}
</script>
