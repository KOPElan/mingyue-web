<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-600">磁盘使用</h3>
      <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
        />
      </svg>
    </div>
    <div class="text-3xl font-bold text-gray-900">
      <router-link to="/disks" class="hover:text-indigo-600">
        查看详情 →
      </router-link>
    </div>
    <p class="mt-2 text-sm text-gray-500">点击查看磁盘管理</p>
  </div>
</template>

<script setup lang="ts"></script>
