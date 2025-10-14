<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <aside
      class="w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30">
      <div class="flex items-center justify-center h-20 mb-8">
        <h1
          class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide text-center"
        >
          KAPROG MARKETING
        </h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/kaprog-marketing/kaprogmarketing" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/kaprog-marketing/profilkaprog" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/kaprog-marketing/attendance" class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition">📝 Attendance</a>
        <a href="/kaprog-marketing/reports" class="p-3 rounded-lg hover:bg-white/20 transition">📊 Reports</a>
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">ATTENDANCE</h1>
          <div class="text-sm text-gray-500 mt-1">{{ displayDate }}</div>
        </div>

        <button
          @click="markAllPresent"
          class="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition"
        >
          Mark Attendance
        </button>
      </div>

      <!-- Table -->
      <div
        class="mt-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto border border-white/30 transition hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
      >
        <table class="min-w-full text-gray-800">
          <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Nama</th>
              <th class="text-left px-6 py-3 font-semibold">Position</th>
              <th class="text-left px-6 py-3 font-semibold">Department</th>
              <th class="text-left px-6 py-3 font-semibold">Tanggal</th>
              <th class="text-left px-6 py-3 font-semibold">Jam Masuk</th>
              <th class="text-left px-6 py-3 font-semibold">Status</th>
              <th class="text-left px-6 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="rec in attendances"
              :key="rec.id"
              class="border-t border-white/40 hover:bg-white/30 transition duration-200"
            >
              <td class="px-6 py-4">{{ rec.user?.name || '-' }}</td>
              <td class="px-6 py-4">{{ rec.user?.role || '-' }}</td>
              <td class="px-6 py-4">{{ rec.departmentName || '-' }}</td>
              <td class="px-6 py-4">{{ formatDate(rec.date) }}</td>
              <td class="px-6 py-4">{{ formatTime(rec.timeIn) }}</td>
              <td class="px-6 py-4">
                <span
                  :class="{
                    'text-green-600 font-semibold': rec.status === 'PRESENT',
                    'text-yellow-600 font-semibold': rec.status === 'LATE',
                    'text-gray-500 font-semibold': rec.status === 'COMPLETED'
                  }"
                >
                  {{ rec.status || '-' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  @click="openEdit(rec)"
                >
                  Edit
                </button>
              </td>
            </tr>

            <!-- Kalau belum ada data -->
            <tr v-if="attendances.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                Belum ada data kehadiran pekerja MARKETING.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Edit -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white rounded-lg w-11/12 md:w-1/3 p-6">
        <h3 class="text-lg font-semibold mb-4">Edit Attendance</h3>
        <form @submit.prevent="saveEdit">
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Nama</label>
            <input
              readonly
              :value="editingRecord?.user?.name"
              class="w-full border px-3 py-2 rounded bg-gray-50"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Jam Masuk</label>
            <input
              v-model="editingRecord.timeIn"
              required
              class="w-full border px-3 py-2 rounded"
              type="time"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium mb-1">Status</label>
            <select
              v-model="editingRecord.status"
              class="w-full border px-3 py-2 rounded"
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div class="flex justify-end gap-3 mt-4">
            <button
              type="button"
              class="px-4 py-2 rounded border hover:bg-gray-50"
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

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRuntimeConfig } from "#imports";
import { useAuth } from "@/composables/useAuth";

const config = useRuntimeConfig();
const apiBase = config.public?.apiBase ?? "http://localhost:3000";
const { user, loadUser } = useAuth();

const attendances = ref<any[]>([]);
const showModal = ref(false);
const editingRecord = ref<any>(null);

// format tanggal hari ini
const today = new Date();
const pad = (n: number) => (n < 10 ? "0" + n : n);
const displayDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return "-";
  const d = new Date(timeStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ambil data dari backend
const fetchAttendances = async () => {
  try {
    const token = getToken();
    const res = await fetch(`${apiBase}/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const deptName = user.value?.departmentName ?? "";
    attendances.value = (data || [])
      .filter((a: any) => a.departmentName === deptName && a.role === "PEKERJA")
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("fetchAttendances error:", err);
  }
};

function markAllPresent() {
  alert("✅ Mark semua hadir untuk departemen IT. (Coming soon...)");
}

function openEdit(rec: any) {
  editingRecord.value = { ...rec };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingRecord.value = null;
}

async function saveEdit() {
  if (!editingRecord.value) return;
  const idx = attendances.value.findIndex(r => r.id === editingRecord.value.id);
  if (idx !== -1) attendances.value[idx] = { ...editingRecord.value };
  closeModal();
}

onMounted(async () => {
  await loadUser();
  await fetchAttendances();
});
</script>
