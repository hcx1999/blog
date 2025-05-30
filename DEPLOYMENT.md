# GitHub Pages 部署指南

## 📋 已完成的配置

✅ **创建的文件和目录：**
- `.github/workflows/deploy.yml` - GitHub Actions 工作流
- `package.json` - Node.js 项目配置
- `_config.yml` - GitHub Pages 配置
- `.gitignore` - Git 忽略规则
- `deploy-check.sh` - 部署前检查脚本

✅ **系统状态：**
- 博客代码已完成环境检测功能
- 文件列表生成器正常工作
- 找到 6 个 Markdown 文件待发布

## 🚀 部署步骤

### 1. 提交所有更改到 Git
```bash
# 添加所有新文件
git add .

# 提交更改
git commit -m "Setup GitHub Pages deployment with Actions"

# 推送到 GitHub
git push origin main
```

### 2. 在 GitHub 上启用 Pages
1. 进入你的 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分选择 **"GitHub Actions"**
5. 保存设置

### 3. 触发自动部署
- 推送代码后，GitHub Actions 会自动开始构建
- 你可以在 **Actions** 标签中查看部署进度
- 首次部署可能需要 2-5 分钟

### 4. 访问你的博客
部署完成后，你的博客将在以下地址可用：
```
https://[你的GitHub用户名].github.io/[仓库名]/
```

## 🔄 后续更新

每次你：
- 在 `Vault/` 目录中添加新的 Markdown 文件
- 修改现有文章
- 更新博客代码

只需要：
```bash
git add .
git commit -m "Update blog content"
git push origin main
```

GitHub Actions 会自动：
1. 扫描 `Vault/` 目录
2. 生成更新的 `files.json`
3. 部署到 GitHub Pages

## 🛠️ 故障排除

### 如果部署失败：
1. 检查 GitHub Actions 日志（在仓库的 Actions 标签中）
2. 确保 `Vault/` 目录中有 Markdown 文件
3. 确保所有必要的文件都已提交

### 本地测试：
```bash
# 生成文件列表
npm run build

# 启动本地服务器
npm start
# 或者
python -m http.server 8000
```

## 📁 文件结构说明

```
你的博客/
├── .github/workflows/deploy.yml  # GitHub Actions 配置
├── css/style.css                 # 样式文件
├── js/
│   ├── blog.js                   # 主要博客逻辑
│   ├── files.json                # 自动生成的文件列表
│   └── generate-file-list.js     # 文件列表生成器
├── Vault/                        # 你的 Markdown 文章
│   ├── *.md                      # 文章文件
│   └── attachments/              # 图片等附件
├── index.html                    # 博客首页
├── package.json                  # Node.js 配置
├── _config.yml                   # GitHub Pages 配置
└── .gitignore                    # Git 忽略规则
```

## ✨ 功能特性

你的博客系统支持：
- 📝 自动识别 Markdown 文件
- 🧮 KaTeX 数学公式渲染
- 🌙 深色/浅色主题切换
- 📑 智能目录生成
- 🔍 文章搜索和过滤
- 📱 响应式设计
- 🖼️ 自动图片路径处理

祝你使用愉快！🎉
