/**
 * Agent Composable
 * 提供当前活动 agent 的 API 客户端
 */

import { computed } from 'vue'
import type { AxiosInstance } from 'axios'
import { useAgentsStore } from '@/stores/agents'
import { createMingyueClient } from '@/api/client'
import { API_PREFIX } from '@/utils/constants'

export function useAgent() {
  const agentsStore = useAgentsStore()

  // 当前活动 agent
  const activeAgent = computed(() => agentsStore.activeAgent)

  // API 客户端
  const apiClient = computed<AxiosInstance | null>(() => {
    const agent = activeAgent.value
    if (!agent) return null

    const baseUrl = `http://${agent.host}:${agent.port}${API_PREFIX}`
    return createMingyueClient(baseUrl, agent.apiKey)
  })

  // 是否已配置 agent
  const isConfigured = computed(() => !!activeAgent.value)

  // API 基础 URL
  const baseUrl = computed(() => {
    const agent = activeAgent.value
    if (!agent) return null
    return `http://${agent.host}:${agent.port}${API_PREFIX}`
  })

  return {
    activeAgent,
    apiClient,
    isConfigured,
    baseUrl,
  }
}
