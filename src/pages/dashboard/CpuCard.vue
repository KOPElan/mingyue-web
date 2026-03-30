<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">CPU 使用率</h3>
      <svg class="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    </div>
    <div class="text-3xl font-bold text-gray-900">
      {{ overview.cpu.usage.toFixed(1) }}%
    </div>
    <p class="mt-2 text-sm text-gray-500">{{ overview.cpu.cores }} 核心</p>
    
    <!-- 进度条 -->
    <div class="mt-4 w-full bg-gray-200 rounded-full h-2">
      <div
        :class="[
          'h-2 rounded-full transition-all',
          overview.cpu.usage > 90 ? 'bg-red-500' : overview.cpu.usage > 70 ? 'bg-yellow-500' : 'bg-green-500'
        ]"
        :style="{ width: `${overview.cpu.usage}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SystemOverview } from '@/types'

defineProps<{
  overview: SystemOverview
}>()
</script>
