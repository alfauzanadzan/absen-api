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
  <div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white p-6">
    <div class="w-full max-w-md mx-auto">
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 md:p-8">

        <!-- HEADER -->
        <div class="flex flex-col items-center mb-4 gap-2">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md">
            <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z M20 11c0 3-2 5-4 5s-4-2-4-5 2-5 4-5 4 2 4 5z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Masuk</h1>
          <p class="text-sm text-slate-500 text-center">Masuk menggunakan akunmu untuk melanjutkan.</p>
        </div>

        <!-- PREVIEW ROLE & REDIRECT -->
        <div v-if="previewInfo && username.trim()" class="mb-4 p-3 bg-blue-50 rounded-lg text-xs w-full border border-blue-200">
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-blue-700">Role:</span>
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', previewInfo.roleColor]">{{ previewInfo.role }}</span>
              </div>
              <p v-if="previewInfo.department" class="text-blue-700"><span class="font-semibold">Department:</span> <span class="ml-1 font-medium">{{ previewInfo.department }}</span></p>
              <p v-else class="text-blue-700 text-xs italic">Tidak membutuhkan department</p>
            </div>
            <div class="text-right">
              <p class="text-blue-700 font-semibold text-xs mb-1">Redirect ke:</p>
              <code class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono border border-blue-200">{{ previewInfo.redirectPath }}</code>
            </div>
          </div>
        </div>

        <!-- FORM LOGIN -->
        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input v-model="username" type="text" :disabled="loading" autocomplete="username"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: superadmin" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div class="relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" :disabled="loading" autocomplete="current-password"
                class="block w-full rounded-md border border-gray-300 px-3 py-2.5 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan password" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-600 hover:text-slate-800">{{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}</button>
            </div>

            <!-- PASSWORD STRENGTH -->
            <div class="mt-2">
              <div class="w-full h-2 bg-slate-100 rounded overflow-hidden">
                <div class="h-2 rounded transition-all duration-300" :style="{ width: passwordStrength.val + '%', background: passwordScore >= 3 ? 'linear-gradient(90deg,#34d399,#06b6d4)' : 'linear-gradient(90deg,#f97316,#f43f5e)'}"></div>
              </div>
              <div class="mt-1 text-xs text-slate-500 flex justify-between">
                <span>{{ passwordStrength.label }}</span>
                <span v-if="password.length > 0" class="font-mono">{{ password.length }} karakter</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="remember" :disabled="loading" class="w-4 h-4 rounded border-gray-300 text-blue-600" />
              Ingat username saya
            </label>
          </div>

          <div>
            <button type="submit" :disabled="!canSubmit"
              class="w-full rounded-lg px-4 py-3 text-white font-semibold transition-all duration-200 disabled:opacity-60 shadow-sm hover:shadow-md active:scale-95"
              :class="loading ? 'bg-slate-600 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'">
              <span>{{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}</span>
            </button>
          </div>

          <div v-if="error" class="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{{ error }}</div>
        </form>

        <!-- FOOTER -->
        <div class="mt-6 text-center text-xs text-slate-400">
          © {{ new Date().getFullYear() }} Nama Aplikasi • v1.0
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
input, button { transition: all 0.2s ease-in-out; }
input:focus { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
</style>
