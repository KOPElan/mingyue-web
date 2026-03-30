<template>
  <form @submit.prevent="handleSubmit" class="p-6">
    <h2 class="text-xl font-semibold mb-6">{{ agent ? '编辑 Agent' : '添加 Agent' }}</h2>

    <div class="space-y-4">
      <!-- 名称 -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          名称 <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例如: 主服务器"
        />
      </div>

      <!-- 主机地址 -->
      <div>
        <label for="host" class="block text-sm font-medium text-gray-700 mb-1">
          主机地址 <span class="text-red-500">*</span>
        </label>
        <input
          id="host"
          v-model="form.host"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="例如: 192.168.1.100 或 server.local"
        />
        <p class="mt-1 text-xs text-gray-500">
          输入 IP 地址或主机名
        </p>
      </div>

      <!-- 端口 -->
      <div>
        <label for="port" class="block text-sm font-medium text-gray-700 mb-1">
          端口 <span class="text-red-500">*</span>
        </label>
        <input
          id="port"
          v-model.number="form.port"
          type="number"
          required
          min="1"
          max="65535"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- API Key -->
      <div>
        <label for="apiKey" class="block text-sm font-medium text-gray-700 mb-1">
          API Key <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <input
            id="apiKey"
            v-model="form.apiKey"
            :type="showApiKey ? 'text' : 'password'"
            required
            class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请输入 API Key"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            @click="showApiKey = !showApiKey"
          >
            <svg v-if="!showApiKey" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          API Key 将安全存储在本地浏览器中
        </p>
      </div>

      <!-- 角色 -->
      <div>
        <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
          角色 <span class="text-red-500">*</span>
        </label>
        <select
          id="role"
          v-model="form.role"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="viewer">查看者 (只读)</option>
          <option value="operator">操作者 (读写，不含网络)</option>
          <option value="admin">管理员 (全部权限)</option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          根据 API Key 的权限选择相应的角色
        </p>
      </div>
    </div>

    <!-- 按钮 -->
    <div class="mt-6 flex justify-end gap-3">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        {{ agent ? '更新' : '添加' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { AgentConfig } from '@/types'
import { DEFAULT_API_PORT } from '@/utils/constants'

const props = defineProps<{
  agent?: AgentConfig | null
}>()

const emit = defineEmits<{
  save: [agent: AgentConfig]
  cancel: []
}>()

const showApiKey = ref(false)

const form = reactive<Omit<AgentConfig, 'id'>>({
  name: '',
  host: '',
  port: DEFAULT_API_PORT,
  apiKey: '',
  role: 'viewer',
})

// 当传入 agent 时，填充表单
watch(
  () => props.agent,
  (agent) => {
    if (agent) {
      form.name = agent.name
      form.host = agent.host
      form.port = agent.port
      form.apiKey = agent.apiKey
      form.role = agent.role
    } else {
      // 重置表单
      form.name = ''
      form.host = ''
      form.port = DEFAULT_API_PORT
      form.apiKey = ''
      form.role = 'viewer'
    }
  },
  { immediate: true }
)

function handleSubmit() {
  const agent: AgentConfig = {
    id: props.agent?.id || generateId(),
    name: form.name,
    host: form.host,
    port: form.port,
    apiKey: form.apiKey,
    role: form.role,
  }

  emit('save', agent)
}

function generateId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
</script>
