<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
      <h1 class="mb-6 text-center text-2xl font-bold text-gray-800">
        Login
      </h1>

      <!-- Alert error -->
      <div
        v-if="errorMessage"
        class="mb-4 rounded-md bg-red-100 px-4 py-2 text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Masukkan username"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const username = ref("")
const password = ref("")
const errorMessage = ref("")
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ""

  try {
    // Panggil API login
    const res = await $fetch("http://localhost:3000/auth/login", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
      },
    })

    // Simpan token
    localStorage.setItem("token", res.access_token)

    // Simpan user info (kalau backend kirim role)
    if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user))
    }

    // === Redirect otomatis ===
    // Jika SUPER_ADMIN langsung ke dashboard superadmin
    if (res.user?.role === "SUPER_ADMIN") {
      router.push("/dashboard/superadmin")
    } else {
      // fallback: ke dashboard umum
      router.push("/dashboard/superadmin ")
    }
  } catch (err) {
    errorMessage.value = "Username atau password salah"
  }
}
</script>
