#!/bin/bash

# 部署前检查脚本
echo "🔍 GitHub Pages 部署前检查..."

# 检查必要文件
required_files=(
    "index.html"
    "js/blog.js"
    "js/files.json"
    "css/style.css"
    ".github/workflows/deploy.yml"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    else
        echo "✅ $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "❌ 缺少以下必要文件:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

# 检查 Vault 目录
if [ ! -d "Vault" ]; then
    echo "❌ Vault 目录不存在"
    exit 1
fi

# 检查是否有 Markdown 文件
md_count=$(find Vault -name "*.md" -type f | wc -l)
if [ $md_count -eq 0 ]; then
    echo "⚠️  警告: Vault 目录中没有找到 Markdown 文件"
else
    echo "✅ 找到 $md_count 个 Markdown 文件"
fi

# 检查 files.json 是否最新
echo ""
echo "🔄 检查文件列表是否最新..."
node js/generate-file-list.js

echo ""
echo "✅ 所有检查通过！"
echo "📝 下一步："
echo "   1. 提交所有更改: git add . && git commit -m 'Setup GitHub Pages deployment'"
echo "   2. 推送到 GitHub: git push origin main"
echo "   3. 在 GitHub 仓库设置中启用 Pages（Source: GitHub Actions）"
echo ""
echo "🌐 部署完成后，你的博客将在以下地址可用："
echo "   https://[your-username].github.io/[repository-name]/"
