<template>
  <div>
    <div
      class="flex items-center gap-1 cursor-pointer hover:bg-gray-100 text-sm"
      :class="selectedPath === node.path ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'"
      :style="{ paddingLeft: depth * 12 + 12 + 'px', paddingTop: '6px', paddingBottom: '6px', paddingRight: '12px' }"
      @click="$emit('select', node.path)"
    >
      <span
        class="w-4 text-gray-400 shrink-0"
        @click.stop="$emit('toggle', node.path)"
      >
        <template v-if="node.children.length > 0">
          {{ node.expanded ? '▼' : '▶' }}
        </template>
        <template v-else>　</template>
      </span>
      <span>📁 {{ node.name === '/' ? '/ (根目录)' : node.name }}</span>
    </div>
    <template v-if="node.expanded">
      <DirectoryTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :selected-path="selectedPath"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
// 目录树节点组件（递归）

interface TreeNode {
  name: string
  path: string
  children: TreeNode[]
  expanded: boolean
}

withDefaults(
  defineProps<{
    node: TreeNode
    selectedPath: string
    depth?: number
  }>(),
  { depth: 0 }
)

defineEmits<{
  select: [path: string]
  toggle: [path: string]
}>()
</script>
