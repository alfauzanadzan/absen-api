// composables/useAuth.ts
export type Role = "SUPERADMIN" | "ADMIN" | "KAPROG" | "PEKERJA"

export type User = {
  id?: number
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

  // 🔥 Detect department hanya untuk KAPROG
  const detectDepartment = (user: User): string => {
    console.log('🔍 Detecting department for user:', user)

    if (user.role !== 'KAPROG') return ''

    // Priority 1: Gunakan departmentName jika ada
    if (user.departmentName?.trim()) return user.departmentName.trim()

    // Priority 2: Detect dari username
    const username = user.username.toLowerCase()
    if (username.includes('marketing') || username.includes('mkt') || username.includes('mia')) return 'Marketing'
    if (username.includes('it') || username.includes('tech') || username.includes('hizam')) return 'IT'

    // Priority 3: Detect dari email
    const email = user.email?.toLowerCase() || ''
    if (email.includes('marketing') || email.includes('mkt') || email.includes('almia')) return 'Marketing'
    if (email.includes('it') || email.includes('tech') || email.includes('alhizam')) return 'IT'

    // Hardcode untuk username tertentu
    if (username === 'mia' || username === 'almia') return 'Marketing'
    if (username === 'alhizam') return 'IT'

    console.warn('❓ Cannot detect department for KAPROG:', user)
    return 'IT' // fallback
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await $fetch<LoginResponse>(`${config.public.apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username, password },
      })

      if (!res || !res.user) {
        alert("Login gagal — user/role tidak ditemukan pada response.")
        return false
      }

      // 🔥 Tambahkan departmentName hanya untuk KAPROG
      const userData: User = {
        ...res.user,
        departmentName: res.user.role === 'KAPROG'
          ? (res.user.departmentName?.trim() || detectDepartment(res.user))
          : undefined
      }

      console.log('✅ Final user data:', userData)

      // Simpan ke localStorage
      if (isClient()) {
        if (res.access_token) localStorage.setItem("token", res.access_token)
        localStorage.setItem("user", JSON.stringify(userData))
      }

      user.value = userData

      // Redirect
      if (isClient()) {
        const redirectPath = getRedirectPath(userData)
        console.log('🔄 Redirecting to:', redirectPath)
        await router.push(redirectPath)
      }

      return true
    } catch (err: any) {
      console.error("Login error:", err)
      alert(err?.data?.message || "Login gagal, periksa username & password")
      return false
    }
  }

  // 🔥 Redirect logic
  const getRedirectPath = (user: User): string => {
    console.log('🔍 User data for redirect:', user)
    const role = user.role
    const department = user.departmentName?.toLowerCase().trim()

    switch (role) {
      case 'SUPERADMIN': return '/superadmin/super'
      case 'ADMIN': return '/admin/admin'
      case 'KAPROG':
        if (department === 'marketing') return '/kaprog-marketing'
        return '/kaprog-it'
      case 'PEKERJA': return '/pekerja/dashboard'
      default:
        console.warn('❓ Unknown role, redirecting to home')
        return '/'
    }
  }

  const logout = () => {
    if (isClient()) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/login")
    }
    user.value = null
  }

  const loadUser = async () => {
    if (!isClient()) return
    const raw = localStorage.getItem("user")
    if (raw) {
      try { user.value = JSON.parse(raw) as User } 
      catch { user.value = null }
    } else {
      user.value = null
    }
  }

  return {
    user,
    loadUser,
    login,
    logout,
    getRedirectPath,
    detectDepartment
  }
}
