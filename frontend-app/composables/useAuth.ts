// composables/useAuth.ts
export type Role = "SUPERADMIN" | "ADMIN" | "KAPROG" | "PEKERJA"

export type User = {
  id?: string
  username: string
  role: Role
  departmentName?: string
  position?: string
  email?: string
  name?: string
}

type LoginResponse = {
  access_token?: string
  user?: User
  message?: string
}

export const useAuth = () => {
  const user = useState<User | null>("user", () => null)
  const config = useRuntimeConfig()
  const router = useRouter()

  const isClient = () => typeof window !== "undefined"

  // =======================
  // DETECT DEPARTMENT
  // =======================
  const detectDepartment = (user: User): string => {
    if (user.role !== "KAPROG" && user.role !== "PEKERJA") return ""

    if (user.departmentName?.trim()) return user.departmentName.trim()

    const uname = user.username.toLowerCase()
    const email = user.email?.toLowerCase() || ""

    if (uname.includes("marketing") || uname.includes("mkt") || uname.includes("mia") || email.includes("marketing") || email.includes("mkt") || email.includes("almia")) return "Marketing"
    if (uname.includes("it") || uname.includes("tech") || uname.includes("hizam") || email.includes("it") || email.includes("tech") || email.includes("alhizam")) return "IT"

    return "IT" // fallback
  }

  // =======================
  // LOGIN
  // =======================
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, password },
      })

      if (!res || !res.user) throw new Error("Login gagal — user tidak ditemukan.")

      // attach departmentName jika role KAPROG / PEKERJA
      const userData: User = {
        ...res.user,
        departmentName: (res.user.role === "KAPROG" || res.user.role === "PEKERJA")
          ? (res.user.departmentName?.trim() || detectDepartment(res.user))
          : undefined,
      }

      // simpan ke localStorage
      if (isClient()) {
        if (res.access_token) localStorage.setItem("token", res.access_token)
        localStorage.setItem("user", JSON.stringify(userData))
      }

      user.value = userData

      // redirect sesuai role & department
      if (isClient()) {
        const redirectPath = getRedirectPath(userData)
        await router.push(redirectPath)
      }

      return true
    } catch (err: any) {
      console.error("Login error:", err)
      alert(err?.data?.message || err.message || "Login gagal, periksa username & password")
      return false
    }
  }

  // =======================
  // REDIRECT PATH
  // =======================
  const getRedirectPath = (user: User): string => {
    const role = user.role
    const dept = user.departmentName?.toLowerCase().trim()

    switch (role) {
      case "SUPERADMIN": return "/superadmin/super"
      case "ADMIN": return "/admin/admin"
      case "KAPROG":
        if (dept === "marketing") return "/kaprog-marketing"
        return "/kaprog-it"
      case "PEKERJA":
        if (dept === "marketing") return "/pekerja-marketing"
        return "/pekerja-it"
      default: return "/"
    }
  }

  // =======================
  // LOGOUT
  // =======================
  const logout = () => {
    if (isClient()) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
    }
    user.value = null
  }

  // =======================
  // LOAD USER DARI LOCALSTORAGE
  // =======================
  const loadUser = async () => {
    if (!isClient()) return
    const raw = localStorage.getItem("user")
    if (raw) {
      try { user.value = JSON.parse(raw) as User } 
      catch { user.value = null }
    } else user.value = null
  }

  return {
    user,
    login,
    logout,
    loadUser,
    getRedirectPath,
    detectDepartment
  }
}
