/**
 * Role Composable
 * 提供基于角色的权限检查
 */

import { computed } from 'vue'
import { useAgent } from './useAgent'

export type Role = 'viewer' | 'operator' | 'admin'

export function useRole() {
  const { activeAgent } = useAgent()

  // 当前角色
  const role = computed<Role | null>(() => {
    return activeAgent.value?.role || null
  })

  // 是否是 viewer
  const isViewer = computed(() => role.value === 'viewer')

  // 是否是 operator
  const isOperator = computed(() => role.value === 'operator')

  // 是否是 admin
  const isAdmin = computed(() => role.value === 'admin')

  // 是否可以写入（operator 或 admin）
  const canWrite = computed(() => {
    return role.value === 'operator' || role.value === 'admin'
  })

  // 是否可以管理网络（仅 admin）
  const canManageNetwork = computed(() => {
    return role.value === 'admin'
  })

  // 检查是否有特定权限
  function hasPermission(requiredRole: Role): boolean {
    if (!role.value) return false

    const roleLevel: Record<Role, number> = {
      viewer: 1,
      operator: 2,
      admin: 3,
    }

    return roleLevel[role.value] >= roleLevel[requiredRole]
  }

  return {
    role,
    isViewer,
    isOperator,
    isAdmin,
    canWrite,
    canManageNetwork,
    hasPermission,
  }
}
