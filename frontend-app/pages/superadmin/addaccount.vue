<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-56 bg-white p-6 flex flex-col border-r">
      <nav class="flex flex-col space-y-2 text-sm">
        <NuxtLink to="/superadmin/super" class="text-black p-1">Dashboard</NuxtLink>
        <NuxtLink to="/superadmin/profilsuper" class="text-black p-1">Profil</NuxtLink>
        <NuxtLink to="/superadmin/addaccount" class="text-blue-600 p-1">Add Account</NuxtLink>
      </nav>
    </aside>
    <!-- Main Content -->
    <main class="flex-1 p-10">
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold"><span class="font-bold">WELCOME,</span> Super Admin</h2>
          <div class="flex gap-2">
            <button @click="showForm = !showForm" class="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Add Account</button>
            <button class="bg-gray-400 text-black px-3 py-1 rounded font-semibold">Serch Nama</button>
            <button class="bg-green-500 text-white px-3 py-1 rounded font-semibold">Position</button>
          </div>
        </div>
        <hr class="mb-4" />
        <table class="w-full border-collapse text-sm mb-8">
          <thead>
            <tr class="border-b">
              <th class="py-2">Photo</th>
              <th>Nama</th>
              <th>Position</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in accounts" :key="user.id" class="border-b">
              <td class="py-2"><img :src="user.photo || '/images/default-user.png'" alt="Photo" class="h-8 w-8 rounded-full" /></td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.status || '-' }}</td>
              <td class="flex gap-2">
                <button class="bg-blue-500 text-white px-3 py-1 rounded font-semibold">Edit</button>
                <button @click="deleteAccount(user.id)" class="bg-red-500 text-white px-3 py-1 rounded font-semibold">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Form tambah akun -->
        <div v-if="showForm" class="w-full max-w-md mx-auto bg-white p-6 rounded shadow">
          <h3 class="text-xl font-bold mb-4 text-center">Tambah Akun Kaprog/Admin</h3>
          <form @submit.prevent="addAccount">
            <div class="mb-4">
              <label class="block mb-1 font-semibold">Username</label>
              <input v-model="newAccount.username" type="text" class="w-full border rounded px-3 py-2" required />
            </div>
            <div class="mb-4">
              <label class="block mb-1 font-semibold">Email</label>
              <input v-model="newAccount.email" type="email" class="w-full border rounded px-3 py-2" required />
            </div>
            <div class="mb-4">
              <label class="block mb-1 font-semibold">Password</label>
              <input v-model="newAccount.password" type="password" class="w-full border rounded px-3 py-2" required />
            </div>
            <div class="mb-6">
              <label class="block mb-1 font-semibold">Role</label>
              <select v-model="newAccount.role" class="w-full border rounded px-3 py-2">
                <option value="ADMIN">Admin</option>
                <option value="KAPROG">Kaprog</option>
              </select>
            </div>
            <button type="submit" :disabled="isLoading" class="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition">
              {{ isLoading ? 'Menambah...' : 'Tambah Akun' }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"

const accounts = ref<any[]>([])

const showForm = ref(false)

const newAccount = ref({
  username: "",
  email: "",
  password: "",
  role: "ADMIN",
})

const isLoading = ref(false)

const fetchAccounts = async () => {
  try {
    const res = await $fetch("/api/users")
    accounts.value = res
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchAccounts()
})

const addAccount = async () => {
  isLoading.value = true
  try {
    await $fetch("/api/users", {
      method: "POST",
      body: newAccount.value,
    })
    alert("Akun berhasil ditambahkan!")
    newAccount.value = { username: "", email: "", password: "", role: "ADMIN" }
    fetchAccounts()
  } catch (err) {
    console.error(err)
    alert("Gagal menambahkan akun!")
  }
  isLoading.value = false
}

const deleteAccount = async (id: number) => {
  if (confirm("Yakin hapus akun ini?")) {
    try {
      await $fetch(`/api/users/${id}`, { method: "DELETE" })
      fetchAccounts()
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus akun")
    }
  }
}
</script>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
definePageMeta({ middleware: ['role'] })

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'KAPROG' | 'PEGAWAI' | string
type Account = { id: number; name: string; position: string; role: Role; avatar?: string }

const accounts = ref<Account[]>([
  { id: 1, name: 'Admin HRD', position: 'ADMIN', role: 'ADMIN', avatar: 'https://i.pravatar.cc/80?img=12' },
])

const { user, loadUser } = useAuth()
onMounted(() => {
  if (typeof window !== 'undefined') loadUser()
})

const q = ref('')
const selectedPosition = ref<string | null>(null)
const showModal = ref(false)
const editing = ref<Account | null>(null)

const form = reactive({
  name: '',
  username: '',
  position: '',
  role: 'ADMIN' as Role,
  password: '',
  confirmPassword: '',
  avatarPreview: ''
})

const filtered = computed(() => {
  return accounts.value.filter(a => {
    const matchQ =
      !q.value ||
      a.name.toLowerCase().includes(q.value.toLowerCase()) ||
      a.position.toLowerCase().includes(q.value.toLowerCase())
    const matchPos = !selectedPosition.value || a.position === selectedPosition.value
    return matchQ && matchPos
  })
})

const openAdd = () => {
  editing.value = null
  form.name = ''
  form.username = ''
  form.position = ''
  form.role = 'ADMIN'
  form.password = ''
  form.confirmPassword = ''
  form.avatarPreview = ''
  showModal.value = true
}

const openEdit = (acct: Account) => {
  editing.value = { ...acct }
  form.name = acct.name
  form.username = acct.name.toLowerCase().replace(/\s+/g, '.')
  form.position = acct.position
  form.role = acct.role
  form.password = ''
  form.confirmPassword = ''
  form.avatarPreview = acct.avatar ?? ''
  showModal.value = true
}

const save = () => {
  if (editing.value) {
    const idx = accounts.value.findIndex(a => a.id === editing.value!.id)
    if (idx >= 0) {
      accounts.value[idx] = {
        ...accounts.value[idx],
        name: form.name,
        position: form.position,
        role: form.role,
        avatar: form.avatarPreview || accounts.value[idx].avatar
      }
    }
  } else {
    const id = Math.max(0, ...accounts.value.map(a => a.id)) + 1
    accounts.value.unshift({
      id,
      name: form.name || 'Unnamed',
      position: form.position || 'STAFF',
      role: form.role,
      avatar: form.avatarPreview || `https://i.pravatar.cc/80?img=${Math.floor(Math.random() * 70)}`
    })
  }
  showModal.value = false
}

const remove = (id: number) => {
  if (!confirm('Yakin hapus akun ini?')) return
  accounts.value = accounts.value.filter(a => a.id !== id)
}

const setAvatarPreview = (e: Event) => {
  const v = (e.target as HTMLInputElement).value
  form.avatarPreview = v
}
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
        <a href="/superadmin/super" class="p-2 rounded hover:bg-gray-200">Dashboard</a>
        <a href="/superadmin/profilsuper" class="p-2 rounded hover:bg-gray-200">Profile</a>
        <a href="/superadmin/addaccount" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Add Account</a>
      </nav>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold">
            WELCOME, <span class="font-medium text-gray-700">{{ user?.username ?? 'Super Admin' }}</span>
          </h1>
          <p class="text-sm text-gray-500 mt-1 uppercase tracking-wide">{{ user?.role ?? 'SUPER ADMIN' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="openAdd" class="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">Add Account</button>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <input v-model="q" placeholder="Search Nama" class="px-4 py-2 border rounded-md w-64 md:w-80 bg-white bg-opacity-90" />
          <select v-model="selectedPosition" class="px-4 py-2 border rounded-md bg-green-100">
            <option :value="null">Position</option>
            <option>ADMIN</option>
            <option>KAPROG</option>
            <option>PEGAWAI</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">Total: <span class="font-semibold">{{ accounts.length }}</span></div>
      </div>

      <div class="mt-4 border-t border-gray-300"></div>

      <!-- Table -->
      <div class="mt-6 bg-white rounded-md shadow overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-white">
            <tr>
              <th class="text-left p-4">Photo</th>
              <th class="text-left p-4">Nama</th>
              <th class="text-left p-4">Position</th>
              <th class="text-left p-4">Status</th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acct in filtered" :key="acct.id" class="border-t hover:bg-gray-50">
              <td class="p-4"><img :src="acct.avatar" alt="" class="w-12 h-12 rounded-full object-cover border" /></td>
              <td class="p-4">
                <div class="font-medium text-gray-800">{{ acct.name }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ acct.role }}</div>
              </td>
              <td class="p-4 text-gray-700">{{ acct.position }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">Active</span>
              </td>
              <td class="p-4 text-right">
                <div class="inline-flex gap-2">
                  <button @click="openEdit(acct)" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                  <button @click="remove(acct.id)" class="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="p-8 text-center text-gray-500">Tidak ada akun ditemukan.</td>
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
              <input v-model="form.username" class="w-full p-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Position</label>
              <input v-model="form.position" class="w-full p-2 border rounded" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Role</label>
              <select v-model="form.role" class="w-full p-2 border rounded">
                <option value="ADMIN">ADMIN</option>
                <option value="KAPROG">KAPROG</option>
                <option value="PEGAWAI">PEGAWAI</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Avatar URL (opsional)</label>
              <input v-model="form.avatarPreview" @input="setAvatarPreview" class="w-full p-2 border rounded" placeholder="https://..." />
            </div>

            <div class="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" @click="showModal = false" class="px-4 py-2 border rounded">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">{{ editing ? 'Update' : 'Simpan' }}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
input::placeholder { color: #9CA3AF; }
</style>
