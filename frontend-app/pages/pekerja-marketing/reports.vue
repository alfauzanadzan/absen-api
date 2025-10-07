<template>
  <div class="p-6">
    <!-- Filter -->
    <div class="flex items-center gap-4 mb-6">
      <select v-model="reportType" class="border px-3 py-2 flex-1 rounded">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <button
        @click="loadReports"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Load Reports
      </button>
    </div>

    <!-- Judul -->
    <h1 class="text-3xl font-bold mb-6">REPORTS</h1>

    <!-- Table -->
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2">Tanggal</th>
          <th class="border px-4 py-2">Nama</th>
          <th class="border px-4 py-2">Departemen</th>
          <th class="border px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(report, index) in reports" :key="index">
          <td class="border px-4 py-2">{{ report.date }}</td>
          <td class="border px-4 py-2">{{ report.name }}</td>
          <td class="border px-4 py-2">{{ report.department }}</td>
          <td class="border px-4 py-2">{{ report.status }}</td>
        </tr>
        <tr v-if="reports.length === 0">
          <td colspan="4" class="text-center py-4">No reports found</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

const reportType = ref("daily")
const reports = ref<any[]>([])

// Dummy data loader
const loadReports = () => {
  reports.value = [
    {
      date: "2025-10-03",
      name: "Budi",
      department: "IT",
      status: "PRESENT",
    },
    {
      date: "2025-10-03",
      name: "Ani",
      department: "Marketing",
      status: "COMPLETED",
    },
  ]
}
</script>
