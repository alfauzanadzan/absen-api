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
  departmentName: '',
  position: '',
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
  form.departmentName = ''
  form.position = ''
  showModal.value = true
}

const openEdit = (acct: Account) => {
  // 🚫 Hanya KAPROG dan PEKERJA yang bisa diedit
  if (!canEditDelete(acct.role)) return
  
  editing.value = { ...acct }
  form.username = acct.username
  form.name = acct.name ?? ''
  form.role = acct.role
  form.departmentName = acct.departmentName ?? ''
  form.position = acct.position ?? ''
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
  if (form.role === 'KAPROG' && !form.departmentName) {
    alert('Departemen wajib dipilih untuk Kaprog!')
    return
  }

  if (form.role === 'PEKERJA') {
    if (!form.position) {
      alert('Position wajib diisi untuk Pekerja!')
      return
    }
    if (!form.departmentName) {
      alert('Departemen wajib dipilih untuk Pekerja!')
      return
    }
  }

  try {
    const payload: any = {
      username: form.username,
      name: form.name,
      role: form.role,
    }

    // Tambahkan departmentName untuk KAPROG dan PEKERJA
    if (form.role === 'KAPROG' || form.role === 'PEKERJA') {
      payload.departmentName = form.departmentName
    }

    // Tambahkan position untuk PEKERJA
    if (form.role === 'PEKERJA') {
      payload.position = form.position
    }

    if (editing.value) {
      await fetch(`http://localhost:3000/users/${editing.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...payload,
          email: `${form.username}@mail.com`,
          password: form.password,
        }),
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
  // 🚫 Hanya KAPROG dan PEKERJA yang bisa dihapus
  if (!canEditDelete(acct.role)) {
    alert('Akun dengan role ' + acct.role + ' tidak bisa dihapus!')
    return
  }
  
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

// Helper untuk cek apakah bisa diedit/dihapus
const canEditDelete = (role: Role) => {
  return role === 'KAPROG' || role === 'PEKERJA'
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- SIDEBAR -->
    <aside class="w-60 bg-white p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <!-- Logo -->
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/employees" class="p-2 rounded hover:bg-gray-400">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-400">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">
            Halo, <span class="font-medium text-gray-700">{{ user?.username ?? 'Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">{{ user?.role ?? 'ADMIN' }}</p>
        </div>
        <button
          @click="openAdd"
          class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          Tambah Akun
        </button>
      </div>

      <!-- Search -->
      <div class="mt-6 flex items-center gap-3">
        <input
          v-model="q"
          placeholder="Cari akun..."
          class="px-4 py-2 border rounded-md w-80 bg-white/90"
        />
        <span class="text-sm text-gray-500">Total: {{ accounts.length }}</span>
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
              <th class="text-left p-4">Position</th>
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
                  <!-- Tampilkan action HANYA untuk KAPROG dan PEKERJA -->
                  <template v-if="canEditDelete(acct.role)">
                    <button
                      @click="openEdit(acct)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      @click="remove(acct)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Hapus
                    </button>
                  </template>
                  <!-- Kosongkan untuk SUPERADMIN dan ADMIN -->
                  <template v-else>
                    <span class="text-xs text-gray-400 italic">-</span>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="p-8 text-center text-gray-500">
                Tidak ada akun ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Info -->
      <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-sm text-yellow-700">
          <strong>Info:</strong> Hanya akun dengan role <strong>KAPROG</strong> dan <strong>PEKERJA</strong> yang dapat diedit atau dihapus.
          Akun <strong>SUPERADMIN</strong> dan <strong>ADMIN</strong> dilindungi.
        </p>
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
                <option value="ADMIN">ADMIN</option>
                <option value="KAPROG">KAPROG</option>
                <option value="PEKERJA">PEKERJA</option>
              </select>
            </div>

            <!-- Departemen untuk KAPROG & PEKERJA -->
            <div v-if="form.role === 'KAPROG' || form.role === 'PEKERJA'">
              <label class="block text-sm text-gray-600 mb-1">Departemen</label>
              <select
                v-model="form.departmentName"
                class="w-full p-2 border rounded"
                required
              >
                <option disabled value="">-- Pilih Departemen --</option>
                <option value="IT">IT</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <!-- Position untuk PEKERJA -->
            <div v-if="form.role === 'PEKERJA'">
              <label class="block text-sm text-gray-600 mb-1">Position</label>
              <input
                v-model="form.position"
                class="w-full p-2 border rounded"
                required
              />
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