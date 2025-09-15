<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'KAPROG' | 'PEGAWAI'
type Account = { id: number; name: string; username: string; position: string; role: Role; avatar?: string }

const accounts = ref<Account[]>([])

const { user, loadUser } = useAuth()
onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
  fetchAccounts()
})

// ✅ ambil akun dari backend
const fetchAccounts = async () => {
  try {
    const res = await fetch('http://localhost:3000/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    accounts.value = await res.json()
  } catch (err) {
    console.error('Gagal ambil users:', err)
  }
}

const q = ref('')
const selectedPosition = ref<string | null>(null)
const showModal = ref(false)
const editing = ref<Account | null>(null)

const form = reactive({
  name: '',
  username: '',
  position: '',
  role: 'PEGAWAI' as Role,
  password: '',
  confirmPassword: '',
  avatarPreview: ''
})

const filtered = computed(() =>
  accounts.value.filter(a => {
    const matchQ =
      !q.value ||
      a.name.toLowerCase().includes(q.value.toLowerCase()) ||
      a.position.toLowerCase().includes(q.value.toLowerCase())
    const matchPos = !selectedPosition.value || a.position === selectedPosition.value
    return matchQ && matchPos
  })
)

const openAdd = () => {
  editing.value = null
  form.name = ''
  form.username = ''
  form.position = ''
  form.role = 'PEGAWAI'
  form.password = ''
  form.confirmPassword = ''
  form.avatarPreview = ''
  showModal.value = true
}

const openEdit = (acct: Account) => {
  editing.value = { ...acct }
  form.name = acct.name
  form.username = acct.username
  form.position = acct.position
  form.role = acct.role
  form.avatarPreview = acct.avatar ?? ''
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

// ✅ Simpan akun (POST atau PUT)
const save = async () => {
  if (!editing.value) {
    if (form.password !== form.confirmPassword) {
      alert('Password tidak sama!')
      return
    }
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          position: form.position,
          role: form.role,
          password: form.password,
          avatar: form.avatarPreview,
        }),
      })
      if (!res.ok) throw new Error('Gagal tambah akun')
      await fetchAccounts()
      showModal.value = false
    } catch (err) {
      console.error(err)
      alert('Error tambah akun')
    }
  } else {
    try {
      const res = await fetch(`http://localhost:3000/users/${editing.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          position: form.position,
          role: form.role,
          avatar: form.avatarPreview,
        }),
      })
      if (!res.ok) throw new Error('Gagal update akun')
      await fetchAccounts()
      showModal.value = false
    } catch (err) {
      console.error(err)
      alert('Error update akun')
    }
  }
}

// ✅ Hapus akun
const remove = async (id: number) => {
  if (!confirm('Yakin hapus akun ini?')) return
  try {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (!res.ok) throw new Error('Gagal hapus akun')
    accounts.value = accounts.value.filter(a => a.id !== id)
  } catch (err) {
    console.error(err)
    alert('Error hapus akun')
  }
}

const setAvatarPreview = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  form.avatarPreview = v
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- SIDEBAR -->
    <aside class="w-60 bg-white shadow-md p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-200">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded bg-blue-100 text-blue-600 font-medium">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-200">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-200">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-200">Reports</a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">
            WELCOME, <span class="font-medium text-gray-700">{{ user?.username ?? 'Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">{{ user?.role ?? 'ADMIN' }}</p>
        </div>
        <div>
          <button
            @click="openAdd"
            class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          >
            Add Account
          </button>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <input
            v-model="q"
            placeholder="Search Nama"
            class="px-4 py-2 border rounded-md w-64 md:w-80 bg-white/90"
          />
          <select v-model="selectedPosition" class="px-4 py-2 border rounded-md bg-green-100">
            <option :value="null">Position</option>
            <option>KAPROG</option>
            <option>PEGAWAI</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">
          Total: <span class="font-semibold">{{ accounts.length }}</span>
        </div>
      </div>

      <!-- Table -->
      <div class="mt-6 bg-white rounded-md shadow overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4">Photo</th>
              <th class="text-left p-4">Nama</th>
              <th class="text-left p-4">Username</th>
              <th class="text-left p-4">Position</th>
              <th class="text-left p-4">Role</th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acct in filtered" :key="acct.id" class="border-t hover:bg-gray-50">
              <td class="p-4">
                <img :src="acct.avatar || 'https://i.pravatar.cc/80'" alt="" class="w-12 h-12 rounded-full object-cover border" />
              </td>
              <td class="p-4 font-medium text-gray-800">{{ acct.name }}</td>
              <td class="p-4 text-gray-600">{{ acct.username }}</td>
              <td class="p-4 text-gray-700">{{ acct.position }}</td>
              <td class="p-4 text-gray-500">{{ acct.role }}</td>
              <td class="p-4 text-right">
                <div class="inline-flex gap-2">
                  <button
                    @click="openEdit(acct)"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    @click="remove(acct.id)"
                    class="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-500">Tidak ada akun ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">{{ editing ? 'Edit Account' : 'Add Account' }}</h3>
            <button @click="showModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <form @submit.prevent="save" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Nama</label>
              <input v-model="form.name" class="w-full p-2 border rounded" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Username</label>
              <input v-model="form.username" class="w-full p-2 border rounded" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Position</label>
              <input v-model="form.position" class="w-full p-2 border rounded" required />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Role</label>
              <select v-model="form.role" class="w-full p-2 border rounded">
                <option value="KAPROG">KAPROG</option>
                <option value="PEGAWAI">PEGAWAI</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Avatar URL (opsional)</label>
              <input v-model="form.avatarPreview" @input="setAvatarPreview" class="w-full p-2 border rounded" placeholder="https://..." />
            </div>
            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Password</label>
              <input v-model="form.password" type="password" class="w-full p-2 border rounded" required />
            </div>
            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Confirm Password</label>
              <input v-model="form.confirmPassword" type="password" class="w-full p-2 border rounded" required />
            </div>
            <div class="md:col-span-2 flex justify-end gap-3 mt-2">
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

<style scoped>
input::placeholder {
  color: #9CA3AF;
}
</style>
