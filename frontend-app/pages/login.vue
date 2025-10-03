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

const { login, getRedirectPath } = useAuth()
const router = useRouter()

const canSubmit = computed(() => username.value.trim() !== '' && password.value !== '' && !loading.value)

const passwordScore = computed(() => {
  const v = password.value
  let score = 0
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

// 🔥 FUNCTION BARU: Preview role & redirect path
const previewInfo = computed(() => {
  if (!username.value.trim()) return null
  
  const usernameLower = username.value.toLowerCase()
  
  // Detect role dan department berdasarkan username
  let detectedRole = 'KAPROG'
  let detectedDepartment = 'IT'
  
  if (usernameLower === 'superadmin' || usernameLower.includes('super')) {
    detectedRole = 'SUPERADMIN'
    detectedDepartment = ''
  } else if (usernameLower === 'admin' || usernameLower.includes('admin') || usernameLower === 'alfauzan') {
    detectedRole = 'ADMIN'
    detectedDepartment = ''
  } else if (usernameLower.includes('marketing') || usernameLower.includes('mkt') || usernameLower.includes('mia')) {
    detectedRole = 'KAPROG'
    detectedDepartment = 'Marketing'
  } else if (usernameLower.includes('it') || usernameLower.includes('tech') || usernameLower.includes('hizam')) {
    detectedRole = 'KAPROG' 
    detectedDepartment = 'IT'
  }
  
  // Simulasi user object untuk preview
  const mockUser = {
    username: usernameLower,
    role: detectedRole,
    departmentName: detectedDepartment
  }
  
  const redirectPath = getRedirectPath(mockUser)
  
  return {
    role: detectedRole,
    department: detectedDepartment,
    redirectPath: redirectPath,
    roleColor: {
      'SUPERADMIN': 'text-red-600 bg-red-50',
      'ADMIN': 'text-purple-600 bg-purple-50', 
      'KAPROG': 'text-green-600 bg-green-50'
    }[detectedRole]
  }
})

onMounted(() => {
  try {
    const r = JSON.parse(localStorage.getItem('rememberedUser') || 'null')
    if (r?.username) username.value = r.username
  } catch {}
})

watch([username, password], () => { 
  if (error.value) error.value = '' 
})

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
      
      console.log('✅ Login berhasil, redirecting...')
      
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
          
          <!-- 🔥 PREVIEW INFO -->
          <div v-if="previewInfo && username.trim()" class="mt-2 p-3 bg-blue-50 rounded-lg text-xs w-full border border-blue-200">
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-blue-700">Role:</span>
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', previewInfo.roleColor]">
                    {{ previewInfo.role }}
                  </span>
                </div>
                <p v-if="previewInfo.department" class="text-blue-700">
                  <span class="font-semibold">Department:</span> 
                  <span class="ml-1 font-medium">{{ previewInfo.department }}</span>
                </p>
                <p v-else class="text-blue-700 text-xs italic">
                  Tidak membutuhkan department
                </p>
              </div>
              <div class="text-right">
                <p class="text-blue-700 font-semibold text-xs mb-1">Redirect ke:</p>
                <code class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono border border-blue-200">
                  {{ previewInfo.redirectPath }}
                </code>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700 mb-1">
              Username
              <span class="text-xs text-slate-400 ml-1">(akan menentukan halaman tujuan)</span>
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              :disabled="loading"
              class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2.5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-gray-50"
              placeholder="Contoh: superadmin, admin, almia, alhizam"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="password" class="block text-sm font-medium text-slate-700">Kata sandi</label>
              <button 
                type="button" 
                :disabled="loading"
                class="text-sm underline text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50" 
                @click="$router.push('/forgot-password')"
              >
                Lupa kata sandi?
              </button>
            </div>

            <div class="relative mt-1">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :disabled="loading"
                class="block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2.5 pr-24 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-gray-50"
                aria-describedby="pw-help pw-strength"
                placeholder="Masukkan password Anda"
              />

              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  type="button" 
                  @click="showPassword = !showPassword" 
                  :disabled="loading"
                  class="text-sm px-2 py-1 rounded text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" 
                  :aria-pressed="showPassword"
                >
                  {{ showPassword ? 'Sembunyikan' : 'Tampilkan' }}
                </button>
              </div>
            </div>

            <p id="pw-help" class="mt-2 text-xs text-slate-500">
              Minimal 8 karakter. Campurkan huruf besar, angka, dan simbol untuk keamanan lebih baik.
            </p>

            <div id="pw-strength" class="mt-2">
              <div class="w-full h-2 bg-slate-100 rounded overflow-hidden">
                <div
                  class="h-2 rounded transition-all duration-300"
                  :style="{ 
                    width: passwordStrength.val + '%', 
                    background: passwordScore >= 3 ? 
                      'linear-gradient(90deg,#34d399,#06b6d4)' : 
                      'linear-gradient(90deg,#f97316,#f43f5e)'
                  }"
                ></div>
              </div>
              <div class="mt-1 text-xs text-slate-500 flex justify-between">
                <span>{{ passwordStrength.label }}</span>
                <span v-if="password.length > 0" class="font-mono">{{ password.length }} karakter</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                v-model="remember" 
                :disabled="loading"
                class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors disabled:opacity-50" 
              />
              <span :class="{ 'opacity-50': loading }">Ingat username saya</span>
            </label>

            <div class="text-sm">
              <button 
                type="button" 
                :disabled="loading"
                class="underline text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50" 
                @click="$router.push('/help')"
              >
                Butuh bantuan?
              </button>
            </div>
          </div>

          <div class="pt-2">
            <div v-if="error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <p class="text-sm text-red-700 flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                {{ error }}
              </p>
            </div>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="w-full inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-white font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
              :class="loading ? 
                'bg-slate-600 cursor-wait' : 
                'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'"
            >
              <svg 
                v-if="loading" 
                class="w-4 h-4 animate-spin" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>

              <span>{{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}</span>
            </button>
          </div>
        </form>

        <!-- 🔥 INFO REDIRECT RULES -->
        <div class="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Aturan Redirect Berdasarkan Role:</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="flex items-start gap-2 p-2 bg-white rounded border">
              <div class="w-2 h-2 mt-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="font-semibold text-red-600">SUPERADMIN</p>
                <p class="text-slate-600">→ /superadmin/super</p>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 bg-white rounded border">
              <div class="w-2 h-2 mt-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="font-semibold text-purple-600">ADMIN</p>
                <p class="text-slate-600">→ /admin/admin</p>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 bg-white rounded border">
              <div class="w-2 h-2 mt-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="font-semibold text-green-600">KAPROG Marketing</p>
                <p class="text-slate-600">→ /kaprog-marketing</p>
              </div>
            </div>
            <div class="flex items-start gap-2 p-2 bg-white rounded border">
              <div class="w-2 h-2 mt-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="font-semibold text-green-600">KAPROG IT</p>
                <p class="text-slate-600">→ /kaprog-it</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-slate-400">
          © {{ new Date().getFullYear() }} Nama Aplikasi • v1.0
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions for better UX */
input, button, select {
  transition: all 0.2s ease-in-out;
}

/* Custom focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>