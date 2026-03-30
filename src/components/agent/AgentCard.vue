<template>
  <div
    :class="[
      'border rounded-lg p-4 transition-all',
      isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white',
    ]"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-lg font-semibold text-gray-900">{{ agent.name }}</h3>
          <StatusBadge
            :status="health?.status === 'online' ? 'online' : 'offline'"
          />
          {isActive && (
            <span class="text-xs px-2 py-1 bg-indigo-600 text-white rounded">
              当前活动
            </span>
          )}
        </div>
        <div class="space-y-1 text-sm text-gray-600">
          <p>
            <span class="font-medium">地址:</span>
            {{ agent.host }}:{{ agent.port }}
          </p>
          <p>
            <span class="font-medium">角色:</span>
            <span class="px-2 py-0.5 bg-gray-100 rounded text-xs">
              {{ roleLabel }}
            </span>
          </p>
          <p v-if="health?.version" class="text-xs text-gray-500">
            版本: {{ health.version }}
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <button
          v-if="!isActive"
          type="button"
          class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
          @click="$emit('activate')"
          title="设为活动"
        >
          激活
        </button>
        <button
          type="button"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          @click="$emit('edit')"
          title="编辑"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          type="button"
          class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
          @click="$emit('delete')"
          title="删除"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAgentsStore } from '@/stores/agents'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { AgentConfig } from '@/types'

const props = defineProps<{
  agent: AgentConfig
  isActive: boolean
}>()

defineEmits<{
  edit: []
  delete: []
  activate: []
}>()

const agentsStore = useAgentsStore()

const health = computed(() => agentsStore.getHealth(props.agent.id))

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    viewer: '查看者',
    operator: '操作者',
    admin: '管理员',
  }
  return roleMap[props.agent.role] || props.agent.role
})
</script>
