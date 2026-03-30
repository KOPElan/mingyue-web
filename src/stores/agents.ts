/**
 * Agents Store
 * 管理多个 agent 配置和健康状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentConfig, AgentHealth } from '@/types'
import { createHealthCheckClient } from '@/api/client'
import { API_PREFIX } from '@/utils/constants'

const STORAGE_KEY = 'mingyue-agents'

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<AgentConfig[]>([])
  const activeAgentId = ref<string | null>(null)
  const healthStatus = ref<Map<string, AgentHealth>>(new Map())
  const pollingControllers = ref<Map<string, AbortController>>(new Map())

  // 计算属性
  const activeAgent = computed(() => {
    if (!activeAgentId.value) return null
    return agents.value.find((a) => a.id === activeAgentId.value) || null
  })

  const onlineAgents = computed(() => {
    return agents.value.filter((agent) => {
      const health = healthStatus.value.get(agent.id)
      return health?.status === 'online'
    })
  })

  // 加载 agents 配置（从 localStorage）
  function loadAgents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        agents.value = data.agents || []
        activeAgentId.value = data.activeAgentId || null
      }
    } catch (error) {
      console.error('加载 agents 配置失败:', error)
    }
  }

  // 保存 agents 配置（到 localStorage）
  function saveAgents() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          agents: agents.value,
          activeAgentId: activeAgentId.value,
        })
      )
    } catch (error) {
      console.error('保存 agents 配置失败:', error)
    }
  }

  // 添加 agent
  function addAgent(agent: AgentConfig) {
    // 检查是否已存在
    const index = agents.value.findIndex((a) => a.id === agent.id)
    if (index >= 0) {
      agents.value[index] = agent
    } else {
      agents.value.push(agent)
    }

    // 如果是第一个 agent，设置为活动
    if (agents.value.length === 1) {
      activeAgentId.value = agent.id
    }

    saveAgents()
    checkHealth(agent.id)
  }

  // 删除 agent
  function removeAgent(agentId: string) {
    const index = agents.value.findIndex((a) => a.id === agentId)
    if (index >= 0) {
      agents.value.splice(index, 1)
      healthStatus.value.delete(agentId)

      // 停止健康检查
      const controller = pollingControllers.value.get(agentId)
      if (controller) {
        controller.abort()
        pollingControllers.value.delete(agentId)
      }

      // 如果删除的是活动 agent，切换到第一个
      if (activeAgentId.value === agentId) {
        activeAgentId.value = agents.value.length > 0 ? agents.value[0]!.id : null
      }

      saveAgents()
    }
  }

  // 切换活动 agent
  function setActiveAgent(agentId: string | null) {
    activeAgentId.value = agentId
    saveAgents()
  }

  // 更新 agent 配置
  function updateAgent(agentId: string, updates: Partial<AgentConfig>) {
    const agent = agents.value.find((a) => a.id === agentId)
    if (agent) {
      Object.assign(agent, updates)
      saveAgents()
      checkHealth(agentId)
    }
  }

  // 检查单个 agent 健康状态
  async function checkHealth(agentId: string) {
    const agent = agents.value.find((a) => a.id === agentId)
    if (!agent) return

    const baseUrl = `http://${agent.host}:${agent.port}${API_PREFIX}`
    const client = createHealthCheckClient(baseUrl)

    try {
      const response = await client.get('/health')
      healthStatus.value.set(agentId, {
        status: 'online',
        version: response.data.version,
        lastCheck: Date.now(),
      })
    } catch (error) {
      healthStatus.value.set(agentId, {
        status: 'offline',
        lastCheck: Date.now(),
        error: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  // 检查所有 agents 健康状态
  async function checkAllHealth() {
    await Promise.all(agents.value.map((agent) => checkHealth(agent.id)))
  }

  // 开始轮询健康检查
  function startHealthPolling(intervalMs = 5000) {
    // 停止现有的轮询
    stopHealthPolling()

    // 为每个 agent 创建独立的 AbortController
    agents.value.forEach((agent) => {
      const controller = new AbortController()
      pollingControllers.value.set(agent.id, controller)
    })

    // 立即检查一次
    checkAllHealth()

    // 启动定时检查
    const timer = setInterval(() => {
      checkAllHealth()
    }, intervalMs)

    // 保存 timer（使用特殊 key）
    const timerController = new AbortController()
    timerController.signal.addEventListener('abort', () => {
      clearInterval(timer)
    })
    pollingControllers.value.set('__timer__', timerController)
  }

  // 停止轮询健康检查
  function stopHealthPolling() {
    pollingControllers.value.forEach((controller) => {
      controller.abort()
    })
    pollingControllers.value.clear()
  }

  // 获取 agent 健康状态
  function getHealth(agentId: string): AgentHealth | undefined {
    return healthStatus.value.get(agentId)
  }

  return {
    // 状态
    agents,
    activeAgentId,
    healthStatus,

    // 计算属性
    activeAgent,
    onlineAgents,

    // 方法
    loadAgents,
    addAgent,
    removeAgent,
    setActiveAgent,
    updateAgent,
    checkHealth,
    checkAllHealth,
    startHealthPolling,
    stopHealthPolling,
    getHealth,
  }
})
