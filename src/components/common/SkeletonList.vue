<template>
  <div class="animate-pulse space-y-4">
    <div v-for="i in count" :key="i" class="flex items-center space-x-4">
      <div class="h-12 w-12 bg-gray-200 rounded"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>
