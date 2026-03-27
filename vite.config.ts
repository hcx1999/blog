import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'

// 递归复制目录的辅助函数
function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true })
  }
  
  const entries = readdirSync(src, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      // 只复制非 markdown 和 ipynb 文件（这些由应用处理）
      const ext = entry.name.toLowerCase()
      if (!ext.endsWith('.md') && !ext.endsWith('.ipynb')) {
        copyFileSync(srcPath, destPath)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/blog',
  assetsInclude: ['**/*.pdf', '**/*.doc', '**/*.docx', '**/*.xls', '**/*.xlsx', '**/*.ppt', '**/*.pptx', '**/*.zip', '**/*.rar', '**/*.txt', '**/*.csv', '**/*.json'],
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
        
        // 复制 vault 目录中的资源文件到 dist
        const vaultSrc = join(__dirname, 'vault')
        const vaultDest = join(__dirname, 'dist', 'vault')
        
        if (existsSync(vaultSrc)) {
          try {
            copyDir(vaultSrc, vaultDest)
            console.log(`Successfully copied vault assets to ${vaultDest}`)
          } catch (error) {
            console.error(`Failed to copy vault assets: ${error}`)
          }
        }
      }
    }
  ],
  server: {
    port: 5173,
    open: true
  }
})
