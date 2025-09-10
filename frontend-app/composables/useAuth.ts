// composables/useAuth.ts
export type Role = "SUPER_ADMIN" | "ADMIN" | "KAPROG" | "PEGAWAI" | string

export type User = {
  id?: number
  username: string
  role: Role
  // tambahkan field lain jika backend mengirimnya
}

type LoginResponse = {
  access_token?: string
  user?: User
  // field lain sesuai backend
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null)
  const config = useRuntimeConfig()
  const router = useRouter()

  // ----- helper -----
  const isClient = () => typeof window !== "undefined"

  const normalizeRole = (r?: string) =>
    (r || "").toString().trim().toUpperCase().replace(/\s+/g, "_")

  // ----- load user (single implementation, client-only) -----
  const loadUser = async () => {
    if (!isClient()) return
    const raw = localStorage.getItem("user")
    if (raw) {
      try {
        user.value = JSON.parse(raw) as User
      } catch (e) {
        console.warn("useAuth: gagal parse user dari localStorage", e)
        user.value = null
      }
    } else {
      user.value = null
    }
  }

  // ----- login -----
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = (await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, password }, // ubah key jika backend butuh email
      })) as LoginResponse

      if (!res || !res.user) {
        alert("Login gagal — user/role tidak ditemukan pada response.")
        return false
      }

      // Simpan token + user di localStorage (client-only)
      if (isClient()) {
        if (res.access_token) localStorage.setItem("token", res.access_token)
        localStorage.setItem("user", JSON.stringify(res.user))
      }
      user.value = res.user

      // Normalisasi role lalu redirect (sesuaikan route dengan projectmu)
      const role = normalizeRole(res.user.role)
      if (isClient()) {
        if (role === "SUPER_ADMIN" || role === "SUPERADMIN") {
          await router.push("/dashboard/super")
        } else if (role === "ADMIN") {
          await router.push("/dashboard/admin")
        } else if (role === "KAPROG") {
          await router.push("/dashboard/kaprog")
        } else {
          // fallback
          await router.push("/")
        }
      }

      return true
    } catch (err: any) {
      console.error("Login error:", err)
      alert(err?.data?.message || "Login gagal, periksa username & password")
      return false
    }
  }

  // ----- logout -----
  const logout = () => {
    if (isClient()) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
    }
    user.value = null
  }

  return { user, loadUser, login, logout, normalizeRole }
}
