export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000",
    },
  },

  css: ["@/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {}, 
      autoprefixer: {},
    },
  },
})
