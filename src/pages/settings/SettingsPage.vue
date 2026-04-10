<template>
  <div class="max-w-4xl">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">设置</h1>

    <!-- Agent 管理 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Agent 管理</h2>
        <button
          type="button"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @click="showAddForm = true"
        >
          添加 Agent
        </button>
      </div>

      <!-- Agent 列表 -->
      <div v-if="agents.length > 0" class="space-y-4">
        <AgentCard
          v-for="agent in agents"
          :key="agent.id"
          :agent="agent"
          :is-active="agent.id === activeAgentId"
          @edit="editAgent(agent)"
          @delete="deleteAgent(agent.id)"
          @activate="agentsStore.setActiveAgent(agent.id)"
        />
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else
        title="暂无 Agent"
        description="请添加至少一个 Agent 以开始管理服务器"
      />
    </div>

    <!-- Agent 表单对话框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showAddForm || editingAgent"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          @click.self="closeForm"
        >
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AgentForm
              :agent="editingAgent"
              @save="handleSave"
              @cancel="closeForm"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAgentsStore } from '@/stores/agents'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import AgentCard from '@/components/agent/AgentCard.vue'
import AgentForm from '@/components/agent/AgentForm.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { AgentConfig } from '@/types'

const agentsStore = useAgentsStore()
const uiStore = useUiStore()
const { confirm } = useConfirm()

const showAddForm = ref(false)
const editingAgent = ref<AgentConfig | null>(null)

const agents = computed(() => agentsStore.agents)
const activeAgentId = computed(() => agentsStore.activeAgentId)

function editAgent(agent: AgentConfig) {
  editingAgent.value = { ...agent }
}

async function deleteAgent(agentId: string) {
  const confirmed = await confirm({
    title: '删除 Agent',
    message: '确定要删除这个 Agent 吗？此操作无法撤销。',
    confirmText: '删除',
    cancelText: '取消',
    type: 'danger',
  })

  if (confirmed) {
    agentsStore.removeAgent(agentId)
    uiStore.success('Agent 已删除')
  }
}

function handleSave(agent: AgentConfig) {
  agentsStore.addAgent(agent)
  uiStore.success(editingAgent.value ? 'Agent 已更新' : 'Agent 已添加')
  closeForm()
}

function closeForm() {
  showAddForm.value = false
  editingAgent.value = null
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

