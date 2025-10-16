<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

// =============================
// STATE
// =============================
const loading = ref(false)
const stats = ref<{ key: string; label: string; value: number; accent: string }[]>([])
const divisions = ref<{ id: string; name: string; count: number }[]>([])

const totalWorkers = computed(() =>
  divisions.value.reduce((s, d) => s + d.count, 0) || 1
)

const search = ref('')
const filteredDivisions = computed(() =>
  divisions.value.filter(d =>
    d.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

// =============================
// FETCH DATA
// =============================
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ditemukan')

    const [deptRes, userRes] = await Promise.all([
      fetch('http://localhost:3000/departments', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('http://localhost:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    const [departments, users] = await Promise.all([deptRes.json(), userRes.json()])

    // Hitung berdasarkan role
    const roleCount = {
      PEKERJA: users.filter((u: any) => u.role === 'PEKERJA').length,
      KAPROG: users.filter((u: any) => u.role === 'KAPROG').length,
      ADMIN: users.filter((u: any) => u.role === 'ADMIN').length,
      SUPERADMIN: users.filter((u: any) => u.role === 'SUPERADMIN').length,
    }

    stats.value = [
      { key: 'workers', label: 'Pekerja', value: roleCount.PEKERJA, accent: 'green' },
      { key: 'kaprog', label: 'Kaprog', value: roleCount.KAPROG, accent: 'blue' },
      { key: 'admin', label: 'Admin', value: roleCount.ADMIN, accent: 'purple' },
      { key: 'superadmin', label: 'Super Admin', value: roleCount.SUPERADMIN, accent: 'red' },
    ]

    // Hitung jumlah user per department
    divisions.value = departments.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      count: users.filter((u: any) => u.departmentName === dept.name).length,
    }))
  } catch (err) {
    console.error('Gagal ambil data dashboard:', err)
    stats.value = [
      { key: 'workers', label: 'Pekerja', value: 0, accent: 'green' },
      { key: 'kaprog', label: 'Kaprog', value: 0, accent: 'blue' },
      { key: 'admin', label: 'Admin', value: 0, accent: 'purple' },
      { key: 'superadmin', label: 'Super Admin', value: 0, accent: 'red' },
    ]
    divisions.value = []
  } finally {
    loading.value = false
  }
}

// =============================
// LIFECYCLE
// =============================
onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchDashboardData()
})

// =============================
// ACTION
// =============================
const handleLogout = () => logout()
const refreshData = () => fetchDashboardData()
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">
          SUPERADMIN
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/superadmin/super"
          class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">🏠 Dashboard</a>
        <a href="/superadmin/profilsuper"
          class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/superadmin/addaccount"
          class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/superadmin/absenlokasi"
          class="p-3 rounded-lg hover:bg-white/20 transition">📍 Lokasi Absen</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10 overflow-y-auto relative">
      <!-- Navbar -->
      <div class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-2xl font-bold text-white drop-shadow-lg">
            Welcome,
            <span class="text-yellow-200">{{ user?.username ?? 'Superadmin' }}</span>
          </h2>
          <p class="text-sm text-white/80 tracking-wide uppercase">
            {{ user?.role ?? 'SUPER ADMIN' }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-3 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Refresh Data' }}
          </button>
          <button
            @click="handleLogout"
            class="px-5 py-2 bg-white/30 backdrop-blur-md text-white font-bold rounded-lg shadow hover:bg-white/50 transition">
            Log Out
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="card in stats"
          :key="card.key"
          class="p-5 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg border border-white/40 hover:scale-105 hover:shadow-2xl transition-all"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm text-white/80 uppercase">{{ card.label }}</div>
              <div class="mt-2 text-4xl font-extrabold text-white">
                {{ card.value }}
              </div>
            </div>
            <div class="bg-white/40 p-3 rounded-full">
              <svg
                class="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 6v6l4 2"></path>
                <circle cx="12" cy="12" r="9"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Division Summary -->
      <section
        class="mt-12 bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30"
      >
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-semibold text-white">Department Summary</h2>
            <p class="text-sm text-white/80">Jumlah pegawai per department</p>
          </div>
          <input
            v-model="search"
            placeholder="Cari department..."
            class="px-4 py-2 rounded-lg border border-white/40 bg-white/20 text-white placeholder-white/70 focus:outline-none"
          />
        </div>

        <ul class="space-y-4" v-if="filteredDivisions.length">
          <li
            v-for="div in filteredDivisions"
            :key="div.id"
            class="flex items-center justify-between bg-white/20 p-3 rounded-xl"
          >
            <span class="font-medium text-white">{{ div.name }}</span>
            <div class="flex-1 mx-4 h-2 bg-white/30 rounded-full">
              <div
                class="h-2 bg-yellow-300 rounded-full transition-all duration-700"
                :style="{ width: (div.count / totalWorkers * 100) + '%' }"
              ></div>
            </div>
            <span class="text-white font-semibold min-w-12 text-right">
              {{ div.count }} org
            </span>
          </li>
        </ul>

        <div v-else class="text-center text-white/70 py-8">
          Tidak ada department ditemukan
        </div>
      </section>
    </main>
  </div>
</template>
