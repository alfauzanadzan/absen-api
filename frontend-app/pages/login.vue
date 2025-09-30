<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const remember = ref(false)
const showPassword = ref(false)
const error = ref('')

const { login } = useAuth()
const router = useRouter()

const canSubmit = computed(() => username.value.trim() !== '' && password.value !== '' && !loading.value)

const passwordScore = computed(() => {
  const v = password.value
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score // 0..4
})

const passwordStrength = computed(() => {
  switch (passwordScore.value) {
    case 0: return { label: 'Sangat lemah', val: 0 }
    case 1: return { label: 'Lemah', val: 25 }
    case 2: return { label: 'Cukup', val: 50 }
    case 3: return { label: 'Kuat', val: 75 }
    case 4: return { label: 'Sangat kuat', val: 100 }
    default: return { label: '—', val: 0 }
  }
})

onMounted(() => {
  try {
    const r = JSON.parse(localStorage.getItem('rememberedUser') || 'null')
    if (r?.username) username.value = r.username
  } catch {}
})

watch([username, password], () => { if (error.value) error.value = '' })

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) {
    error.value = 'Username dan password wajib diisi.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const success = await login(username.value.trim(), password.value)

    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (remember.value) localStorage.setItem('rememberedUser', JSON.stringify({ username: username.value }))
      else localStorage.removeItem('rememberedUser')

      const roleRedirect: Record<string, string> = {
        SUPERADMIN: '/superadmin/super',
        ADMIN: '/admin/admin',
        KAPROG: '/kaprog/kaprog',
        PEKERJA: '/pekerja/pekerja',
      }

      await router.push(roleRedirect[user?.role] || '/')
    } else {
      error.value = 'Login gagal — periksa username dan password.'
    }
  } catch (e) {
    console.error(e)
    error.value = 'Terjadi kesalahan, coba lagi nanti.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- FIXED wrapper: covers viewport and centers card -->
  <div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6 z-50">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 md:p-8">
        <div class="flex flex-col items-center mb-4 gap-2">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md">
            <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z M20 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Masuk</h1>
          <p class="text-sm text-slate-500 text-center">Masuk menggunakan akunmu untuk melanjutkan.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              :aria-invalid="!!error"
              class="mt-1 block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400"
            />
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium text-slate-700">Kata sandi</label>
              <button type="button" class="text-sm underline text-slate-500" @click="$router.push('/forgot-password')">Lupa kata sandi?</button>
            </div>

            <div class="relative mt-1">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="block w-full rounded-md border-gray-200 shadow-sm px-3 py-2 pr-24 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:border-blue-400"
                aria-describedby="pw-help pw-strength"
              />

              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button type="button" @click="showPassword = !showPassword" class="text-sm px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200" :aria-pressed="showPassword">
                  {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
              </div>
            </div>

            <p id="pw-help" class="mt-2 text-xs text-slate-400">Minimal 8 karakter. Campurkan huruf besar, angka, dan simbol untuk keamanan lebih baik.</p>

            <!-- strength bar -->
            <div id="pw-strength" class="mt-2">
              <div class="w-full h-2 bg-slate-100 rounded overflow-hidden">
                <div
                  class="h-2 rounded transition-all"
                  :style="{ width: passwordStrength.val + '%' , background: passwordScore >= 3 ? 'linear-gradient(90deg,#34d399,#06b6d4)' : 'linear-gradient(90deg,#f97316,#f43f5e)'}"
                ></div>
              </div>
              <div class="mt-1 text-xs text-slate-500">{{ passwordStrength.label }}</div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="remember" class="w-4 h-4 rounded border-gray-300" />
              <span>Ingat saya</span>
            </label>

            <div class="text-sm">
              <button type="button" class="underline text-slate-500" @click="$router.push('/help')">Butuh bantuan?</button>
            </div>
          </div>

          <div>
            <p v-if="error" class="text-sm text-red-600 mb-2" role="alert">{{ error }}</p>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="w-full inline-flex items-center justify-center gap-3 rounded-md px-4 py-2 text-white font-medium transition disabled:opacity-60"
              :class="loading ? 'bg-slate-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>

              <span>{{ loading ? 'Masuk...' : 'Masuk' }}</span>
            </button>
          </div>
        </form>

        <!-- <div class="mt-4 text-center text-sm text-slate-500">
          Belum punya akun? <button @click="$router.push('/register')" class="text-blue-600 hover:underline">Daftar sekarang</button>
        </div> -->

        <div class="mt-3 text-center text-xs text-slate-300">© {{ new Date().getFullYear() }} Nama Aplikasi</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* small visual polish */
.blur-3xl { filter: blur(48px); }

/* optional: ensure body/html have no extra margin if included in component styling */
:global(html), :global(body), :global(#app) {
  height: 100%;
  margin: 0;
}
</style>
