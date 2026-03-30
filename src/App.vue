<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import { useAgentsStore } from './stores/agents'

const agentsStore = useAgentsStore()

onMounted(() => {
  // 加载 agents 配置
  agentsStore.loadAgents()
  
  // 启动健康检查轮询
  agentsStore.startHealthPolling()
})
</script>

<template>
  <AppLayout />
</template>

