/**
 * Agents Store
 * 管理多个 agent 配置和健康状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentConfig, AgentHealth } from '@/types'
import { createHealthCheckClient } from '@/api/client'

const STORAGE_KEY = 'mingyue-agents'

// 持久化结构：不包含 apiKey（仅内存保存，除非用户确认受信任设备）
interface PersistedAgentConfig {
  id: string
  name: string
  host: string
  port: number
  role: 'viewer' | 'operator' | 'admin'
}

export const useAgentsStore = defineStore('agents', () => {
  // 状态
  const agents = ref<AgentConfig[]>([])
  const activeAgentId = ref<string | null>(null)
  const healthStatus = ref<Map<string, AgentHealth>>(new Map())
  // 健康检查定时器 ID
  let healthPollTimer: ReturnType<typeof setInterval> | null = null

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

  // 加载 agents 配置（从 localStorage，apiKey 不持久化）
  function loadAgents() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const persisted: PersistedAgentConfig[] = data.agents || []
        // apiKey 从 localStorage 分开读取（受信任设备才存储）
        agents.value = persisted.map((a) => ({
          ...a,
          apiKey: loadApiKey(a.id),
        }))
        activeAgentId.value = data.activeAgentId || null
      }
    } catch (error) {
      console.error('加载 agents 配置失败:', error)
    }
  }

  // 从 localStorage 读取单个 agent 的 apiKey（受信任设备确认后才存）
  function loadApiKey(agentId: string): string {
    return localStorage.getItem(`mingyue-apikey-${agentId}`) || ''
  }

  // 持久化 apiKey（仅受信任设备确认后调用）
  // 注意：将 API Key 存入 localStorage 存在 XSS 风险，
  // 这是在用户明确确认"受信任设备"后才执行的有意识的安全取舍。
  // 参见：PR review #stores/agents.ts:48-57
  function saveApiKey(agentId: string, apiKey: string) {
    localStorage.setItem(`mingyue-apikey-${agentId}`, apiKey)
  }

  // 清除 apiKey 持久化
  function clearApiKey(agentId: string) {
    localStorage.removeItem(`mingyue-apikey-${agentId}`)
  }

  // 保存 agents 配置（到 localStorage，不含 apiKey）
  function saveAgents() {
    try {
      const persisted: PersistedAgentConfig[] = agents.value.map(({ id, name, host, port, role }) => ({
        id, name, host, port, role,
      }))
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          agents: persisted,
          activeAgentId: activeAgentId.value,
        })
      )
    } catch (error) {
      console.error('保存 agents 配置失败:', error)
    }
  }

  // 添加 agent
  function addAgent(agent: AgentConfig, trusted = false) {
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

    // 仅当用户已确认受信任设备时才持久化 apiKey
    if (trusted) {
      saveApiKey(agent.id, agent.apiKey)
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
      clearApiKey(agentId)

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
  function updateAgent(agentId: string, updates: Partial<AgentConfig>, trusted = false) {
    const agent = agents.value.find((a) => a.id === agentId)
    if (agent) {
      Object.assign(agent, updates)
      if (trusted && updates.apiKey) {
        saveApiKey(agentId, updates.apiKey)
      }
      saveAgents()
      checkHealth(agentId)
    }
  }

  // 检查单个 agent 健康状态
  // 注意：健康检查端点 GET /health 不含 /api/v1 前缀，且无需鉴权
  async function checkHealth(agentId: string) {
    const agent = agents.value.find((a) => a.id === agentId)
    if (!agent) return

    // 直接使用 baseUrl（不加 API_PREFIX），健康检查无需前缀和认证
    const baseUrl = `http://${agent.host}:${agent.port}`
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
    stopHealthPolling()
    // 立即检查一次
    checkAllHealth()
    // 启动定时轮询
    healthPollTimer = setInterval(() => {
      checkAllHealth()
    }, intervalMs)
  }

  // 停止轮询健康检查
  function stopHealthPolling() {
    if (healthPollTimer !== null) {
      clearInterval(healthPollTimer)
      healthPollTimer = null
    }
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
