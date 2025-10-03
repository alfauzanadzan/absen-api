<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

// State
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

// Fetch data dari backend
const fetchStats = async () => {
  try {
    const res = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const users = await res.json()

    console.log('Users data:', users) // DEBUG

    // PERBAIKAN: Gunakan role yang sesuai dengan database
    const workerCount = users.filter((u: any) => u.role === 'PEKERJA').length
    const kaprogCount = users.filter((u: any) => u.role === 'KAPROG').length
    const adminCount = users.filter((u: any) => u.role === 'ADMIN').length
    const superadminCount = users.filter((u: any) => u.role === 'SUPERADMIN').length

    stats.value = [
      { key: 'workers', label: 'Pekerja', value: workerCount, accent: 'green' },
      { key: 'kaprog', label: 'Kaprog', value: kaprogCount, accent: 'blue' },
      { key: 'admin', label: 'Admin', value: adminCount, accent: 'purple' },
      { key: 'superadmin', label: 'Super Admin', value: superadminCount, accent: 'red' }
    ]
  } catch (err) {
    console.error('Gagal ambil stats:', err)
  }
}

const fetchDivisions = async () => {
  try {
    // PERBAIKAN: Endpoint yang benar adalah /departments
    const res = await fetch('http://localhost:3000/departments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const departments = await res.json()
    
    console.log('Departments data:', departments) // DEBUG

    // Hitung jumlah user per department
    const userRes = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const users = await userRes.json()

    divisions.value = departments.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      count: users.filter((u: any) => u.departmentName === dept.name).length
    }))

    console.log('Divisions with counts:', divisions.value) // DEBUG
  } catch (err) {
    console.error('Gagal ambil divisions:', err)
    // Fallback data untuk testing
    divisions.value = [
      { id: '1', name: 'IT', count: 0 },
      { id: '2', name: 'Marketing', count: 0 }
    ]
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchStats()
  fetchDivisions()
})

const handleLogout = () => {
  logout()
}

// Refresh data
const refreshData = () => {
  fetchStats()
  fetchDivisions()
}

// helpers warna
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
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <!-- Logo atau icon bisa ditambah di sini -->
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/superadmin/super" class="p-2 rounded bg-blue-100 text-blue-600 font-medium">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/superadmin/addaccount" class="p-2 rounded hover:bg-gray-200">Add Account</a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 px-8 py-6 overflow-y-auto">
      <!-- header -->
      <div class="flex items-start justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold">
            WELCOME, <span class="text-indigo-700">{{ user?.username ?? 'Superadmin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">{{ user?.role ?? 'SUPER ADMIN' }}</p>
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
            class="px-3 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <!-- stat cards -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in stats"
          :key="card.key"
          class="p-5 rounded-lg shadow-sm bg-white flex items-center justify-between border"
        >
          <div>
            <div class="text-sm text-gray-500 uppercase">{{ card.label }}</div>
            <div :class="['mt-2 text-3xl font-extrabold', accentToNumberColor(card.accent)]">
              {{ card.value }}
            </div>
          </div>
          <div :class="['p-3 rounded-full', accentToBg(card.accent)]">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="1.5" d="M12 6v6l4 2"></path>
              <circle cx="12" cy="12" r="9" stroke-width="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <!-- division summary -->
      <section class="mt-10 bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Department Summary</h2>
            <p class="text-sm text-gray-500 mt-1">Ringkasan jumlah pegawai per department</p>
          </div>
          <div class="flex items-center gap-3">
            <input 
              v-model="search" 
              placeholder="Cari department..." 
              class="px-3 py-2 border rounded-md w-64"
            />
            <span class="text-sm text-gray-500">
              Total: {{ divisions.reduce((sum, div) => sum + div.count, 0) }}
            </span>
          </div>
        </div>

        <!-- list division -->
        <ul class="mt-6 space-y-4" v-if="filteredDivisions.length > 0">
          <li
            v-for="div in filteredDivisions"
            :key="div.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 rounded"
          >
            <span class="font-medium text-gray-800">{{ div.name }}</span>
            <div class="flex-1 mx-4 h-2 bg-gray-200 rounded">
              <div
                class="h-2 bg-indigo-500 rounded transition-all duration-500"
                :style="{ width: (div.count / totalWorkers * 100) + '%' }"
              />
            </div>
            <span class="text-gray-600 font-medium min-w-12 text-right">{{ div.count }} orang</span>
          </li>
        </ul>
        
        <!-- empty state -->
        <div v-else class="mt-6 text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Tidak ada department yang ditemukan</p>
        </div>
      </section>

      <!-- debug info (bisa dihapus di production) -->
      <div class="mt-6 p-4 bg-gray-100 rounded text-xs">
        <div class="font-semibold mb-2">Debug Info:</div>
        <div>User Role: {{ user?.role }}</div>
        <div>Total Departments: {{ divisions.length }}</div>
        <div>Total Users in Stats: {{ stats.reduce((sum, stat) => sum + stat.value, 0) }}</div>
      </div>
    </main>
  </div>
</template>