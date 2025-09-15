<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'ADMIN' | string
type Account = {
  id: string
  username: string
  email: string
  role: Role
  avatar?: string
}

const accounts = ref<Account[]>([])
const { user, loadUser } = useAuth()

// Ambil semua akun
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
const selectedPosition = ref<string | null>(null)
const showModal = ref(false)
const editing = ref<Account | null>(null)

const form = reactive({
  username: '',
  role: 'ADMIN' as Role,
  password: '',
  confirmPassword: '',
  avatarPreview: '',
})

// Filter pencarian
const filtered = computed(() =>
  accounts.value.filter((a) => {
    const matchQ =
      !q.value ||
      a.username.toLowerCase().includes(q.value.toLowerCase()) ||
      a.email.toLowerCase().includes(q.value.toLowerCase())
    const matchPos =
      !selectedPosition.value || a.role === selectedPosition.value
    return matchQ && matchPos
  })
)

// Buka modal tambah
const openAdd = () => {
  editing.value = null
  Object.assign(form, {
    username: '',
    role: 'ADMIN',
    password: '',
    confirmPassword: '',
    avatarPreview: '',
  })
  showModal.value = true
}

// Buka modal edit
const openEdit = (acct: Account) => {
  editing.value = { ...acct }
  Object.assign(form, {
    username: acct.username,
    role: acct.role,
    password: '',
    confirmPassword: '',
    avatarPreview: acct.avatar || '',
  })
  showModal.value = true
}

// Simpan / update akun
const save = async () => {
  console.log('➡ Menyimpan akun:', { ...form, editing: editing.value }) // debug

  try {
    if (!editing.value) {
      if (form.password !== form.confirmPassword) {
        alert('Konfirmasi password tidak cocok.')
        return
      }
    }

    const payload = editing.value
      ? {
          username: form.username,
          role: form.role,
          avatar: form.avatarPreview || editing.value?.avatar,
        }
      : {
          username: form.username,
          email: `${form.username}@mail.com`,
          password: form.password,
          role: form.role,
          avatar:
            form.avatarPreview ||
            `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`,
        }

    const url = editing.value
      ? `http://localhost:3000/users/${editing.value.id}`
      : 'http://localhost:3000/users'
    const method = editing.value ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('❌ Error response:', errText)
      alert(`Gagal menyimpan: ${res.status} ${res.statusText}`)
      return
    }

    await fetchAccounts()
    showModal.value = false
  } catch (err) {
    console.error('❌ Gagal simpan akun:', err)
    alert('Gagal menyimpan akun. Periksa koneksi server atau API.')
  }
}

// Hapus akun
const remove = async (id: string) => {
  if (!confirm('Yakin hapus akun ini?')) return
  try {
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    await fetchAccounts()
  } catch (err) {
    console.error('Gagal hapus akun:', err)
  }
}

const setAvatarPreview = (e: Event) => {
  form.avatarPreview = (e.target as HTMLInputElement).value
}
</script>

<template>
  <!-- ==== TAMPILAN TIDAK DIUBAH ==== -->
  <div class="flex h-screen bg-white-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-white shadow-md p-6 flex flex-col">
      <div class="flex items-center justify-center h-20 mb-6">
        <img src="/images/logo.jpg" alt="Logo" class="h-12 w-12" />
      </div>
      <nav class="flex flex-col space-y-2">
        <a href="/superadmin/super" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/superadmin/addaccount" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Add Account</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10 max-w-6xl mx-auto">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">
            WELCOME,
            <span class="font-medium text-gray-700">{{ user?.username ?? 'Super Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">
            {{ user?.role ?? 'SUPER ADMIN' }}
          </p>
        </div>
        <button
          @click="openAdd"
          class="relative z-10 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          Tambah Akun
        </button>
      </div>

      <!-- Controls -->
      <div class="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <input
            v-model="q"
            placeholder="Cari akun..."
            class="px-4 py-2 border rounded-md w-64 md:w-80 bg-white"
          />
          <select v-model="selectedPosition" class="px-4 py-2 border rounded-md bg-green-100">
            <option :value="null">Role</option>
            <option>ADMIN</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">
          Total: <span class="font-semibold">{{ accounts.length }}</span>
        </div>
      </div>

      <div class="mt-4 border-t border-gray-300"></div>

      <!-- Table -->
      <div class="mt-6 bg-white rounded-md shadow overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-4">Avatar</th>
              <th class="text-left p-4">Username</th>
              <th class="text-left p-4">Email</th>
              <th class="text-left p-4">Role</th>
              <th class="text-right p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="acct in filtered"
              :key="acct.id"
              class="border-t hover:bg-gray-50 transition-colors"
            >
              <td class="p-4">
                <img
                  :src="acct.avatar || `https://i.pravatar.cc/80?u=${acct.username}`"
                  class="w-12 h-12 rounded-full border object-cover"
                />
              </td>
              <td class="p-4">{{ acct.username }}</td>
              <td class="p-4">{{ acct.email }}</td>
              <td class="p-4">{{ acct.role }}</td>
              <td class="p-4 text-right space-x-2">
                <button
                  @click="openEdit(acct)"
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  @click="remove(acct.id)"
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">
                Tidak ada akun ditemukan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">{{ editing ? 'Edit Akun' : 'Tambah Akun' }}</h3>
            <button @click="showModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form @submit.prevent="save" class="grid grid-cols-1 gap-4">
            <input v-model="form.username" placeholder="Username" class="p-2 border rounded" required />
            <input
              v-if="!editing"
              type="password"
              v-model="form.password"
              placeholder="Password"
              class="p-2 border rounded"
              required
            />
            <input
              v-if="!editing"
              type="password"
              v-model="form.confirmPassword"
              placeholder="Konfirmasi Password"
              class="p-2 border rounded"
              required
            />
            <div class="p-2 border rounded bg-gray-100 text-gray-700">
              {{ form.role }}
            </div>
            <input
              v-model="form.avatarPreview"
              @input="setAvatarPreview"
              placeholder="Avatar URL (opsional)"
              class="p-2 border rounded"
            />
            <div class="flex justify-end gap-2 mt-2">
              <button type="button" @click="showModal = false" class="px-4 py-2 border rounded">
                Batal
              </button>
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
