<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

// State
const stats = ref<{ key: string; label: string; value: number; accent: string }[]>([])
const divisions = ref<{ id: number; name: string; count: number }[]>([])

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

    const workerCount = users.filter((u: any) => u.role === 'PEGAWAI').length
    const kaprogCount = users.filter((u: any) => u.role === 'KAPROG').length
    const adminCount = users.filter((u: any) => u.role === 'ADMIN').length

    stats.value = [
      { key: 'workers', label: 'Worker', value: workerCount, accent: 'green' },
      { key: 'kaprog', label: 'Kaprog', value: kaprogCount, accent: 'red' },
      { key: 'admin', label: 'Admin', value: adminCount, accent: 'indigo' }
    ]
  } catch (err) {
    console.error('Gagal ambil stats:', err)
  }
}

const fetchDivisions = async () => {
  try {
    const res = await fetch('http://localhost:3000/divisions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    divisions.value = await res.json()
  } catch (err) {
    console.error('Gagal ambil divisions:', err)
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

// helpers warna
const accentToBg = (a: string) =>
  a === 'green' ? 'bg-green-100 text-green-700' :
  a === 'red' ? 'bg-red-100 text-red-700' :
  a === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
  'bg-indigo-100 text-indigo-700'

const accentToNumberColor = (a: string) =>
  a === 'green' ? 'text-green-600' :
  a === 'red' ? 'text-red-600' :
  a === 'yellow' ? 'text-yellow-600' :
  'text-indigo-600'
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col shadow-md">
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <nav class="flex flex-col space-y-2">
        <NuxtLink href="/superadmin/dashboard" class="p-2 rounded hover:bg-gray-200 transition">Dashboard</NuxtLink>
        <NuxtLink href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-200 transition">Profile</NuxtLink>
        <NuxtLink href="/superadmin/addaccount" class="p-2 rounded hover:bg-gray-200 transition">Add Account</NuxtLink>
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

        <button
          @click="handleLogout"
          class="px-3 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      <!-- stat cards -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="card in stats"
          :key="card.key"
          class="p-5 rounded-lg shadow-sm bg-white flex items-center justify-between border"
        >
          <div>
            <div class="text-sm text-gray-500 uppercase">{{ card.label }}</div>
            <div :class="['mt-2 text-3xl font-extrabold', accentToNumberColor(card.accent)]">{{ card.value }}</div>
          </div>
          <svg class="w-10 h-10 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-width="1.5" d="M12 6v6l4 2"></path>
            <circle cx="12" cy="12" r="9" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <!-- division summary -->
      <section class="mt-10 bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Division Summary</h2>
            <p class="text-sm text-gray-500 mt-1">Ringkasan jumlah pegawai per divisi</p>
          </div>
          <div class="flex items-center gap-3">
            <input v-model="search" placeholder="Cari divisi..." class="px-3 py-2 border rounded-md" />
          </div>
        </div>

        <!-- list division -->
        <ul class="mt-6 space-y-4">
          <li
            v-for="div in filteredDivisions"
            :key="div.id"
            class="flex items-center justify-between"
          >
            <span class="font-medium">{{ div.name }}</span>
            <div class="flex-1 mx-4 h-2 bg-gray-200 rounded">
              <div
                class="h-2 bg-indigo-500 rounded"
                :style="{ width: (div.count / totalWorkers * 100) + '%' }"
              />
            </div>
            <span class="text-gray-600 text-sm">{{ div.count }}</span>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
