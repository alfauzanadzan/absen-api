<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

// =============================
// STATE
// =============================
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
const fetchStats = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const users = await res.json()

    console.log('Users data:', users) // DEBUG

    // Hitung berdasarkan role
    const workerCount = users.filter((u: any) => u.role === 'PEKERJA').length
    const kaprogCount = users.filter((u: any) => u.role === 'KAPROG').length
    const adminCount = users.filter((u: any) => u.role === 'ADMIN').length
    const superadminCount = users.filter((u: any) => u.role === 'SUPERADMIN').length

    stats.value = [
      { key: 'workers', label: 'Pekerja', value: workerCount, accent: 'green' },
      { key: 'kaprog', label: 'Kaprog', value: kaprogCount, accent: 'blue' },
      { key: 'admin', label: 'Admin', value: adminCount, accent: 'purple' },
      { key: 'superadmin', label: 'Super Admin', value: superadminCount, accent: 'red' },
    ]
  } catch (err) {
    console.error('Gagal ambil stats:', err)
  }
}

const fetchDivisions = async () => {
  try {
    const token = localStorage.getItem('token')

    // Fetch daftar department
    const res = await fetch('http://localhost:3000/departments', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const departments = await res.json()
    console.log('Departments data:', departments)

    // Fetch semua user
    const userRes = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const users = await userRes.json()

    // Hitung jumlah user per department
    divisions.value = departments.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      count: users.filter((u: any) => u.departmentName === dept.name).length,
    }))

    console.log('Divisions with counts:', divisions.value)
  } catch (err) {
    console.error('Gagal ambil divisions:', err)
    // Data fallback untuk testing
    divisions.value = [
      { id: '1', name: 'IT', count: 0 },
      { id: '2', name: 'Marketing', count: 0 },
    ]
  }
}

// =============================
// LIFECYCLE
// =============================
onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchStats()
  fetchDivisions()
})

// =============================
// ACTION
// =============================
const handleLogout = () => logout()

const refreshData = () => {
  fetchStats()
  fetchDivisions()
}

// =============================
// STYLE HELPERS
// =============================
const accentToBg = (a: string) =>
  a === 'green' ? 'bg-green-100 text-green-700' :
  a === 'blue' ? 'bg-blue-100 text-blue-700' :
  a === 'red' ? 'bg-red-100 text-red-700' :
  a === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
  'bg-purple-100 text-purple-700'

const accentToNumberColor = (a: string) =>
  a === 'green' ? 'text-green-600' :
  a === 'blue' ? 'text-blue-600' :
  a === 'red' ? 'text-red-600' :
  a === 'yellow' ? 'text-yellow-600' :
  'text-purple-600'
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
        <a
          href="/superadmin/super"
          class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"
        >🏠 Dashboard</a>
        <a
          href="/superadmin/profilsuper"
          class="p-3 rounded-lg hover:bg-white/20 transition"
        >👤 Profile</a>
        <a
          href="/superadmin/addaccount"
          class="p-3 rounded-lg hover:bg-white/20 transition"
        >➕ Add Account</a>
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
            class="px-3 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
          >
            Refresh Data
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
