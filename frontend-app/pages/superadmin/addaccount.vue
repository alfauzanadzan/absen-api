<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'ADMIN' | 'KAPROG' | 'PEKERJA'
type Department = { id: string; name: string }
type Account = {
  id: string
  username: string
  email: string
  role: Role
  name?: string
  departmentId?: string
  departmentName?: string
  position?: string
}

// ===== STATE =====
const accounts = ref<Account[]>([])
const departments = ref<Department[]>([])
const { user, loadUser } = useAuth()
const q = ref('')
const showModal = ref(false)
const editing = ref<Account | null>(null)

const form = reactive({
  username: '',
  name: '',
  role: 'ADMIN' as Role,
  password: '',
  confirmPassword: '',
  departmentName: '',
  position: '',
})

// ===== FETCH DATA =====
const fetchAccounts = async () => {
  try {
    const res = await fetch(`http://localhost:3000/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    accounts.value = await res.json()
  } catch (err) {
    console.error('❌ Gagal ambil users:', err)
  }
}

const fetchDepartments = async () => {
  try {
    const res = await fetch(`http://localhost:3000/departments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    departments.value = await res.json()
  } catch (err) {
    console.error('❌ Gagal ambil departemen:', err)
    // fallback dummy
    departments.value = [
      { id: '1', name: 'IT' },
      { id: '2', name: 'Marketing' },
    ]
  }
}

onMounted(async () => {
  await loadUser()
  await fetchAccounts()
  await fetchDepartments()
})

// ===== COMPUTED =====
const filtered = computed(() =>
  accounts.value.filter(a =>
    !q.value ||
    a.username.toLowerCase().includes(q.value.toLowerCase()) ||
    a.email.toLowerCase().includes(q.value.toLowerCase()) ||
    (a.name && a.name.toLowerCase().includes(q.value.toLowerCase()))
  )
)

// ===== MODAL =====
const openAdd = () => {
  editing.value = null
  Object.assign(form, {
    username: '',
    name: '',
    role: 'ADMIN',
    password: '',
    confirmPassword: '',
    departmentName: '',
    position: '',
  })
  showModal.value = true
}

const openEdit = (acct: Account) => {
  if (acct.role === 'ADMIN' && acct.username === 'superadmin') {
    alert('❌ Superadmin tidak bisa diedit!')
    return
  }
  editing.value = { ...acct }
  Object.assign(form, {
    username: acct.username,
    name: acct.name ?? '',
    role: acct.role,
    departmentName: acct.departmentName ?? '',
    position: acct.position ?? '',
    password: '',
    confirmPassword: '',
  })
  showModal.value = true
}

// ===== SAVE =====
const save = async () => {
  try {
    // Validasi dasar
    if (!editing.value && form.password !== form.confirmPassword) {
      alert('❌ Password dan Konfirmasi tidak sama!')
      return
    }
    if (!form.username.trim()) {
      alert('❌ Username tidak boleh kosong!')
      return
    }
    if (!form.name.trim()) {
      alert('❌ Nama lengkap tidak boleh kosong!')
      return
    }

    const payload: any = {
      username: form.username,
      name: form.name,
      role: form.role,
    }

    if (form.role === 'KAPROG' || form.role === 'PEKERJA') {
      const selectedDept = departments.value.find(d => d.name === form.departmentName)
      if (!selectedDept) {
        alert('❌ Departemen wajib dipilih!')
        return
      }
      payload.departmentId = selectedDept.id
      payload.departmentName = selectedDept.name
    }

    if (form.role === 'PEKERJA') {
      if (!form.position) {
        alert('❌ Position wajib diisi!')
        return
      }
      payload.position = form.position
    }

    const token = localStorage.getItem('token')
    const url = editing.value
      ? `http://localhost:3000/users/${editing.value.id}`
      : `http://localhost:3000/users`
    const method = editing.value ? 'PUT' : 'POST'

    const body = editing.value
      ? payload
      : {
          ...payload,
          email: `${form.username}@example.com`, // ✅ valid email selalu
          password: form.password,
        }

    console.log('📦 Payload dikirim:', body)

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Server error: ${res.status} - ${errText}`)
    }

    await fetchAccounts()
    showModal.value = false
    alert('✅ Akun berhasil disimpan!')
  } catch (err) {
    console.error('❌ Gagal simpan akun:', err)
    alert('❌ Gagal menyimpan akun, cek console!')
  }
}

// ===== DELETE =====
const remove = async (acct: Account) => {
  if (!confirm('Yakin hapus akun ini?')) return
  try {
    await fetch(`http://localhost:3000/users/${acct.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    await fetchAccounts()
    alert('✅ Akun berhasil dihapus!')
  } catch (err) {
    console.error('❌ Gagal hapus akun:', err)
    alert('❌ Gagal hapus akun!')
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- SIDEBAR -->
    <aside class="w-60 bg-white p-6 flex flex-col shadow">
      <div class="flex items-center justify-center h-20 mb-6 font-bold text-xl text-blue-700">
        SUPERADMIN
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/superadmin/super" class="p-2 rounded hover:bg-gray-100">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-100">Profile</a>
        <a
          href="/superadmin/addaccount"
          class="p-2 rounded bg-blue-100 text-blue-600 font-medium"
        >
          Add Account
        </a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- HEADER -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-800">
            Halo, <span class="font-medium text-gray-700">{{ user?.username ?? 'Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">
            {{ user?.role ?? 'ADMIN' }}
          </p>
        </div>

        <button
          @click="openAdd"
          class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          + Tambah Akun
        </button>
      </div>

      <!-- SEARCH -->
      <div class="mt-6 flex items-center gap-3">
        <input
          v-model="q"
          placeholder="Cari akun..."
          class="px-4 py-2 border rounded-md w-80 bg-white/90 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <span class="text-sm text-gray-500">Total: {{ accounts.length }}</span>
      </div>

      <!-- TABLE -->
      <div class="mt-6 bg-white rounded-md shadow overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-4 text-left">Username</th>
              <th class="p-4 text-left">Nama Lengkap</th>
              <th class="p-4 text-left">Email</th>
              <th class="p-4 text-left">Role</th>
              <th class="p-4 text-left">Departemen</th>
              <th class="p-4 text-left">Posisi</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="acct in filtered"
              :key="acct.id"
              class="border-t hover:bg-gray-50 transition"
            >
              <td class="p-4 font-medium text-gray-800">{{ acct.username }}</td>
              <td class="p-4">{{ acct.name ?? '-' }}</td>
              <td class="p-4 text-gray-500">{{ acct.email }}</td>
              <td class="p-4">{{ acct.role }}</td>
              <td class="p-4">{{ acct.departmentName ?? '-' }}</td>
              <td class="p-4">{{ acct.position ?? '-' }}</td>
              <td class="p-4 text-right">
                <div class="inline-flex gap-2">
                  <button
                    v-if="!(acct.role === 'ADMIN' && acct.username === 'superadmin')"
                    @click="openEdit(acct)"
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    v-if="!(acct.role === 'ADMIN' && acct.username === 'superadmin')"
                    @click="remove(acct)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="8" class="p-8 text-center text-gray-500">
                Tidak ada akun ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">
              {{ editing ? 'Edit Akun' : 'Tambah Akun' }}
            </h3>
            <button
              @click="showModal = false"
              class="text-gray-500 hover:text-gray-700 text-lg"
            >
              ✕
            </button>
          </div>

          <!-- FORM -->
          <form @submit.prevent="save" class="space-y-3">
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
                <option v-for="d in departments" :key="d.id" :value="d.name">
                  {{ d.name }}
                </option>
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
              <button type="button" @click="showModal = false" class="px-4 py-2 border rounded hover:bg-gray-100">
                Batal
              </button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {{ editing ? 'Update' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
