#!/usr/bin/env node

/**
 * 检查构建产物大小
 * 用于 CI 中确保 bundle 不会过大
 */

import { statSync, readdirSync } from 'fs'
import { join } from 'path'

const DIST_DIR = 'dist/assets'
const MAX_JS_SIZE = 500 * 1024 // 500KB
const MAX_CSS_SIZE = 100 * 1024 // 100KB

function getFileSize(filePath) {
  try {
    const stats = statSync(filePath)
    return stats.size
  } catch (error) {
    console.error(`无法读取文件: ${filePath}`)
    return 0
  }
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB'
}

function checkBundleSize() {
  try {
    const files = readdirSync(DIST_DIR)
    let hasError = false

    console.log('📦 检查 bundle 大小...\n')

    files.forEach((file) => {
      const filePath = join(DIST_DIR, file)
      const size = getFileSize(filePath)

      if (file.endsWith('.js')) {
        const status = size > MAX_JS_SIZE ? '❌' : '✅'
        console.log(`${status} ${file}: ${formatBytes(size)}`)
        if (size > MAX_JS_SIZE) {
          console.log(`   ⚠️  超过限制 ${formatBytes(MAX_JS_SIZE)}`)
          hasError = true
        }
      } else if (file.endsWith('.css')) {
        const status = size > MAX_CSS_SIZE ? '❌' : '✅'
        console.log(`${status} ${file}: ${formatBytes(size)}`)
        if (size > MAX_CSS_SIZE) {
          console.log(`   ⚠️  超过限制 ${formatBytes(MAX_CSS_SIZE)}`)
          hasError = true
        }
      }
    })

    console.log('')
    if (hasError) {
      console.error('❌ Bundle 大小检查失败')
      process.exit(1)
    } else {
      console.log('✅ Bundle 大小检查通过')
      process.exit(0)
    }
  } catch (error) {
    console.error('错误:', error.message)
    process.exit(1)
  }
}

checkBundleSize()
