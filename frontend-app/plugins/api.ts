export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      // Skip Authorization kalau login
      if (!request.toString().includes("/auth/login")) {
        if (process.client) {
          const token = localStorage.getItem("token")
          if (token) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${token}`
            }
          }
        }
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})
