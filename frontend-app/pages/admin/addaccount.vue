<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'SUPERADMIN' | 'ADMIN' | 'KAPROG' | 'PEKERJA'
type Department = 'IT' | 'MARKETING' | null
type Account = {
  id: string
  username: string
  email: string
  role: Role
  name?: string
  department?: Department
}

const accounts = ref<Account[]>([])
const { user, loadUser } = useAuth()

// 🔹 ambil data dari backend
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
  username: '',
  name: '',
  role: 'KAPROG' as Role,
  password: '',
  confirmPassword: '',
  department: null as Department,
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
  form.username = ''
  form.name = ''
  form.role = 'KAPROG'
  form.password = ''
  form.confirmPassword = ''
  form.department = null
  showModal.value = true
}

const openEdit = (acct: Account) => {
  if (acct.role === 'SUPERADMIN') return // 🚫 Superadmin tidak bisa diedit
  editing.value = { ...acct }
  form.username = acct.username
  form.name = acct.name ?? ''
  form.role = acct.role
  form.department = acct.department ?? null
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

const save = async () => {
  // validasi password saat tambah akun
  if (!editing.value) {
    if (form.password !== form.confirmPassword) {
      alert('Password tidak sama!')
      return
    }
  }

  // validasi departemen wajib untuk kaprog & pekerja
  if ((form.role === 'KAPROG' || form.role === 'PEKERJA') && !form.department) {
    alert('Departemen wajib dipilih!')
    return
  }

  try {
    if (editing.value) {
      await fetch(`http://localhost:3000/users/${editing.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: form.username,
          name: form.name,
          role: form.role,
          department: form.department,
        }),
      })
    } else {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: form.username,
          name: form.name,
          email: `${form.username}@mail.com`,
          password: form.password,
          role: form.role,
          department: form.department,
        }),
      })
    }
    await fetchAccounts()
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan akun:', err)
  }
}

const remove = async (acct: Account) => {
  if (acct.role === 'SUPERADMIN') {
    alert('Superadmin tidak bisa dihapus!')
    return
  }
  if (!confirm(`Yakin hapus akun ${acct.username}?`)) return
  try {
    await fetch(`http://localhost:3000/users/${acct.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    await fetchAccounts()
  } catch (err) {
    console.error('Gagal hapus akun:', err)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Manajemen Akun</h1>
        <button
          @click="openAdd"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Tambah Akun
        </button>
      </div>

      <!-- Search -->
      <div class="mt-4">
        <input
          v-model="q"
          type="text"
          placeholder="Cari akun..."
          class="p-2 border rounded w-full max-w-xs"
        />
      </div>

      <!-- Table -->
      <div class="mt-6 bg-white rounded-md shadow overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-4">Username</th>
              <th class="text-left p-4">Nama Lengkap</th>
              <th class="text-left p-4">Email</th>
              <th class="text-left p-4">Role</th>
              <th class="text-left p-4">Departemen</th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="acct in filtered"
              :key="acct.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-4">{{ acct.username }}</td>
              <td class="p-4">{{ acct.name ?? '-' }}</td>
              <td class="p-4">{{ acct.email }}</td>
              <td class="p-4">{{ acct.role }}</td>
              <td class="p-4">{{ acct.department ?? '-' }}</td>
              <td class="p-4 text-right">
                <div class="inline-flex gap-2">
                  <!-- Tombol edit muncul kalau bukan SUPERADMIN -->
                  <button
                    v-if="acct.role !== 'SUPERADMIN'"
                    @click="openEdit(acct)"
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <!-- Tombol hapus muncul kalau bukan SUPERADMIN -->
                  <button
                    v-if="acct.role !== 'SUPERADMIN'"
                    @click="remove(acct)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="6" class="p-8 text-center text-gray-500">
                Tidak ada akun ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <!-- Header Modal -->
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">
              {{ editing ? 'Edit Akun' : 'Tambah Akun' }}
            </h3>
            <button
              @click="showModal = false"
              class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="save" class="mt-4 space-y-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Username</label>
              <input
                v-model="form.username"
                class="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Nama Lengkap</label>
              <input
                v-model="form.name"
                class="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Role</label>
              <select v-model="form.role" class="w-full p-2 border rounded">
                <option value="KAPROG">KAPROG</option>
                <option value="PEKERJA">PEKERJA</option>
              </select>
            </div>

            <!-- Departemen wajib untuk KAPROG & PEKERJA -->
            <div v-if="form.role === 'KAPROG' || form.role === 'PEKERJA'">
              <label class="block text-sm text-gray-600 mb-1">Departemen</label>
              <select
                v-model="form.department"
                class="w-full p-2 border rounded"
                required
              >
                <option disabled value="">-- Pilih Departemen --</option>
                <option value="IT">IT</option>
                <option value="MARKETING">Marketing</option>
              </select>
            </div>

            <!-- Password hanya saat tambah akun -->
            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full p-2 border rounded"
                required
              />
            </div>
            <div v-if="!editing">
              <label class="block text-sm text-gray-600 mb-1">Konfirmasi Password</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                class="w-full p-2 border rounded"
                required
              />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {{ editing ? 'Update' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
