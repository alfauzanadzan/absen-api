<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
})

type StatCard = { key: string; label: string; value: number; accent: 'green'|'red'|'yellow'|'indigo' }
const stats = ref<StatCard[]>([
  { key: 'workers', label: 'Worker', value: 128, accent: 'green' },
  { key: 'kaprog', label: 'Kaprog', value: 3, accent: 'red' },
  { key: 'division', label: 'Divisi', value: 3, accent: 'yellow' },
  { key: 'admin', label: 'Admin', value: 12, accent: 'indigo' },
])

type Division = { id: number; name: string; count: number }
const divisions = ref<Division[]>([
  { id: 1, name: 'Programing', count: 40 },
  { id: 2, name: 'Designer', count: 40 },
  { id: 3, name: 'Marketing', count: 48 },
])

const totalWorkers = computed(() => divisions.value.reduce((s, d) => s + d.count, 0) || 1)

const search = ref('')
const filteredDivisions = computed(() =>
  divisions.value.filter(d => d.name.toLowerCase().includes(search.value.toLowerCase()))
)

const accentToBg = (a: StatCard['accent']) =>
  a === 'green' ? 'bg-green-100 text-green-700' :
  a === 'red' ? 'bg-red-100 text-red-700' :
  a === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
  'bg-indigo-100 text-indigo-700'

const accentToNumberColor = (a: StatCard['accent']) =>
  a === 'green' ? 'text-green-600' :
  a === 'red' ? 'text-red-600' :
  a === 'yellow' ? 'text-yellow-600' :
  'text-indigo-600'

const handleLogout = () => logout()
</script>

<template>
  <div class="flex h-screen bg-white-100">
    <!-- SIDEBAR -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <!-- Logo -->
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <!-- Menu -->
      <nav class="flex flex-col space-y-2">
        <a href="/superadmin/super" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/superadmin/addaccount" class="p-2 rounded hover:bg-gray-200">Add Account</a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 overflow-y-auto p-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold">
            WELCOME, <span class="text-indigo-700">{{ user?.username ?? 'Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">{{ user?.role ?? 'SUPER ADMIN' }}</p>
        </div>

        <div class="flex items-center gap-4">
          <button
            @click="handleLogout"
            class="px-3 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition"
            title="Log out"
          >
            Log Out
          </button>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in stats"
          :key="card.key"
          :class="['p-5 rounded-lg shadow-sm bg-white flex items-center justify-between border', accentToBg(card.accent)]"
        >
          <div>
            <div class="text-sm text-gray-500 uppercase">{{ card.label }}</div>
            <div :class="['mt-2 text-3xl font-extrabold', accentToNumberColor(card.accent)]">{{ card.value }}</div>
          </div>
          <div class="flex flex-col items-end">
            <svg class="w-10 h-10 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-width="1.5" d="M12 6v6l4 2"></path>
              <circle cx="12" cy="12" r="9" stroke-width="1.5" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Division Summary -->
      <section class="mt-10 bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">Division Summary</h2>
            <p class="text-sm text-gray-500 mt-1">Ringkasan jumlah pegawai per divisi</p>
          </div>
          <div class="flex items-center gap-3">
            <input v-model="search" placeholder="Cari divisi..." class="px-3 py-2 border rounded-md" />
            <button class="px-3 py-2 border rounded-md text-sm" @click="$router.push('/dashboard/divisions')">Lihat semua</button>
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div v-for="d in filteredDivisions" :key="d.id" class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div class="text-sm font-semibold uppercase tracking-wide text-gray-700">{{ d.name }}</div>
                <div class="text-sm font-semibold text-gray-800">{{ d.count }}</div>
              </div>
              <!-- Progress Bar -->
              <div class="mt-2 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-3 rounded-full"
                  :style="{ 
                    width: ((d.count / totalWorkers.value) * 100) + '%', 
                    background: 'linear-gradient(90deg, rgba(99,102,241,1), rgba(34,197,94,1))' 
                  }"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Graph / Quick Actions -->
      <section class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-3">Headcount by Month</h3>
          <div class="h-40 flex items-center justify-center text-gray-400">[Grafik: Integrasikan chart library]</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium mb-3">Quick Actions</h3>
          <div class="space-y-3">
            <button class="w-full px-4 py-2 bg-blue-600 text-white rounded shadow">Add Worker</button>
            <button class="w-full px-4 py-2 border rounded">Import CSV</button>
            <button class="w-full px-4 py-2 border rounded">Export Report</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
[aria-hidden="true"] {
  pointer-events: none;
}
</style>
