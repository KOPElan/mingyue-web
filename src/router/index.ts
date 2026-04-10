import { createRouter, createWebHistory } from 'vue-router'
import { useAgentsStore } from '@/stores/agents'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/dashboard/DashboardPage.vue'),
      meta: { title: '仪表板' },
    },
    {
      path: '/processes',
      name: 'processes',
      component: () => import('@/pages/processes/ProcessesPage.vue'),
      meta: { title: '进程管理' },
    },
    {
      path: '/disks',
      name: 'disks',
      component: () => import('@/pages/disks/DisksPage.vue'),
      meta: { title: '磁盘管理' },
    },
    {
      path: '/files',
      name: 'files',
      component: () => import('@/pages/files/FilesPage.vue'),
      meta: { title: '文件管理' },
    },
    {
      path: '/shares',
      name: 'shares',
      component: () => import('@/pages/shares/SharesPage.vue'),
      meta: { title: '共享管理' },
    },
    {
      path: '/network',
      name: 'network',
      component: () => import('@/pages/network/NetworkPage.vue'),
      meta: { title: '网络管理' },
    },
    {
      path: '/acl',
      name: 'acl',
      component: () => import('@/pages/acl/AclPage.vue'),
      meta: { title: 'ACL 管理' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/settings/SettingsPage.vue'),
      meta: { title: '设置' },
    },
  ],
})

// 导航守卫：检查是否已配置 agent
router.beforeEach((to, _from, next) => {
  const agentsStore = useAgentsStore()
  
  // 如果没有配置任何 agent 且不是去设置页，重定向到设置页
  if (agentsStore.agents.length === 0 && to.name !== 'settings') {
    next({ name: 'settings' })
  } else {
    next()
  }
})

export default router
