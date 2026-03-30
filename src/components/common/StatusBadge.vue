<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClass,
    ]"
  >
    <span class="w-2 h-2 rounded-full mr-1.5" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: 'online' | 'offline' | 'running' | 'stopped' | 'warning' | 'error' | 'success' | 'info'
  label?: string
}>()

const statusClass = computed(() => {
  switch (props.status) {
    case 'online':
    case 'running':
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'offline':
    case 'stopped':
      return 'bg-gray-100 text-gray-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'info':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const dotClass = computed(() => {
  switch (props.status) {
    case 'online':
    case 'running':
    case 'success':
      return 'bg-green-400'
    case 'offline':
    case 'stopped':
      return 'bg-gray-400'
    case 'warning':
      return 'bg-yellow-400'
    case 'error':
      return 'bg-red-400'
    case 'info':
      return 'bg-blue-400'
    default:
      return 'bg-gray-400'
  }
})

const label = computed(() => {
  if (props.label) return props.label
  
  const labelMap: Record<string, string> = {
    online: '在线',
    offline: '离线',
    running: '运行中',
    stopped: '已停止',
    warning: '警告',
    error: '错误',
    success: '成功',
    info: '信息',
  }
  
  return labelMap[props.status] || props.status
})
</script>
