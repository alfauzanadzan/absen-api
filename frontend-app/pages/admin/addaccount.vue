<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside class="w-64 bg-white/20 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/daftar-department" class="p-3 rounded-lg hover:bg-white/20 transition">🏢 Daftar Department</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto text-gray-800">
      <div class="flex items-center justify-between">
        <div>
          
        </div>
        <button @click="openAdd" class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
          Tambah Akun
        </button>
      </div>

      <!-- Search -->
      <div class="mt-6 flex items-center gap-3">
        <input
          v-model="q"
          placeholder="Cari akun..."
          class="px-4 py-2 border-none rounded-lg w-80 bg-white/30 backdrop-blur-sm text-gray-800 shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <span class="text-sm text-gray-500">Total: {{ accounts.length }}</span>
      </div>

      <!-- Table -->
      <div class="mt-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto border border-white/30 transition hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
        <table class="min-w-full text-gray-800">
          <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
            <tr>
              <th class="text-left p-4">Username</th>
              <th class="text-left p-4">Nama Lengkap</th>
              <th class="text-left p-4">Email</th>
              <th class="text-left p-4">Role</th>
              <th class="text-left p-4">Departemen</th>
              <th class="text-left p-4">Position</th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acct in filtered" :key="acct.id" 
            class="border-t border-white/40 hover:bg-white/30 transition duration-200">
              <td class="p-4">{{ acct.username }}</td>
              <td class="p-4">{{ acct.name ?? '-' }}</td>
              <td class="p-4">{{ acct.email }}</td>
              <td class="p-4">
                <span :class="{
                  'text-red-600 font-semibold': acct.role === 'SUPERADMIN',
                  'text-blue-600 font-semibold': acct.role === 'ADMIN',
                  'text-green-600': acct.role === 'KAPROG',
                  'text-gray-600': acct.role === 'PEKERJA'
                }">
                  {{ acct.role }}
                </span>
              </td>
              <td class="p-4">{{ acct.departmentName ?? '-' }}</td>
              <td class="p-4">{{ acct.position ?? '-' }}</td>
              <td class="p-4 text-right">
                <div class="inline-flex gap-2">
                  <template v-if="canEditDelete(acct.role)">
                    <button @click="openEdit(acct)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Edit</button>
                    <button @click="remove(acct)" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Hapus</button>
                  </template>
                  <template v-else>
                    <span class="text-xs text-gray-400 italic">-</span>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="p-8 text-center text-gray-500">Tidak ada akun ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Info -->
      <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-sm text-yellow-700">
          <strong>Info:</strong> Hanya akun <strong>KAPROG</strong> dan <strong>PEKERJA</strong> yang bisa diedit atau dihapus.
        </p>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">{{ editing ? 'Edit Akun' : 'Tambah Akun' }}</h3>
            <button @click="showModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form @submit.prevent="save" class="mt-4 space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Username</label>
              <input v-model="form.username" class="w-full p-2 border rounded" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Nama Lengkap</label>
              <input v-model="form.name" class="w-full p-2 border rounded" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Role</label>
              <select v-model="form.role" class="w-full p-2 border rounded">
                <option value="ADMIN">ADMIN</option>
                <option value="KAPROG">KAPROG</option>
                <option value="PEKERJA">PEKERJA</option>
              </select>
            </div>

            <div v-if="form.role === 'KAPROG' || form.role === 'PEKERJA'">
              <label class="block text-sm text-gray-600 mb-1">Departemen</label>
              <select v-model="form.departmentName" class="w-full p-2 border rounded" required>
                <option disabled value="">-- Pilih Departemen --</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div v-if="form.role === 'PEKERJA'">
              <label class="block text-sm text-gray-600 mb-1">Position</label>
              <input v-model="form.position" class="w-full p-2 border rounded" required />
            </div>

            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Password</label>
              <input v-model="form.password" type="password" class="w-full p-2 border rounded" required />
            </div>
            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Konfirmasi Password</label>
              <input v-model="form.confirmPassword" type="password" class="w-full p-2 border rounded" required />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" @click="showModal = false" class="px-4 py-2 border rounded">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
                {{ editing ? 'Update' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'SUPERADMIN' | 'ADMIN' | 'KAPROG' | 'PEKERJA'
type Account = {
  id: string
  username: string
  email: string
  role: Role
  name?: string
  departmentName?: string
  position?: string
}

const accounts = ref<Account[]>([])
const { user, loadUser } = useAuth()

const fetchAccounts = async () => {
  try {
    const res = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    accounts.value = await res.json()
  } catch (err) {
    console.error('Gagal ambil users:', err)
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchAccounts()
})

const q = ref('')
const showModal = ref(false)
const editing = ref<Account | null>(null)
const form = reactive({
  username: '', name: '', role: 'KAPROG' as Role, password: '',
  confirmPassword: '', departmentName: '', position: '',
})

const filtered = computed(() =>
  accounts.value.filter(a =>
    !q.value ||
    a.username.toLowerCase().includes(q.value.toLowerCase()) ||
    a.email.toLowerCase().includes(q.value.toLowerCase()) ||
    (a.name && a.name.toLowerCase().includes(q.value.toLowerCase()))
  )
)

const openAdd = () => {
  editing.value = null
  Object.assign(form, { username: '', name: '', role: 'KAPROG', password: '', confirmPassword: '', departmentName: '', position: '' })
  showModal.value = true
}

const openEdit = (acct: Account) => {
  if (!canEditDelete(acct.role)) return
  editing.value = { ...acct }
  Object.assign(form, { username: acct.username, name: acct.name ?? '', role: acct.role, departmentName: acct.departmentName ?? '', position: acct.position ?? '', password: '', confirmPassword: '' })
  showModal.value = true
}

const save = async () => {
  if (!editing.value && form.password !== form.confirmPassword) return alert('Password tidak sama!')
  if (form.role === 'KAPROG' && !form.departmentName) return alert('Departemen wajib dipilih!')
  if (form.role === 'PEKERJA' && (!form.departmentName || !form.position)) return alert('Departemen & posisi wajib diisi!')

  try {
    const payload: any = { username: form.username, name: form.name, role: form.role }
    if (['KAPROG', 'PEKERJA'].includes(form.role)) payload.departmentName = form.departmentName
    if (form.role === 'PEKERJA') payload.position = form.position

    if (editing.value) {
      await fetch(`http://localhost:3000/users/${editing.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...payload, email: `${form.username}@mail.com`, password: form.password }),
      })
    }
    await fetchAccounts()
    showModal.value = false
    alert('✅ Akun berhasil disimpan!')
  } catch (err: any) {
    console.error('Gagal simpan akun:', err)
    alert('❌ Gagal menyimpan akun: ' + (err.message || 'Unknown error'))
  }
}

const remove = async (acct: Account) => {
  if (!canEditDelete(acct.role)) return alert(`Akun ${acct.role} tidak bisa dihapus!`)
  if (!confirm(`Yakin hapus akun ${acct.username}?`)) return
  try {
    await fetch(`http://localhost:3000/users/${acct.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    await fetchAccounts()
    alert('✅ Akun berhasil dihapus!')
  } catch (err) {
    console.error('Gagal hapus akun:', err)
    alert('❌ Gagal menghapus akun!')
  }
}

const canEditDelete = (role: Role) => role === 'KAPROG' || role === 'PEKERJA'
</script>
