<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold text-gray-900">网络管理</h1>
      <button
        type="button"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        @click="loadInterfaces"
        :disabled="loading"
      >
        刷新
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white rounded-lg shadow-md p-6">
        <SkeletonList :count="4" />
      </div>
    </div>
    <div v-else-if="error" class="bg-red-50 rounded-lg p-4 text-red-800">{{ error }}</div>
    <div v-else-if="interfaces.length === 0" class="bg-white rounded-lg shadow-md p-8">
      <EmptyState title="暂无网络接口" description="" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="iface in interfaces"
        :key="iface.name"
        class="bg-white rounded-lg shadow-md p-5"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <h3 class="font-bold text-lg text-gray-900">{{ iface.name }}</h3>
            <StatusBadge :status="iface.up ? 'online' : 'offline'" :label="iface.up ? '运行中' : '已停止'" />
          </div>
        </div>
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <div v-if="iface.mac"><span class="font-medium">MAC：</span>{{ iface.mac }}</div>
          <div v-if="iface.mtu"><span class="font-medium">MTU：</span>{{ iface.mtu }}</div>
          <div v-for="addr in iface.addresses" :key="addr.ip">
            <span class="font-medium">{{ addr.family.toUpperCase() }}：</span>{{ addr.ip }}/{{ addr.mask }}
          </div>
        </div>
        <!-- Admin 操作按钮 -->
        <div class="flex gap-2 flex-wrap">
          <button
            type="button"
            :disabled="!canManageNetwork"
            :title="canManageNetwork ? '' : '需要 admin 角色'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              canManageNetwork
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            @click="handleInterfaceAction(iface.name, 'up')"
          >
            启用
          </button>
          <button
            type="button"
            :disabled="!canManageNetwork"
            :title="canManageNetwork ? '' : '需要 admin 角色'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              canManageNetwork
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            @click="handleInterfaceAction(iface.name, 'down')"
          >
            禁用
          </button>
          <button
            type="button"
            :disabled="!canManageNetwork"
            :title="canManageNetwork ? '' : '需要 admin 角色'"
            :class="[
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              canManageNetwork
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ]"
            @click="handleInterfaceAction(iface.name, 'dhcp')"
          >
            刷新 DHCP
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAgent } from '@/composables/useAgent'
import { useRole } from '@/composables/useRole'
import { useConfirm } from '@/composables/useConfirm'
import { useUiStore } from '@/stores/ui'
import { getNetworkInterfaces, updateNetworkInterface } from '@/api/network'
import SkeletonList from '@/components/common/SkeletonList.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { NetworkInterface } from '@/types'

const { apiClient } = useAgent()
const { canManageNetwork } = useRole()
const { confirm } = useConfirm()
const uiStore = useUiStore()

const interfaces = ref<NetworkInterface[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadInterfaces() {
  if (!apiClient.value) return
  loading.value = true
  error.value = null
  try {
    interfaces.value = await getNetworkInterfaces(apiClient.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function handleInterfaceAction(name: string, action: 'up' | 'down' | 'dhcp') {
  const actionLabel = action === 'up' ? '启用' : action === 'down' ? '禁用' : '刷新 DHCP'
  const confirmed = await confirm({
    title: `${actionLabel}网络接口`,
    message: `${actionLabel}接口 ${name} 可能导致当前连接中断，确认执行？`,
    confirmText: '确认',
    cancelText: '取消',
    type: 'danger',
  })
  if (!confirmed || !apiClient.value) return
  try {
    const req = action === 'up' ? { up: true } : action === 'down' ? { up: false } : { dhcp: true }
    await updateNetworkInterface(apiClient.value, name, req)
    uiStore.success(`接口 ${name} ${actionLabel}成功`)
    await loadInterfaces()
  } catch (e) {
    uiStore.error(e instanceof Error ? e.message : '操作失败')
  }
}

onMounted(async () => {
  await loadInterfaces()
})
</script>

