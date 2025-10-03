<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">User Management</h1>
    
    <!-- Tampilkan user yang login -->
    <div class="bg-blue-50 p-4 rounded mb-6">
      <p>Anda login sebagai: <strong>{{ currentUser.role }}</strong></p>
      <p v-if="currentUser.departmentName">Department: <strong>{{ currentUser.departmentName }}</strong></p>
    </div>

    <!-- Table Users -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">Username</th>
            <th class="p-3 text-left">Role</th>
            <th class="p-3 text-left">Department</th>
            <th class="p-3 text-left">Position</th>
            <th class="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t">
            <td class="p-3">{{ user.username }}</td>
            <td class="p-3">
              <span :class="roleClass(user.role)">{{ user.role }}</span>
            </td>
            <td class="p-3">{{ user.departmentName || '-' }}</td>
            <td class="p-3">{{ user.position || '-' }}</td>
            <td class="p-3">
              <!-- Actions akan kita isi nanti -->
              <span class="text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// Data dummy untuk testing
const currentUser = {
  id: "1",
  username: "superadmin",
  role: "SUPERADMIN" as const,
  departmentName: ""
}

const users = [
  {
    id: "1",
    username: "superadmin",
    role: "SUPERADMIN",
    departmentName: "",
    position: ""
  },
  {
    id: "2", 
    username: "kaprog_it",
    role: "KAPROG",
    departmentName: "IT",
    position: ""
  },
  {
    id: "3",
    username: "kaprog_marketing",
    role: "KAPROG", 
    departmentName: "MARKETING",
    position: ""
  },
  {
    id: "4",
    username: "pekerja_it",
    role: "PEKERJA",
    departmentName: "IT",
    position: "Developer"
  },
  {
    id: "5",
    username: "pekerja_marketing", 
    role: "PEKERJA",
    departmentName: "MARKETING",
    position: "Sales"
  }
]

// Helper untuk styling role
const roleClass = (role: string) => {
  switch(role) {
    case 'SUPERADMIN': return 'text-red-600 font-bold'
    case 'ADMIN': return 'text-blue-600 font-bold'
    case 'KAPROG': return 'text-green-600'
    case 'PEKERJA': return 'text-gray-600'
    default: return 'text-gray-500'
  }
}
</script>