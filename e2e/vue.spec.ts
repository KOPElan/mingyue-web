import { test, expect } from '@playwright/test'

// 测试应用根路由重定向到仪表板
test('访问根路径重定向到仪表板', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/dashboard|\/settings/)
})
