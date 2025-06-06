# HCX1999 Blog

<div align="center">

![Logo](src/avatar.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Static Badge](https://img.shields.io/badge/Build_with-Claude_AI-purple)](https://www.anthropic.com/claude)
![Static Badge](https://img.shields.io/badge/Platform-Static_HTML-orange)

</div>

> 🚀 一个由AI驱动构建的轻量级静态博客系统，为Obsidian用户打造

## ✨ 特性

- **💡 极简部署** - 纯静态页面，无需后端，加载速度快
- **🌙 主题切换** - 支持明暗主题模式自由切换
- **📋 自动目录** - 智能解析文章结构，自动生成目录
- **📊 数学渲染** - 完美支持LaTeX数学公式显示
- **🔍 智能分类** - 自动从文件名中提取分类信息
- **📱 响应式设计** - 完美适配桌面端和移动端
- **🔄 自动同步** - 自动扫描Vault目录，更新文章列表

## 🎯 项目灵感

这个博客系统起源于一个简单的需求：将Obsidian笔记发布到网页以便跨设备访问。通过AI辅助开发，我们创建了一个优雅且功能丰富的静态博客系统，无需依赖任何复杂的框架或构建工具。

## 🛠️ 技术栈

- **前端框架**: 原生HTML/CSS/JavaScript
- **Markdown渲染**: marked.js
- **数学公式**: KaTeX
- **构建辅助**: Claude Sonnet 4 AI

## 📖 使用方法

1. 将Markdown笔记放入`Vault`目录
2. 文件会自动被扫描并添加到博客中
3. 支持从文件名中提取分类（如`AI 01-数学基础.md`会被归类为"AI"）
4. 文件内容会被解析并显示，支持内部链接和图像引用

## 🎨 主要功能

- **动态扫描文件**: 自动检测并添加新的Markdown文件
- **智能分类系统**: 根据文件名自动创建分类
- **深色/浅色主题**: 提供舒适的阅读体验
- **响应式布局**: 在不同设备上保持最佳显示效果
- **文章目录**: 自动生成并支持点击跳转
- **数学公式渲染**: 完美支持复杂的LaTeX公式
- **图片路径修复**: 智能处理Obsidian图片链接

## 👨‍💻 关于作者

北京大学信息科学技术学院2024级学生，热爱编程、人工智能、Linux开发和数学。

## 📝 License

MIT