<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manajemen Akun</h1>

    <!-- 🔍 Search -->
    <input
      v-model="q"
      placeholder="Cari akun..."
      class="border p-2 mb-4 w-full rounded"
    />

    <!-- 📋 List akun -->
    <table class="w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="p-2 border">Username</th>
          <th class="p-2 border">Email</th>
          <th class="p-2 border">Role</th>
          <th class="p-2 border">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="acct in filtered" :key="acct.id">
          <td class="p-2 border">{{ acct.username }}</td>
          <td class="p-2 border">{{ acct.email }}</td>
          <td class="p-2 border">{{ acct.role }}</td>
          <td class="p-2 border">
            <button
              class="bg-red-500 text-white px-2 py-1 rounded"
              @click="remove(acct.id)"
            >
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ➕ Tombol tambah akun -->
    <button
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      @click="openAdd"
    >
      Tambah Akun
    </button>

    <!-- 🔹 Modal tambah akun -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
    >
      <div class="bg-white p-6 rounded w-96">
        <h2 class="text-lg font-bold mb-4">
          {{ editing ? 'Edit Akun' : 'Tambah Akun' }}
        </h2>

        <input
          v-model="form.username"
          placeholder="Username"
          class="border p-2 mb-2 w-full rounded"
        />
        <input
          type="password"
          v-model="form.password"
          placeholder="Password"
          class="border p-2 mb-2 w-full rounded"
        />
        <input
          type="password"
          v-model="form.confirmPassword"
          placeholder="Konfirmasi Password"
          class="border p-2 mb-4 w-full rounded"
        />

        <div class="flex justify-end gap-2">
          <button
            class="bg-gray-400 text-white px-4 py-2 rounded"
            @click="showModal = false"
          >
            Batal
          </button>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded"
            @click="save"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({ middleware: ['role'] })

type Role = 'ADMIN' | string
type Account = { id: string; username: string; email: string; role: Role }

const accounts = ref<Account[]>([])

const { user, loadUser } = useAuth()

// ✅ ambil data dari backend
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
})

const filtered = computed(() =>
  accounts.value.filter(a => {
    const matchQ =
      !q.value ||
      a.username.toLowerCase().includes(q.value.toLowerCase()) ||
      a.email.toLowerCase().includes(q.value.toLowerCase())
    const matchPos = !selectedPosition.value || a.role === selectedPosition.value
    return matchQ && matchPos
  })
)

const openAdd = () => {
  editing.value = null
  form.username = ''
  form.role = 'ADMIN'
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

const openEdit = (acct: Account) => {
  editing.value = { ...acct }
  form.username = acct.username
  form.role = acct.role
  form.password = ''
  form.confirmPassword = ''
  showModal.value = true
}

const save = async () => {
  try {
    if (editing.value) {
      // TODO: implement update user kalau mau
      showModal.value = false
    } else {
      await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: form.username,
          email: `${form.username}@mail.com`, // default email
          password: form.password,
          role: 'ADMIN',
        }),
      })
      await fetchAccounts() // refresh data setelah tambah
    }
    showModal.value = false
  } catch (err) {
    console.error('Gagal simpan akun:', err)
  }
}

const remove = async (id: string) => {
  if (!confirm('Yakin hapus akun ini?')) return
  try {
    await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    await fetchAccounts()
  } catch (err) {
    console.error('Gagal hapus akun:', err)
  }
}
</script>
