import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        const src = join(__dirname, '404.html')
        const dest = join(__dirname, 'dist', '404.html')
        
        // 确保dist目录存在
        const destDir = dirname(dest)
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true })
        }
        
        try {
          copyFileSync(src, dest)
          console.log(`Successfully copied ${src} to ${dest}`)
        } catch (error) {
          console.error(`Failed to copy 404.html: ${error}`)
        }
      }
    }
  ],
  base: '/blog/',
  server: {
    port: 5173,
    open: '/blog/',
    // 处理客户端路由
    historyApiFallback: true
  }
})
