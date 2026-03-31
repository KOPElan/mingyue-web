import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// 仅在开发模式启用 DevTools，避免打入生产构建
const isDev = process.env.NODE_ENV !== 'production'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    isDev ? vueDevTools() : null,
    tailwindcss(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
