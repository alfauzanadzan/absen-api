<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, Role } from '@/composables/useAuth'

const username = ref('')
const password = ref('')
const loading = ref(false)
const remember = ref(false)
const showPassword = ref(false)
const error = ref('')

const { login, getRedirectPath } = useAuth()
const router = useRouter()

// =======================
// COMPUTED / UTILITY
// =======================
const canSubmit = computed(() => username.value.trim() !== '' && password.value !== '' && !loading.value)

const passwordScore = computed(() => {
  let score = 0
  const v = password.value
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score
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

// =======================
// PREVIEW ROLE & REDIRECT
// =======================
const previewInfo = computed(() => {
  if (!username.value.trim()) return null

  const uname = username.value.toLowerCase()
  let detectedRole: Role = 'KAPROG'
  let detectedDepartment = 'IT'

  if (uname === 'superadmin' || uname.includes('super')) {
    detectedRole = 'SUPERADMIN'
    detectedDepartment = ''
  } else if (uname === 'admin' || uname.includes('admin')) {
    detectedRole = 'ADMIN'
    detectedDepartment = ''
  } else if (uname.includes('marketing') || uname.includes('mkt') || uname.includes('mia')) {
    detectedRole = 'KAPROG'
    detectedDepartment = 'Marketing'
  } else if (uname.includes('it') || uname.includes('tech') || uname.includes('hizam')) {
    detectedRole = 'KAPROG'
    detectedDepartment = 'IT'
  }

  const mockUser = {
    username: uname,
    role: detectedRole,
    departmentName: detectedDepartment
  }

  const redirectPath = getRedirectPath(mockUser)
  return {
    role: detectedRole,
    department: detectedDepartment,
    redirectPath,
    roleColor: {
      SUPERADMIN: 'text-red-600 bg-red-50',
      ADMIN: 'text-purple-600 bg-purple-50',
      KAPROG: 'text-green-600 bg-green-50',
      PEKERJA: 'text-green-600 bg-green-50'
    }[detectedRole]
  }
})

// =======================
// MOUNT / WATCH
// =======================
onMounted(() => {
  try {
    const r = JSON.parse(localStorage.getItem('rememberedUser') || 'null')
    if (r?.username) username.value = r.username
  } catch {}
})

watch([username, password], () => { if (error.value) error.value = '' })

// =======================
// LOGIN FUNCTION
// =======================
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
      if (remember.value) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username: username.value }))
      } else {
        localStorage.removeItem('rememberedUser')
      }
    } else {
      error.value = 'Login gagal — periksa username dan password.'
    }
  } catch (e: any) {
    console.error('Login error:', e)
    error.value = e.message || 'Terjadi kesalahan, coba lagi nanti.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100 relative overflow-hidden">

    <!-- BACKGROUND EFFECT -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-20 -left-20 w-96 h-96 bg-indigo-300/40 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-400/30 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
    </div>

    <!-- LOGIN CARD -->
    <div class="relative w-full max-w-md backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8 md:p-10 animate-fadeIn">

      <!-- HEADER -->
      <div class="flex flex-col items-center mb-6 text-center">
        <div class="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg">
          <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z M20 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z" />
          </svg>
        </div>
        <h1 class="mt-4 text-3xl font-bold text-slate-800">Selamat Datang 👋</h1>
        <p class="text-slate-500 text-sm">Masuk menggunakan akunmu untuk melanjutkan</p>
      </div>

      <!-- PREVIEW INFO -->
      <transition name="fade">
        <div v-if="previewInfo && username.trim()" class="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-xs border border-blue-100 shadow-inner">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-blue-800 font-semibold mb-1">
                Role:
                <span :class="['px-2 py-1 rounded-full text-xs font-medium ml-1', previewInfo.roleColor]">{{ previewInfo.role }}</span>
              </p>
              <p class="text-blue-700 font-medium">
                Department:
                <span v-if="previewInfo.department">{{ previewInfo.department }}</span>
                <span v-else class="italic text-slate-500">—</span>
              </p>
            </div>
            <div class="text-right text-slate-700">
              <p class="font-semibold text-xs">Redirect:</p>
              <code class="bg-slate-100 border border-slate-200 rounded px-2 py-1 font-mono text-[11px]">{{ previewInfo.redirectPath }}</code>
            </div>
          </div>
        </div>
      </transition>

      <!-- LOGIN FORM -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input v-model="username" type="text" :disabled="loading"
            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Contoh: superadmin" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" :disabled="loading"
              class="w-full rounded-xl border border-gray-300 px-4 py-2.5 pr-24 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="Masukkan password" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-800">
              {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
            </button>
          </div>

          <!-- STRENGTH BAR -->
          <div class="mt-2">
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-500"
                :style="{ width: passwordStrength.val + '%', background: passwordScore >= 3 ? 'linear-gradient(90deg,#34d399,#06b6d4)' : 'linear-gradient(90deg,#f97316,#f43f5e)' }"></div>
            </div>
            <div class="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>{{ passwordStrength.label }}</span>
              <span v-if="password.length" class="font-mono">{{ password.length }} karakter</span>
            </div>
          </div>
        </div>

        <!-- REMEMBER -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer text-slate-600">
            <input type="checkbox" v-model="remember" :disabled="loading" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
            Ingat username
          </label>
          <a href="#" class="text-blue-600 hover:underline">Lupa password?</a>
        </div>

        <!-- SUBMIT -->
        <button type="submit" :disabled="!canSubmit"
          class="w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60"
          :class="loading ? 'bg-slate-500 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'">
          {{ loading ? 'Memproses...' : 'Masuk Sekarang' }}
        </button>

        <transition name="fade">
          <div v-if="error" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm shadow-inner">
            {{ error }}
          </div>
        </transition>
      </form>

      <!-- FOOTER -->
      <div class="mt-6 text-center text-xs text-slate-400">
        © {{ new Date().getFullYear() }} Nama Aplikasi • <span class="font-medium text-blue-500">v1.0</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.6s ease-out; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
