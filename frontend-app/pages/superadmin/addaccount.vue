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
