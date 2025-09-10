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

  // client-only loader: gunakan typeof window check agar TS tidak butuh @types/node
  const loadUser = async () => {
    if (typeof window === "undefined") return
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

  const normalizeRole = (r?: string) =>
    (r || "").toString().trim().toUpperCase().replace(/\s+/g, "_")

  const login = async (username: string, password: string) => {
    try {
      const res = (await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, password }, // ubah key jika backend butuh email
      })) as LoginResponse

      // Simpan token + user di localStorage
      localStorage.setItem("token", res.access_token)
      localStorage.setItem("user", JSON.stringify(res.user))
      user.value = res.user

      // Redirect sesuai role
      if (res.user.role === "SUPERADMIN") {
        router.push("/superadmin/superadmin")
      } else if (res.user.role === "ADMIN") {
        router.push("/admin/admin")
      } else if (res.user.role === "KAPROG") {
        router.push("/dashboard/kaprog")
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

  // 🔹 Tambahin loadUser
  const loadUser = async () => {
    const saved = localStorage.getItem("user")
    if (saved) {
      user.value = JSON.parse(saved)
    } else {
      user.value = null
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
