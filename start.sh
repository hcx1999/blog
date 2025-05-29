#!/bin/bash

# 简单的博客启动脚本
PORT=8000

echo "🚀 启动博客服务器..."
echo "📂 目录: $(pwd)"
echo "🌐 端口: $PORT"

# 尝试启动Python HTTP服务器
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器"
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器"
    python -m http.server $PORT
else
    echo "❌ 未找到 Python，请安装 Python 后重试"
    exit 1
fi
