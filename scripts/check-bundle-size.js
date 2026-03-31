#!/usr/bin/env node

/**
 * 检查构建产物 gzip 总大小
 * 按约定：所有 JS 产物 gzip 总大小 ≤ 300KB
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { gzipSync } from 'zlib'

const DIST_DIR = 'dist/assets'
const MAX_TOTAL_GZIP = 300 * 1024 // 300KB gzip 总大小

function getGzipSize(filePath) {
  try {
    const content = readFileSync(filePath)
    return gzipSync(content).length
  } catch {
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
    let totalGzip = 0

    console.log('📦 检查 bundle 大小（JS + CSS gzip 总大小）...\n')

    files.forEach((file) => {
      if (!file.endsWith('.js') && !file.endsWith('.css')) return
      const filePath = join(DIST_DIR, file)
      const gzipSize = getGzipSize(filePath)
      totalGzip += gzipSize
      console.log(`✅ ${file}: ${formatBytes(gzipSize)}`)
    })

    console.log(`\n📊 gzip 总大小: ${formatBytes(totalGzip)} / ${formatBytes(MAX_TOTAL_GZIP)}\n`)

    if (totalGzip > MAX_TOTAL_GZIP) {
      console.error(`❌ Bundle 大小检查失败：gzip 总大小 ${formatBytes(totalGzip)} 超过限制 ${formatBytes(MAX_TOTAL_GZIP)}`)
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
