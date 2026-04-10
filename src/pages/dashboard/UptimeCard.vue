<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">系统运行时间</h3>
      <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <div class="text-3xl font-bold text-gray-900">
      {{ uptimeDisplay }}
    </div>
    <p class="mt-2 text-sm text-gray-500">持续运行</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SystemOverview } from '@/types'

const props = defineProps<{
  overview: SystemOverview
}>()

const uptimeDisplay = computed(() => {
  const seconds = props.overview.uptime
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days} 天 ${hours} 小时`
  } else if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`
  } else {
    return `${minutes} 分钟`
  }
})
</script>
