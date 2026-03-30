<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">内存使用</h3>
      <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    </div>
    <div class="text-3xl font-bold text-gray-900">
      {{ overview.memory.usagePercent.toFixed(1) }}%
    </div>
    <p class="mt-2 text-sm text-gray-500">
      {{ formatBytes(overview.memory.used) }} / {{ formatBytes(overview.memory.total) }}
    </p>
    
    <!-- 进度条 -->
    <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
      <div
        :class="[
          'h-2 rounded-full transition-all',
          overview.memory.usagePercent > 90 ? 'bg-red-500' : overview.memory.usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
        ]"
        :style="{ width: `${overview.memory.usagePercent}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemOverview } from '@/types'

defineProps<{
  overview: SystemOverview
}>()

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
</script>
