<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

const { user, loadUser, logout } = useAuth()

const loading = ref(false)
const attendances = ref<any[]>([])
const search = ref('')

// =============================
// FETCH DATA ABSENSI DENGAN LOKASI
// =============================
const fetchAttendanceWithLocation = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token tidak ditemukan')

    const res = await fetch('http://localhost:3000/attendance/locations', {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    attendances.value = data
  } catch (err) {
    console.error('Gagal ambil data lokasi absen:', err)
    attendances.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchAttendanceWithLocation()
})

const handleLogout = () => logout()
const openMap = (lat: number, lng: number) => {
  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
}

const filteredData = computed(() =>
  attendances.value.filter(
    a =>
      a.user.name.toLowerCase().includes(search.value.toLowerCase()) ||
      a.department.name.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">
          SUPERADMIN
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/superadmin/super"
          class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/superadmin/profilsuper"
          class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/superadmin/addaccount"
          class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/superadmin/absenlokasi"
          class="p-3 rounded-lg bg-white/30 text-white shadow transition">📍 Lokasi Absen</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10 overflow-y-auto relative">
      <!-- Navbar -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h2 class="text-2xl font-bold text-white drop-shadow-lg">
            📍 Data Lokasi Absensi
          </h2>
          <p class="text-sm text-white/80 tracking-wide uppercase">
            Lihat siapa aja yang absen dan di mana posisinya
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="fetchAttendanceWithLocation"
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

      <!-- Search -->
      <div class="mb-6">
        <input
          v-model="search"
          placeholder="Cari nama atau departemen..."
          class="px-4 py-2 rounded-lg border border-white/40 bg-white/20 text-white placeholder-white/70 focus:outline-none w-full"
        />
      </div>

      <!-- Table -->
      <div class="bg-white/30 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-white/20 text-white uppercase text-sm">
            <tr>
              <th class="px-4 py-3">Nama</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Department</th>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3">Jam</th>
              <th class="px-4 py-3">Tipe</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Lokasi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in filteredData"
              :key="item.id"
              class="border-t border-white/20 text-white hover:bg-white/20 transition"
            >
              <td class="px-4 py-3 font-semibold">{{ item.user.name }}</td>
              <td class="px-4 py-3">{{ item.role }}</td>
              <td class="px-4 py-3">{{ item.department?.name || '-' }}</td>
              <td class="px-4 py-3">{{ new Date(item.date).toLocaleDateString() }}</td>
              <td class="px-4 py-3">{{ new Date(item.time).toLocaleTimeString() }}</td>
              <td class="px-4 py-3">{{ item.type }}</td>
              <td class="px-4 py-3">{{ item.status }}</td>
              <td class="px-4 py-3">
                <button
                  v-if="item.latitude && item.longitude"
                  @click="openMap(item.latitude, item.longitude)"
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                  Lihat di Map
                </button>
                <span v-else class="text-gray-300 italic">Tidak ada lokasi</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredData.length && !loading" class="text-center text-white/70 py-10">
          Tidak ada data lokasi absensi
        </div>
      </div>
    </main>
  </div>
</template>
