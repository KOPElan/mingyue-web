<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">仪表板</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonList :count="4" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        type="button"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        @click="loadData"
      >
        重试
      </button>
    </div>

    <!-- 数据展示 -->
    <div v-else-if="overview" class="space-y-6">
      <!-- 状态卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CpuCard :overview="overview" />
        <MemoryCard :overview="overview" />
        <UptimeCard :overview="overview" />
        <DiskUsageCard />
      </div>

      <!-- 详细信息 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 系统信息 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">系统信息</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-600">主机名</dt>
              <dd class="font-medium">{{ overview.hostname }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">CPU 核心</dt>
              <dd class="font-medium">{{ overview.cpu.cores }} 核</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">总内存</dt>
              <dd class="font-medium">{{ formatBytes(overview.memory.total) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">总交换空间</dt>
              <dd class="font-medium">{{ formatBytes(overview.swap.total) }}</dd>
            </div>
          </dl>
        </div>

        <!-- 负载信息 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-lg font-semibold mb-4">系统负载</h2>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-600">1 分钟</dt>
              <dd class="font-medium">{{ overview.load.load1.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">5 分钟</dt>
              <dd class="font-medium">{{ overview.load.load5.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">15 分钟</dt>
              <dd class="font-medium">{{ overview.load.load15.toFixed(2) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { usePolling } from '@/composables/usePolling'
import { getSystemOverview } from '@/api/system'
import CpuCard from './CpuCard.vue'
import MemoryCard from './MemoryCard.vue'
import UptimeCard from './UptimeCard.vue'
import DiskUsageCard from './DiskUsageCard.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import type { SystemOverview } from '@/types'
import { POLLING_INTERVAL } from '@/utils/constants'

const { apiClient } = useAgent()

const overview = ref<SystemOverview | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadData() {
  if (!apiClient.value) {
    error.value = '未配置 Agent'
    loading.value = false
    return
  }

  try {
    error.value = null
    overview.value = await getSystemOverview(apiClient.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

// 轮询
const { start, stop } = usePolling(loadData, {
  interval: POLLING_INTERVAL,
  immediate: true,
})

onMounted(() => {
  start()
})

onUnmounted(() => {
  stop()
})

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

