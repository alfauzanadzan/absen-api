<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500">
    <!-- Sidebar -->
    <aside
      class="sticky top-0 z-20 w-64 bg-white/30 backdrop-blur-md p-6 flex flex-col shadow-lg border-r border-white/30"
    >
      <div class="flex items-center justify-center h-20 mb-8">
        <h1 class="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">ADMIN</h1>
      </div>

      <nav class="flex flex-col space-y-3 text-white font-medium">
        <a href="/admin/admin" class="p-3 rounded-lg hover:bg-white/20 transition">🏠 Dashboard</a>
        <a href="/admin/daftar-department" class="p-3 rounded-lg hover:bg-white/20 transition">🏢 Daftar Department</a>
        <a href="/admin/profiladmin" class="p-3 rounded-lg hover:bg-white/20 transition">👤 Profile</a>
        <a href="/admin/addaccount" class="p-3 rounded-lg hover:bg-white/20 transition">➕ Add Account</a>
        <a href="/admin/attendance" class="p-3 rounded-lg hover:bg-white/20 transition">📝 Attendance</a>
        <a
          href="/admin/reports"
          class="p-3 rounded-lg bg-white/30 text-white shadow hover:bg-white/40 transition"
          >📊 Reports</a
        >
      </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto relative">
      <h1 class="text-3xl font-bold mb-8 text-white drop-shadow-md">REPORTS</h1>

      <!-- Filter -->
      <div class="flex items-center gap-4 mb-6">
        <select v-model="reportType" class="border px-3 py-2 rounded flex-1">
          <option value="daily">Daily Report</option>
          <option value="weekly">Weekly Report</option>
          <option value="monthly">Monthly Report</option>
          <option value="yesterday">Yesterday</option>
        </select>

        <div class="flex-1 text-right text-white">
          {{ displayDate }}
        </div>
      </div>

      <!-- Table -->
      <div
        class="mt-6 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl overflow-x-auto border border-white/30 transition hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
      >
        <table class="min-w-full text-gray-800">
          <thead class="bg-white/30 text-gray-800 font-semibold uppercase text-sm">
            <tr>
              <th class="text-left px-6 py-3 font-semibold">Departemen</th>
              <th class="text-center px-6 py-3 font-semibold">Total Kehadiran</th>
              <th class="text-right px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in reportRows"
              :key="idx"
              class="border-t border-white/40 hover:bg-white/30 transition duration-200"
            >
              <td class="px-6 py-4">{{ row.department }}</td>
              <td class="px-6 py-4 text-center">{{ row.count }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  @click="viewRow(row)"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="reportRows.length === 0">
              <td colspan="3" class="px-6 py-8 text-center text-gray-100 font-semibold">
                Tidak ada data laporan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-lg w-11/12 md:w-2/3 p-6 shadow-lg relative">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">
            Detail Departemen: {{ modalRow?.department }}
          </h3>
          <button class="text-gray-600 hover:text-black" @click="closeModal">✕</button>
        </div>

        <p class="text-sm text-gray-600 mb-4">Total: <strong>{{ modalList.length }}</strong></p>

        <div class="max-h-72 overflow-y-auto border rounded">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-4 py-2">No</th>
                <th class="text-left px-4 py-2">Nama</th>
                <th class="text-left px-4 py-2">Role</th>
                <th class="text-left px-4 py-2">Status</th>
                <th class="text-left px-4 py-2">Jam Masuk</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, i) in modalList"
                :key="i"
                class="border-t hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ i + 1 }}</td>
                <!-- 🔥 AUTO DETECT nama & role -->
                <td class="px-4 py-2">{{ getName(item) }}</td>
                <td class="px-4 py-2">{{ getRole(item) }}</td>
                <td class="px-4 py-2">{{ item.status }}</td>
                <td class="px-4 py-2">{{ formatTime(item.time) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end">
          <button class="px-4 py-2 rounded border" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";

const API_BASE = "http://localhost:3000";

const reportType = ref("daily");
const reportRows = ref<{ department: string; count: number; items: any[] }[]>([]);
const showModal = ref(false);
const modalRow = ref<any>(null);
const modalList = ref<any[]>([]);

function pad(n: number) {
  return n < 10 ? "0" + n : n;
}

const displayDate = computed(() => {
  const now = new Date();
  if (reportType.value === "daily") {
    return `Today: ${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
  } else if (reportType.value === "weekly") {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `Week: ${pad(start.getDate())}-${pad(start.getMonth() + 1)} to ${pad(
      end.getDate()
    )}-${pad(end.getMonth() + 1)}`;
  } else if (reportType.value === "monthly") {
    return `Month: ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  } else {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `Yesterday: ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  }
});

function formatTime(dateStr: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ✅ AUTO DETECT NAMA DAN ROLE
function getName(item: any) {
  return item.user?.name || item.name || item.userName || item.userId || "Tidak diketahui";
}

function getRole(item: any) {
  return item.user?.role || item.role || "Tidak diketahui";
}

async function loadReports() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token tidak ditemukan");
      return;
    }

    let url = `${API_BASE}/attendance/report?type=${reportType.value}`;
    if (reportType.value === "yesterday") url = `${API_BASE}/attendance/report/yesterday`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Gagal ambil laporan:", res.status);
      reportRows.value = [];
      return;
    }

    const data = await res.json();
    console.log("DATA DARI BACKEND:", data);

    if (data && data.result) {
      const grouped: Record<string, any[]> = {};

      for (const dateKey in data.result) {
        const departments = data.result[dateKey];
        for (const dept in departments) {
          if (!grouped[dept]) grouped[dept] = [];
          grouped[dept].push(...departments[dept]);
        }
      }

      reportRows.value = Object.entries(grouped).map(([department, items]) => ({
        department,
        count: items.length,
        items,
      }));
    } else {
      reportRows.value = [];
    }
  } catch (err) {
    console.error("Gagal ambil laporan:", err);
    reportRows.value = [];
  }
}

function viewRow(row: any) {
  modalRow.value = row;
  modalList.value = row.items;
  console.log("DETAIL ROW:", row.items);
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalRow.value = null;
  modalList.value = [];
}

onMounted(loadReports);
watch(reportType, loadReports);
</script>
