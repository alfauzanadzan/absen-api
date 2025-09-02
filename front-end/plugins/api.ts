// plugins/api.ts
export default defineNuxtPlugin((nuxtApp) => {
  const token = useCookie("token"); // ambil token dari cookie

  nuxtApp.provide("apiFetch", $fetch.create({
    baseURL: "http://localhost:3000", // ganti sesuai backend NestJS
    onRequest({ options }) {
      if (token.value) {
        options.headers = new Headers(options.headers || {});
        options.headers.set("Authorization", `Bearer ${token.value}`);
      }
    },
    onResponseError({ response }) {
      console.error("API Error:", response._data);
    }
  }));
});
