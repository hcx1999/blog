# 现代化博客系统

一个功能完整的博客项目，支持 Markdown 和 Jupyter Notebook 文件的渲染与展示。

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **Markdown 渲染**：react-markdown + remark-gfm
- **代码高亮**：highlight.js
- **图标库**：lucide-react
- **动画效果**：framer-motion
- **路由管理**：React Router
- **状态管理**：React Context
- **部署平台**：GitHub Pages

## 工作流程

1. **内容管理**：
   - Markdown 文件存放于 `vault/` 目录
   - Jupyter Notebook 文件存放于 `vault/` 目录
   - 支持按文件夹分类管理内容

2. **开发流程**：
   - 安装依赖：`npm install`
   - 启动开发服务器：`npm run dev`
   - 构建生产版本：`npm run build`
   - 预览生产构建：`npm run preview`

3. **部署流程**：
   - 代码推送到 `main` 分支自动触发 GitHub Actions 部署
   - 部署到 GitHub Pages：`https://hcx1999.github.io/blog/`

## 核心功能

- ✅ Markdown 渲染（支持 GFM 语法）
- ✅ Jupyter Notebook 支持
- ✅ 响应式侧边栏导航
- ✅ 目录自动生成与滚动同步
- ✅ 深色/浅色主题切换
- ✅ 全文搜索功能
- ✅ 代码高亮与复制功能
- ✅ 数学公式渲染（MathJax）

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Navbar.tsx      # 顶部导航栏
│   ├── Sidebar.tsx     # 侧边栏导航
│   ├── MarkdownRenderer.tsx # Markdown 渲染器
│   ├── NotebookRenderer.tsx # Notebook 渲染器
│   └── TableOfContents.tsx # 目录导航
├── context/            # React Context
│   └── AppContext.tsx  # 全局状态管理
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── ArticlePage.tsx # 文章页
│   └── SearchResultsPage.tsx # 搜索结果页
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   ├── cn.ts           # 类名合并工具
│   ├── toc.ts          # 目录提取工具
│   └── vault.ts        # 内容加载工具
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173 查看项目。

### 构建生产版本
```bash
npm run build
```

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages。只需将代码推送到 `main` 分支即可触发部署。

## 许可证

MIT
