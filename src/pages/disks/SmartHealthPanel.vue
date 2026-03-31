<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold">SMART 健康 - {{ device }}</h2>
        <button type="button" @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>
      <div v-if="loading" class="py-4">
        <SkeletonList :count="4" />
      </div>
      <div v-else-if="data">
        <div v-if="!data.healthy && data.powerOnHours === undefined" class="text-gray-500 text-sm">
          设备未支持 SMART 查询
        </div>
        <div v-else class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">健康状态</span>
            <span :class="data.healthy ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
              {{ data.healthy ? '健康' : '异常' }}
            </span>
          </div>
          <div v-if="data.temperature !== undefined" class="flex justify-between">
            <span class="text-gray-600">温度</span>
            <span>{{ data.temperature }}°C</span>
          </div>
          <div v-if="data.powerOnHours !== undefined" class="flex justify-between">
            <span class="text-gray-600">通电时间</span>
            <span>{{ data.powerOnHours.toLocaleString() }} 小时</span>
          </div>
        </div>
      </div>
      <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SkeletonList from '@/components/common/SkeletonList.vue'
import type { SmartHealth } from '@/types'

defineProps<{
  device: string
  loading: boolean
  data: SmartHealth | null
  error: string | null
}>()

defineEmits<{
  close: []
}>()
</script>
