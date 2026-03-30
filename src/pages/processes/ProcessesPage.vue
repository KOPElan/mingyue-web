<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">进程管理</h1>
      <button
        type="button"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        @click="loadProcesses"
        :disabled="loading"
      >
        刷新
      </button>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- 搜索过滤 -->
      <div class="p-4 border-b">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索进程名称、用户或命令行..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="p-6">
        <SkeletonList :count="10" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="p-6 bg-red-50">
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- 进程列表 -->
      <div v-else-if="filteredProcesses.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPU %</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">内存 %</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="process in filteredProcesses" :key="process.pid" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ process.pid }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ process.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ process.user }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <StatusBadge :status="getProcessStatus(process.state)" :label="getProcessStateLabel(process.state)" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ process.cpuPercent.toFixed(1) }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ process.memPercent.toFixed(1) }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  v-if="canWrite"
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  @click="handleKillProcess(process.pid, process.name)"
                >
                  终止
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <EmptyState v-else title="暂无进程" description="未找到匹配的进程" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { useRole } from '@/composables/useRole'
import { useConfirm } from '@/composables/useConfirm'
import { useUiStore } from '@/stores/ui'
import { usePolling } from '@/composables/usePolling'
import { getProcesses, killProcess } from '@/api/processes'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { Process } from '@/types'
import { POLLING_INTERVAL, PROCESS_STATE_MAP } from '@/utils/constants'

const { apiClient } = useAgent()
const { canWrite } = useRole()
const { confirm } = useConfirm()
const uiStore = useUiStore()

const processes = ref<Process[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

const filteredProcesses = computed(() => {
  if (!searchQuery.value) return processes.value

  const query = searchQuery.value.toLowerCase()
  return processes.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.user.toLowerCase().includes(query) ||
      p.cmdline.toLowerCase().includes(query)
  )
})

async function loadProcesses() {
  if (!apiClient.value) return

  try {
    error.value = null
    const result = await getProcesses(apiClient.value)
    processes.value = result.processes
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function handleKillProcess(pid: number, name: string) {
  const confirmed = await confirm({
    title: '终止进程',
    message: `确定要终止进程 "${name}" (PID: ${pid}) 吗？`,
    confirmText: '终止',
    cancelText: '取消',
    type: 'danger',
  })

  if (!confirmed || !apiClient.value) return

  try {
    await killProcess(apiClient.value, pid)
    uiStore.success('进程已终止')
    loadProcesses()
  } catch (err) {
    uiStore.error(err instanceof Error ? err.message : '终止失败')
  }
}

function getProcessStatus(state: string): 'running' | 'stopped' | 'warning' {
  if (state === 'R') return 'running'
  if (state === 'Z') return 'warning'
  return 'stopped'
}

function getProcessStateLabel(state: string): string {
  return PROCESS_STATE_MAP[state] || state
}

const { start, stop } = usePolling(loadProcesses, {
  interval: POLLING_INTERVAL,
  immediate: true,
})

onMounted(() => {
  start()
})

onUnmounted(() => {
  stop()
})
</script>

