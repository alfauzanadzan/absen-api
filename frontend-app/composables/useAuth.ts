export const useAuth = () => {
  const user = useState("user", () => null)

  const login = async (username: string, password: string) => {
    try {
      const config = useRuntimeConfig()

      console.log("📤 Sending payload:", { username, password })

      const res: any = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          username,   // kalau BE butuh "email", ganti ini jadi: email: username
          password
        }
      })

      console.log("✅ Login success:", res)

      localStorage.setItem("token", res.access_token)
      localStorage.setItem("user", JSON.stringify(res.user))
      user.value = res.user

      return true
    } catch (err: any) {
      console.error("❌ Login error detail:", err)
      alert(err?.data?.message || "Login gagal, periksa username/password")
      return false
    }
  }

  return { user, login }
}
