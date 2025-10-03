<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-2">KAPROG MARKETING Management</h1>
    <p class="text-gray-600 mb-6">Hanya mengelola department MARKETING</p>
    
    <!-- Info User Login -->
    <div class="bg-green-50 p-4 rounded mb-6" v-if="currentUser">
      <p>Anda login sebagai: <strong>{{ currentUser.username }}</strong></p>
      <p>Role: <strong>{{ currentUser.role }}</strong></p>
      <p>Department: <strong>{{ currentUser.departmentName }}</strong></p>
    </div>

    <!-- Search & Filter -->
    <div class="flex gap-4 mb-6">
      <input
        v-model="searchQuery"
        placeholder="Cari username atau nama..."
        class="px-4 py-2 border rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button 
        @click="showAddModal = true"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        + Tambah Pekerja MARKETING
      </button>
    </div>

    <!-- Table hanya show MARKETING -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left font-semibold">Username</th>
            <th class="p-3 text-left font-semibold">Nama Lengkap</th>
            <th class="p-3 text-left font-semibold">Email</th>
            <th class="p-3 text-left font-semibold">Role</th>
            <th class="p-3 text-left font-semibold">Department</th>
            <th class="p-3 text-left font-semibold">Position</th>
            <th class="p-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="user in filteredUsers" 
            :key="user.id" 
            class="border-t hover:bg-gray-50 transition-colors"
          >
            <td class="p-3">{{ user.username }}</td>
            <td class="p-3">{{ user.name || '-' }}</td>
            <td class="p-3">{{ user.email }}</td>
            <td class="p-3">
              <span :class="roleClass(user.role)" class="px-2 py-1 rounded-full text-xs">
                {{ user.role }}
              </span>
            </td>
            <td class="p-3">
              <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {{ user.departmentName || '-' }}
              </span>
            </td>
            <td class="p-3">{{ user.position || '-' }}</td>
            <td class="p-3">
              <!-- Hanya PEKERJA MARKETING yang bisa di-edit -->
              <div class="flex gap-2">
                <button 
                  v-if="user.role === 'PEKERJA'"
                  @click="openEditModal(user)"
                  class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button 
                  v-if="user.role === 'PEKERJA'"
                  @click="deleteUser(user)"
                  class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Hapus
                </button>
                <span v-if="user.role !== 'PEKERJA'" class="text-gray-400 text-sm italic">
                  Tidak tersedia
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="7" class="p-8 text-center text-gray-500">
              <div class="flex flex-col items-center justify-center">
                <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tidak ada data pengguna ditemukan
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tambah/Edit User -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">
            {{ showEditModal ? 'Edit Pekerja' : 'Tambah Pekerja MARKETING' }}
          </h2>
        </div>
        
        <form @submit.prevent="saveUser" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700">Username</label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                :disabled="showEditModal"
                placeholder="Masukkan username"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700">Nama Lengkap</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan nama lengkap"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan email"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2 text-gray-700">Position</label>
              <select 
                v-model="form.position" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                required
              >
                <option value="">Pilih Position</option>
                <option value="Sales Manager">Sales Manager</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Content Creator">Content Creator</option>
                <option value="Social Media Specialist">Social Media Specialist</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Market Researcher">Market Researcher</option>
                <option value="Brand Ambassador">Brand Ambassador</option>
              </select>
            </div>

            <div v-if="!showEditModal">
              <label class="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Masukkan password"
                minlength="6"
              >
              <p class="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-6 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              {{ showEditModal ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg flex items-center gap-3">
        <svg class="w-5 h-5 animate-spin text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Memproses...</span>
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
  role: 'KAPROG' | 'PEKERJA' | 'ADMIN' | 'SUPERADMIN'
  departmentName: string
  position?: string
}

// Data
const searchQuery = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref<User | null>(null)
const loading = ref(false)

// Current user (dari localStorage)
const currentUser = ref<User | null>(null)

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
    id: "1",
    username: "almia", 
    name: "almiakhalisa",
    email: "almia@mail.com",
    role: "KAPROG",
    departmentName: "Marketing",
    position: ""
  },
  {
    id: "2",
    username: "pekerja_marketing_1",
    name: "Alice Brown",
    email: "alice@mail.com",
    role: "PEKERJA",
    departmentName: "Marketing",
    position: "Sales Manager"
  },
  {
    id: "3", 
    username: "pekerja_marketing_2",
    name: "Charlie Wilson",
    email: "charlie@mail.com",
    role: "PEKERJA",
    departmentName: "Marketing",
    position: "Content Creator"
  },
  {
    id: "4",
    username: "pekerja_marketing_3",
    name: "Diana Lee",
    email: "diana@mail.com",
    role: "PEKERJA",
    departmentName: "Marketing",
    position: "Social Media Specialist"
  }
])

// Computed - Filter hanya users dengan department Marketing
const filteredUsers = computed(() => {
  let filtered = users.value.filter(user => 
    user.departmentName?.toLowerCase() === 'marketing'
  )

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.position?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
const roleClass = (role: string) => {
  switch(role) {
    case 'KAPROG': return 'bg-green-100 text-green-800'
    case 'PEKERJA': return 'bg-blue-100 text-blue-800'
    case 'ADMIN': return 'bg-purple-100 text-purple-800'
    case 'SUPERADMIN': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
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
  loading.value = true

  try {
    // Simulasi API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

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
      alert('✅ Data berhasil diupdate!')
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        username: form.username,
        name: form.name,
        email: form.email,
        role: 'PEKERJA',
        departmentName: 'Marketing',
        position: form.position
      }
      users.value.push(newUser)
      alert('✅ User berhasil ditambahkan!')
    }
    
    closeModal()
  } catch (error) {
    alert('❌ Gagal menyimpan data!')
    console.error('Save error:', error)
  } finally {
    loading.value = false
  }
}

const deleteUser = async (user: User) => {
  if (!confirm(`Yakin hapus user "${user.name}"?`)) return
  
  loading.value = true
  try {
    // Simulasi API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    users.value = users.value.filter(u => u.id !== user.id)
    alert('✅ User berhasil dihapus!')
  } catch (error) {
    alert('❌ Gagal menghapus user!')
    console.error('Delete error:', error)
  } finally {
    loading.value = false
  }
}

// Load current user dari localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      currentUser.value = JSON.parse(userData)
      console.log('👤 Current user:', currentUser.value)
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }
})
</script>

<style scoped>
/* Custom scrollbar for modal */
.modal-content {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f7fafc;
}

.modal-content::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}
</style>