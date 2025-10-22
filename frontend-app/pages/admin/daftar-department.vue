<script setup lang="ts">
definePageMeta({
  middleware: ["role"],
})

import { ref, onMounted } from "vue"

const config = useRuntimeConfig()

// Data daftar department
const departments = ref<any[]>([])

// State untuk editing
const editingId = ref<number | null>(null)
const editStartTime = ref("")
const editEndTime = ref("")

// Fungsi helper: format Date/Time ke "HH:mm" atau kosong jika null
const formatTime = (time: string | null) => {
  if (!time) return ""
  const d = new Date(time)
  const h = d.getHours().toString().padStart(2, "0")
  const m = d.getMinutes().toString().padStart(2, "0")
  return `${h}:${m}`
}

// Ambil data department dari API
const loadDepartments = async () => {
  try {
    const data: any[] = await $fetch(`${config.public.apiBase}/departments`)
    // Convert startTime/endTime ke "HH:mm" jika ada
    departments.value = data.map((d) => ({
      ...d,
      startTime: formatTime(d.startTime),
      endTime: formatTime(d.endTime),
    }))
  } catch (err) {
    console.error("Gagal memuat data department:", err)
  }
}

// Aktifkan mode edit
const startEdit = (dept: any) => {
  editingId.value = dept.id
  editStartTime.value = dept.startTime || ""
  editEndTime.value = dept.endTime || ""
}

// Simpan perubahan jam masuk & jam pulang
const saveEdit = async (deptId: number) => {
  try {
    await $fetch(`${config.public.apiBase}/departments/${deptId}`, {
      method: "PATCH",
      body: {
        startTime: editStartTime.value || null,
        endTime: editEndTime.value || null,
      },
    })
    const dept = departments.value.find((d) => d.id === deptId)
    if (dept) {
      dept.startTime = editStartTime.value
      dept.endTime = editEndTime.value
    }
    editingId.value = null
    alert("Jam masuk & pulang berhasil diperbarui!")
  } catch (err) {
    console.error("Gagal update:", err)
    alert("Gagal memperbarui jam!")
  }
}

// Batalkan edit
const cancelEdit = () => {
  editingId.value = null
}

onMounted(() => {
  loadDepartments()
})
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500 overflow-y-auto">
    <!-- Sidebar -->
    <aside class="w-60 h-full p-6 flex flex-col justify-start bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
      <h1 class="text-lg font-bold text-white mb-6 text-center">Admin Panel</h1>
      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/daftar-department" class="p-3 rounded-lg bg-white/30 shadow hover:bg-white/40 transition">🏢 Daftar Department</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a href="/admin/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Konten Utama -->
    <main class="flex-1 flex flex-col items-center p-8 space-y-10">
      <section class="bg-white/30 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/40 max-w-4xl w-full">
        <h3 class="text-2xl font-bold text-white mb-4 text-center">Daftar Department</h3>

        <table class="w-full text-sm text-white border-collapse">
          <thead>
            <tr class="border-b border-white/40 text-center">
              <th class="py-2">Nama</th>
              <th class="py-2">Kode</th>
              <th class="py-2">Jam Masuk</th>
              <th class="py-2">Jam Pulang</th>
              <th class="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in departments" :key="dept.id" class="text-center border-b border-white/20">
              <td class="py-2">{{ dept.name }}</td>
              <td class="py-2">{{ dept.code }}</td>

              <!-- Edit mode -->
              <template v-if="editingId === dept.id">
                <td class="py-2">
                  <input v-model="editStartTime" type="time" class="p-1 rounded border border-gray-300 text-black"/>
                </td>
                <td class="py-2">
                  <input v-model="editEndTime" type="time" class="p-1 rounded border border-gray-300 text-black"/>
                </td>
                <td class="py-2 flex justify-center gap-2">
                  <button @click="saveEdit(dept.id)" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">Simpan</button>
                  <button @click="cancelEdit" class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition">Batal</button>
                </td>
              </template>

              <!-- Normal mode -->
              <template v-else>
                <td class="py-2">{{ dept.startTime || "-" }}</td>
                <td class="py-2">{{ dept.endTime || "-" }}</td>
                <td class="py-2">
                  <button @click="startEdit(dept)" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Edit</button>
                </td>
              </template>
            </tr>

            <tr v-if="departments.length === 0">
              <td colspan="5" class="py-4 text-center text-white/70">Belum ada department</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>
