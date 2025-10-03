<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-2">KAPROG IT Management</h1>
    <p class="text-gray-600 mb-6">Hanya mengelola department IT</p>
    
    <!-- Info User Login -->
    <div class="bg-blue-50 p-4 rounded mb-6">
      <p>Anda login sebagai: <strong>{{ currentUser.username }}</strong></p>
      <p>Role: <strong>{{ currentUser.role }}</strong></p>
      <p>Department: <strong>{{ currentUser.departmentName }}</strong></p>
    </div>

    <!-- Search & Filter -->
    <div class="flex gap-4 mb-6">
      <input
        v-model="searchQuery"
        placeholder="Cari username atau nama..."
        class="px-4 py-2 border rounded-md w-80"
      />
      <button 
        @click="showAddModal = true"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        + Tambah Pekerja IT
      </button>
    </div>

    <!-- Table hanya show IT -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Username</th>
            <th class="p-3 text-left">Nama Lengkap</th>
            <th class="p-3 text-left">Email</th>
            <th class="p-3 text-left">Role</th>
            <th class="p-3 text-left">Department</th>
            <th class="p-3 text-left">Position</th>
            <th class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="user in filteredUsers" 
            :key="user.id" 
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ user.username }}</td>
            <td class="p-3">{{ user.name || '-' }}</td>
            <td class="p-3">{{ user.email }}</td>
            <td class="p-3">
              <span :class="roleClass(user.role)">{{ user.role }}</span>
            </td>
            <td class="p-3">{{ user.departmentName || '-' }}</td>
            <td class="p-3">{{ user.position || '-' }}</td>
            <td class="p-3">
              <!-- Hanya PEKERJA IT yang bisa di-edit -->
              <div class="flex gap-2">
                <button 
                  v-if="user.role === 'PEKERJA'"
                  @click="openEditModal(user)"
                  class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Edit
                </button>
                <button 
                  v-if="user.role === 'PEKERJA'"
                  @click="deleteUser(user)"
                  class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Hapus
                </button>
                <span v-if="user.role !== 'PEKERJA'" class="text-gray-400 text-sm">-</span>
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="7" class="p-8 text-center text-gray-500">
              Tidak ada data pengguna
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tambah/Edit User -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <h2 class="text-xl font-bold mb-4">
          {{ showEditModal ? 'Edit Pekerja' : 'Tambah Pekerja IT' }}
        </h2>
        
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Username</label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-md"
                :disabled="showEditModal"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Position</label>
              <select v-model="form.position" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">Pilih Position</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Fullstack Developer">Fullstack Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            <div v-if="!showEditModal">
              <label class="block text-sm font-medium mb-1">Password</label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-3 py-2 border rounded-md"
              >
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {{ showEditModal ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

// Types
interface User {
  id: string
  username: string
  name: string
  email: string
  role: 'KAPROG' | 'PEKERJA'
  departmentName: string
  position?: string
}

// Data
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref<User | null>(null)

// Current user (dari localStorage)
const currentUser = ref({
  username: 'kaprog_it',
  role: 'KAPROG',
  departmentName: 'IT'
})

// Form data
const form = reactive({
  username: '',
  name: '',
  email: '',
  position: '',
  password: ''
})

// Data users - akan diambil dari API
const users = ref<User[]>([
  {
    id: "2", 
    username: "kaprog_it",
    name: "KAPROG IT",
    email: "kaprog_it@mail.com",
    role: "KAPROG",
    departmentName: "IT",
    position: ""
  },
  {
    id: "4",
    username: "pekerja_it_1",
    name: "John Doe",
    email: "john@mail.com",
    role: "PEKERJA",
    departmentName: "IT",
    position: "Frontend Developer"
  },
  {
    id: "6",
    username: "pekerja_it_2", 
    name: "Jane Smith",
    email: "jane@mail.com",
    role: "PEKERJA",
    departmentName: "IT",
    position: "Backend Developer"
  },
  {
    id: "8",
    username: "pekerja_it_3",
    name: "Bob Johnson", 
    email: "bob@mail.com",
    role: "PEKERJA",
    departmentName: "IT",
    position: "DevOps Engineer"
  }
])

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.position?.toLowerCase().includes(query)
  )
})

// Methods
const roleClass = (role: string) => {
  switch(role) {
    case 'KAPROG': return 'text-green-600 font-semibold'
    case 'PEKERJA': return 'text-gray-600'
    default: return 'text-gray-500'
  }
}

const openEditModal = (user: User) => {
  editingUser.value = user
  form.username = user.username
  form.name = user.name
  form.email = user.email
  form.position = user.position || ''
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingUser.value = null
  resetForm()
}

const resetForm = () => {
  form.username = ''
  form.name = ''
  form.email = ''
  form.position = ''
  form.password = ''
}

const saveUser = async () => {
  // Simpan ke API
  console.log('Saving user:', form)
  
  // Simulasi API call
  if (showEditModal.value && editingUser.value) {
    // Update existing user
    const index = users.value.findIndex(u => u.id === editingUser.value!.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        name: form.name,
        email: form.email,
        position: form.position
      }
    }
  } else {
    // Add new user
    const newUser: User = {
      id: Date.now().toString(),
      username: form.username,
      name: form.name,
      email: form.email,
      role: 'PEKERJA',
      departmentName: 'IT',
      position: form.position
    }
    users.value.push(newUser)
  }
  
  closeModal()
  alert(showEditModal.value ? 'Data berhasil diupdate!' : 'User berhasil ditambahkan!')
}

const deleteUser = async (user: User) => {
  if (!confirm(`Yakin hapus user ${user.name}?`)) return
  
  // Hapus dari API
  users.value = users.value.filter(u => u.id !== user.id)
  alert('User berhasil dihapus!')
}

// Load current user dari localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      const user = JSON.parse(userData)
      currentUser.value = {
        username: user.username,
        role: user.role,
        departmentName: user.departmentName
      }
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }
})
</script>