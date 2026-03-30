<template>
  <header class="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-40 flex items-center justify-between px-6">
    <!-- Logo 和标题 -->
    <div class="flex items-center gap-4">
      <h1 class="text-xl font-bold text-indigo-600">明月 Web</h1>
      <span class="text-sm text-gray-500">Linux 服务器管理</span>
    </div>

    <!-- Agent 信息和切换器 -->
    <div class="flex items-center gap-4">
      <div v-if="activeAgent" class="flex items-center gap-3">
        <StatusBadge
          :status="health?.status === 'online' ? 'online' : 'offline'"
          :label="activeAgent.name"
        />
        <span class="text-sm text-gray-600">{{ activeAgent.host }}:{{ activeAgent.port }}</span>
        <span class="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
          {{ roleLabel }}
        </span>
      </div>
      
      <button
        v-if="agents.length > 1"
        type="button"
        class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        @click="showAgentSwitcher = !showAgentSwitcher"
        title="切换 Agent"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </button>
    </div>

    <!-- Agent 切换器下拉菜单 -->
    <Teleport to="body">
      <div
        v-if="showAgentSwitcher"
        class="fixed inset-0 z-50"
        @click="showAgentSwitcher = false"
      >
        <div
          class="absolute top-20 right-6 bg-white shadow-xl rounded-lg border border-gray-200 w-80"
          @click.stop
        >
          <div class="p-4 border-b">
            <h3 class="font-semibold text-gray-900">切换 Agent</h3>
          </div>
          <div class="max-h-96 overflow-y-auto">
            <button
              v-for="agent in agents"
              :key="agent.id"
              type="button"
              :class="[
                'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between',
                agent.id === activeAgentId ? 'bg-indigo-50' : '',
              ]"
              @click="switchAgent(agent.id)"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ agent.name }}</div>
                <div class="text-sm text-gray-500">{{ agent.host }}:{{ agent.port }}</div>
              </div>
              <StatusBadge
                :status="getHealth(agent.id)?.status === 'online' ? 'online' : 'offline'"
              />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgentsStore } from '@/stores/agents'
import StatusBadge from '@/components/common/StatusBadge.vue'

const agentsStore = useAgentsStore()
const showAgentSwitcher = ref(false)

const agents = computed(() => agentsStore.agents)
const activeAgent = computed(() => agentsStore.activeAgent)
const activeAgentId = computed(() => agentsStore.activeAgentId)

const health = computed(() => {
  if (!activeAgent.value) return null
  return agentsStore.getHealth(activeAgent.value.id)
})

const roleLabel = computed(() => {
  if (!activeAgent.value) return ''
  const roleMap: Record<string, string> = {
    viewer: '查看',
    operator: '操作',
    admin: '管理',
  }
  return roleMap[activeAgent.value.role] || activeAgent.value.role
})

function getHealth(agentId: string) {
  return agentsStore.getHealth(agentId)
}

function switchAgent(agentId: string) {
  agentsStore.setActiveAgent(agentId)
  showAgentSwitcher.value = false
}
</script>
