export default defineNuxtRouteMiddleware((to) => {
  if (process.client) {
    const user = localStorage.getItem("user")
    if (user) {
      const parsed = JSON.parse(user)

      // kalau route khusus SUPER_ADMIN
      if (to.path.startsWith("/dashboard/super") && parsed.role !== "SUPER_ADMIN") {
        return navigateTo("/dashboard/admin")
      }

      // kalau route khusus ADMIN
      if (to.path.startsWith("/dashboard/admin") && parsed.role !== "ADMIN") {
        return navigateTo("/dashboard/super")
      }
    }
  }
})
