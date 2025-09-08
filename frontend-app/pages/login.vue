<script setup lang="ts">
const username = ref("")
const password = ref("")
const loading = ref(false)

const { login } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    alert("Username dan password wajib diisi")
    return
  }

  loading.value = true
  const success = await login(username.value, password.value)
  loading.value = false

  if (success) {
    const user = JSON.parse(localStorage.getItem("user")!)

    // 🔹 Redirect sesuai role
    if (user.role === "SUPER_ADMIN") {
      router.push("/superadmin/super")
    } else if (user.role === "ADMIN") {
      router.push("/admin/admin")
    } else if (user.role === "KAPROG") {
      router.push("/kaprog/kaprog")
    } else {
      router.push("/") // fallback
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-md w-80">
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <input
        v-model="username"
        placeholder="Username"
        class="border border-gray-300 p-2 mb-3 w-full rounded focus:outline-none focus:ring focus:ring-blue-300"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="border border-gray-300 p-2 mb-4 w-full rounded focus:outline-none focus:ring focus:ring-blue-300"
      />

      <button
        @click="handleLogin"
        :disabled="loading"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded w-full transition"
      >
        {{ loading ? "Loading..." : "Login" }}
      </button>
    </div>
  </div>
</template>
