import { useRouter } from "vue-router"

export const useAuth = () => {
  const user = useState("user", () => null)
  const router = useRouter()

  const login = async (username: string, password: string) => {
    try {
      const config = useRuntimeConfig()

      console.log("📤 Sending payload:", { username, password })

      const res: any = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          username, // ⚡ kalau backend butuh email, ganti ke email: username
          password,
        },
      })

      console.log("✅ Login success:", res)

      // Simpan token + user di localStorage
      localStorage.setItem("token", res.access_token)
      localStorage.setItem("user", JSON.stringify(res.user))
      user.value = res.user

      // 🔹 Redirect sesuai role user
      if (res.user.role === "SUPERADMIN") {
        router.push("/dashboard/superadmin")
      } else if (res.user.role === "ADMIN") {
        router.push("/dashboard/admin")
      } else if (res.user.role === "KAPROG") {
        router.push("/dashboard/kaprog")
      } else {
        router.push("/") // fallback kalau role tidak dikenal
      }

      return true
    } catch (err: any) {
      console.error("❌ Login error detail:", err)
      alert(err?.data?.message || "Login gagal, periksa username/password")
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    user.value = null
    router.push("/login")
  }

  return { user, login, logout }
}
