<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <aside class="w-60 bg-white p-6 flex flex-col border-r">
      <div class="flex items-center justify-center h-20 mb-6 font-bold text-xl">
        ADMIN
      </div>

      <nav class="flex flex-col space-y-2">
        <a href="/admin/admin" class="p-2 rounded hover:bg-gray-400">Dashboard</a>
        <a href="/admin/profiladmin" class="p-2 rounded hover:bg-gray-400">Profile</a>
        <a href="/admin/employees" class="p-2 rounded bg-blue-50 text-blue-600 font-medium">Employees</a>
        <a href="/admin/addaccount" class="p-2 rounded hover:bg-gray-400">Add Account</a>
        <a href="/admin/attendance" class="p-2 rounded hover:bg-gray-400">Attendance</a>
        <a href="/admin/schedule" class="p-2 rounded hover:bg-gray-400">Schedule</a>
        <a href="/admin/reports" class="p-2 rounded hover:bg-gray-400">Reports</a>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">EMPLOYEES</h1>

        <div class="flex items-center gap-4">
          <button
            class="bg-green-400 text-black px-4 py-2 rounded font-medium hover:bg-green-500 transition"
            @click="importPdf"
          >
            Import PDF
          </button>

          <button
            class="bg-blue-500 text-white px-4 py-2 rounded font-medium hover:bg-blue-600 transition"
            @click="openAdd"
          >
            Add Employee
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white border rounded shadow-sm">
        <table class="min-w-full">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="text-left px-6 py-4 font-semibold">Photo</th>
              <th class="text-left px-6 py-4 font-semibold">Nama</th>
              <th class="text-left px-6 py-4 font-semibold">Position</th>
              <th class="text-left px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employees" :key="emp.id" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4">
                <img
                  :src="emp.photo || placeholderImage"
                  alt="photo"
                  class="h-12 w-12 rounded-full object-cover"
                />
              </td>
              <td class="px-6 py-4 align-middle">{{ emp.name }}</td>
              <td class="px-6 py-4 align-middle">{{ emp.position }}</td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-3">
                  <button
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    @click="openEdit(emp)"
                  >
                    Edit
                  </button>
                  <button
                    class="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition"
                    @click="deleteEmployee(emp.id)"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="employees.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                Belum ada employee.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Add/Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg w-11/12 md:w-1/2 p-6 shadow-lg">
        <h3 class="text-lg font-semibold mb-4">
          {{ isEditing ? 'Edit' : 'Add' }} Employee
        </h3>

        <form @submit.prevent="saveEmployee">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Nama</label>
              <input
                v-model="employeeForm.name"
                required
                class="w-full border px-3 py-2 rounded"
                placeholder="Nama lengkap"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Position</label>
              <input
                v-model="employeeForm.position"
                required
                class="w-full border px-3 py-2 rounded"
                placeholder="Contoh: FrontEnd"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Foto</label>
              <input type="file" accept="image/*" @change="onFileChange" />
              <div v-if="employeeForm.photoPreview" class="mt-3">
                <img
                  :src="employeeForm.photoPreview"
                  class="h-20 w-20 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded border hover:bg-gray-100"
              @click="closeModal"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Gambar default
const placeholderImage = '/images/avatar-placeholder.png'

// Data awal kosong
const employees = ref([])

// State modal
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const employeeForm = reactive({
  name: '',
  position: '',
  photoFile: null,
  photoPreview: null,
  photo: null,
})

// Reset form
function resetForm() {
  employeeForm.name = ''
  employeeForm.position = ''
  employeeForm.photoFile = null
  employeeForm.photoPreview = null
  employeeForm.photo = null
  editingId.value = null
  isEditing.value = false
}

// Tambah
function openAdd() {
  resetForm()
  showModal.value = true
}

// Edit
function openEdit(emp) {
  resetForm()
  employeeForm.name = emp.name
  employeeForm.position = emp.position
  employeeForm.photo = emp.photo || null
  employeeForm.photoPreview = emp.photo || null
  editingId.value = emp.id
  isEditing.value = true
  showModal.value = true
}

// Tutup modal
function closeModal() {
  showModal.value = false
  setTimeout(() => resetForm(), 150)
}

// Upload foto
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  employeeForm.photoFile = file

  const reader = new FileReader()
  reader.onload = (ev) => {
    employeeForm.photoPreview = ev.target.result
  }
  reader.readAsDataURL(file)
}

// Simpan data
function saveEmployee() {
  const photoUrl = employeeForm.photoPreview || employeeForm.photo || placeholderImage

  if (isEditing.value && editingId.value !== null) {
    const idx = employees.value.findIndex((e) => e.id === editingId.value)
    if (idx !== -1) {
      employees.value[idx] = {
        ...employees.value[idx],
        name: employeeForm.name,
        position: employeeForm.position,
        photo: photoUrl,
      }
    }
  } else {
    const newId = Date.now()
    employees.value.push({
      id: newId,
      name: employeeForm.name,
      position: employeeForm.position,
      photo: photoUrl,
    })
  }

  closeModal()
}

// Hapus data
function deleteEmployee(id) {
  if (!confirm('Yakin ingin menghapus employee ini?')) return
  employees.value = employees.value.filter((e) => e.id !== id)
}

// Placeholder Import PDF
function importPdf() {
  alert('Fitur Import PDF belum diimplementasikan.')
}
</script>

<style scoped>
/* Tambahan styling jika dibutuhkan */
</style>
