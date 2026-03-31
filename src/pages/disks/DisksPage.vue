<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">磁盘管理</h1>
      <button
        type="button"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        @click="refreshAll"
        :disabled="loading"
      >
        刷新
      </button>
    </div>

    <!-- 标签页 -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- 块设备标签页 -->
    <div v-if="activeTab === 'devices'">
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="5" />
      </div>
      <div v-else-if="devicesError" class="bg-red-50 rounded-lg p-4">
        <p class="text-red-800">{{ devicesError }}</p>
      </div>
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="devices.length === 0" class="p-8">
          <EmptyState title="暂无磁盘设备" description="" />
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备名</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">路径</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">大小</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">型号</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="device in devices" :key="device.name">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">{{ device.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">{{ device.path }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatBytes(device.size) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ device.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ device.model || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  type="button"
                  class="text-indigo-600 hover:text-indigo-800 mr-3"
                  @click="showSmartHealth(device.name)"
                >
                  SMART 健康
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 挂载点标签页 -->
    <div v-if="activeTab === 'mounts'">
      <div class="flex justify-end mb-4">
        <button
          v-if="canWrite"
          type="button"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          @click="showMountForm = true"
        >
          新建挂载
        </button>
      </div>
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="5" />
      </div>
      <div v-else-if="mountsError" class="bg-red-50 rounded-lg p-4">
        <p class="text-red-800">{{ mountsError }}</p>
      </div>
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div v-if="mounts.length === 0" class="p-8">
          <EmptyState title="暂无挂载点" description="" />
        </div>
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">挂载路径</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">文件系统</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用率</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="mount in mounts" :key="mount.mountpoint">
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{{ mount.device }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{{ mount.mountpoint }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ mount.fstype }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      :class="['h-2 rounded-full', mount.usagePercent > 90 ? 'bg-red-500' : mount.usagePercent > 70 ? 'bg-yellow-500' : 'bg-green-500']"
                      :style="{ width: `${Math.min(mount.usagePercent, 100)}%` }"
                    ></div>
                  </div>
                  <span>{{ mount.usagePercent.toFixed(1) }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  v-if="canWrite"
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  @click="handleUnmount(mount.mountpoint)"
                >
                  卸载
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SMART 健康面板 -->
    <SmartHealthPanel
      v-if="smartDevice"
      :device="smartDevice"
      :loading="smartLoading"
      :data="smartData"
      :error="smartError"
      @close="smartDevice = null"
    />

    <!-- 新建挂载表单 -->
    <MountForm
      v-if="showMountForm"
      :loading="mountLoading"
      :error="mountError"
      @close="showMountForm = false"
      @submit="handleMount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { useRole } from '@/composables/useRole'
import { useConfirm } from '@/composables/useConfirm'
import { useUiStore } from '@/stores/ui'
import { getDiskDevices, getMountPoints, mountDevice, unmountDevice, getSmartHealth } from '@/api/disks'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SmartHealthPanel from './SmartHealthPanel.vue'
import MountForm from './MountForm.vue'
import type { DiskDevice, MountPoint, SmartHealth } from '@/types'

const { apiClient } = useAgent()
const { canWrite } = useRole()
const { confirm } = useConfirm()
const uiStore = useUiStore()

const tabs = [
  { id: 'devices', label: '块设备' },
  { id: 'mounts', label: '挂载点' },
]
const activeTab = ref('devices')

const devices = ref<DiskDevice[]>([])
const mounts = ref<MountPoint[]>([])
const loading = ref(false)
const devicesError = ref<string | null>(null)
const mountsError = ref<string | null>(null)

// SMART 面板状态
const smartDevice = ref<string | null>(null)
const smartData = ref<SmartHealth | null>(null)
const smartLoading = ref(false)
const smartError = ref<string | null>(null)

// 挂载表单状态
const showMountForm = ref(false)
const mountLoading = ref(false)
const mountError = ref<string | null>(null)

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

async function loadDevices() {
  if (!apiClient.value) return
  try {
    devicesError.value = null
    devices.value = await getDiskDevices(apiClient.value)
  } catch (err) {
    devicesError.value = err instanceof Error ? err.message : '加载失败'
  }
}

async function loadMounts() {
  if (!apiClient.value) return
  try {
    mountsError.value = null
    mounts.value = await getMountPoints(apiClient.value)
  } catch (err) {
    mountsError.value = err instanceof Error ? err.message : '加载失败'
  }
}

async function refreshAll() {
  loading.value = true
  await Promise.all([loadDevices(), loadMounts()])
  loading.value = false
}

async function showSmartHealth(deviceName: string) {
  // 判空提前到设置 loading 之前，避免弹窗永久显示加载中
  if (!apiClient.value) {
    uiStore.error('未配置 Agent，无法查询 SMART 信息')
    return
  }
  smartDevice.value = deviceName
  smartData.value = null
  smartError.value = null
  smartLoading.value = true
  try {
    smartData.value = await getSmartHealth(apiClient.value, deviceName)
  } catch {
    smartError.value = '设备未支持 SMART 查询'
  } finally {
    smartLoading.value = false
  }
}

async function handleUnmount(mountpoint: string) {
  const confirmed = await confirm({
    title: '卸载确认',
    message: `确认卸载挂载点 "${mountpoint}"？`,
    confirmText: '卸载',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    await unmountDevice(apiClient.value, mountpoint)
    uiStore.success('卸载成功')
    await loadMounts()
  } catch (err) {
    uiStore.error(err instanceof Error ? err.message : '卸载失败')
  }
}

async function handleMount(req: { device: string; mountpoint: string; fstype: string; username?: string; password?: string }) {
  if (!apiClient.value) return
  mountLoading.value = true
  mountError.value = null
  try {
    await mountDevice(apiClient.value, req)
    uiStore.success('挂载成功')
    showMountForm.value = false
    await loadMounts()
  } catch (err) {
    mountError.value = err instanceof Error ? err.message : '挂载失败'
  } finally {
    mountLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadDevices(), loadMounts()])
  loading.value = false
})
</script>


