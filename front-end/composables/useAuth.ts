export const useAuth = () => {
  const token = useState<string | null>("token", () => null)
  const user = useState<any | null>("user", () => null)

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await useFetch("http://localhost:3334/auth/login", {
        method: "POST",
        body: { username, password },
      })

      if (error.value) throw error.value

      token.value = data.value?.access_token || null
      user.value = data.value?.user || null

      if (token.value) {
        localStorage.setItem("token", token.value)
        localStorage.setItem("user", JSON.stringify(user.value))
      }

      return true
    } catch (e) {
      console.error("Login gagal:", e)
      return false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigateTo("/login")
  }

  if (process.client && !token.value) {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken) token.value = savedToken
    if (savedUser) user.value = JSON.parse(savedUser)
  }

  return { token, user, login, logout }
}
