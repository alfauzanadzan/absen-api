// composables/useAuth.ts
export type Role = "SUPER_ADMIN" | "ADMIN" | "KAPROG" | "PEGAWAI" | string

export type User = {
  id?: number
  username: string
  role: Role
}

type LoginResponse = {
  access_token?: string
  user?: User
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null)
  const config = useRuntimeConfig()
  const router = useRouter()

  // client-only: gunakan typeof window check
  const loadUser = async () => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        user.value = JSON.parse(raw) as User
      } catch (e) {
        console.warn("useAuth: failed to parse user", e)
        user.value = null
      }
    } else {
      user.value = null
    }
  }

  const normalizeRole = (r?: string) =>
    (r || "").toString().trim().toUpperCase().replace(/\s+/g, "_")

  const login = async (username: string, password: string) => {
    try {
      const res = (await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, password },
      })) as LoginResponse

      if (res && res.user) {
        if (typeof window !== "undefined") {
          if (res.access_token) localStorage.setItem("token", res.access_token)
          localStorage.setItem("user", JSON.stringify(res.user))
        }
        user.value = res.user

        const role = normalizeRole(res.user.role)
        if (typeof window !== "undefined") {
          if (role === "SUPER_ADMIN" || role === "SUPERADMIN") {
            await router.push("/dashboard/super")
          } else if (role === "ADMIN") {
            await router.push("/dashboard/admin")
          } else if (role === "KAPROG") {
            await router.push("/dashboard/kaprog")
          } else {
            await router.push("/")
          }
        }
        return true
      } else {
        alert("Login gagal — user/role tidak ditemukan pada response.")
        return false
      }
    } catch (err: any) {
      console.error("Login error:", err)
      alert(err?.data?.message || "Login gagal, periksa username & password")
      return false
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    user.value = null
    if (typeof window !== "undefined") router.push("/login")
  }

  return { user, loadUser, login, logout, normalizeRole }
}
