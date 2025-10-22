// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: '/api', // tetap /api aja, nanti diproxy ke backend
    },
  },

  css: ['@/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  // 🚀 Proxy setup biar Nuxt nerusin ke NestJS backend
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3000', // port backend NestJS
        changeOrigin: true,
        prependPath: true,
      },
    },
  },
})
