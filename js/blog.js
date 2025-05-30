// 主题切换功能
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return; // 防止在页面未完全加载时出错
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    }
}

// 博客应用主类
class BlogApp {    constructor() {
        this.articles = [];
        this.currentView = 'home';
        this.currentArticle = null;
        this.sidebarHidden = localStorage.getItem('sidebar-hidden') === 'true'; // 侧边栏状态
        this.checkProtocol(); // 检查协议
        this.init();
    }

    // 检查协议（确保在合适的环境中运行）
    checkProtocol() {
        // 如果是在本地文件系统中运行，提示用户使用HTTP服务器
        if (location.protocol === 'file:') {
            console.warn('⚠️ 正在使用 file:// 协议访问，某些功能可能受限');
            console.warn('💡 建议使用 HTTP 服务器运行，例如：python -m http.server 8000');
        }
        
        // 记录当前运行环境
        console.log(`🌐 当前协议: ${location.protocol}`);
        console.log(`🌐 当前域名: ${location.hostname || 'localhost'}`);
    }    async init() {
        console.log('🚀 博客系统初始化开始...');
        console.log('📋 步骤 1: 强制更新文件列表...');
        
        // 每次刷新都先检查并更新文件列表
        await this.forceUpdateFileList();
        
        console.log('📋 步骤 2: 加载文章内容...');
        await this.loadArticles();
        
        console.log('📋 步骤 3: 渲染侧边栏...');
        this.renderSidebar();

        console.log('📋 步骤 4: 渲染首页视图...');
        this.renderHomeView();
        
        // 设置初始的body class
        document.body.classList.add('view-home');
          console.log('📋 步骤 5: 初始化响应式侧边栏...');
        this.initResponsiveSidebar();
        
        console.log('📋 步骤 6: 初始化侧边栏状态...');
        this.initSidebarState();
        
        console.log('✅ 博客系统初始化完成');
    }

    // 强制更新文件列表（每次页面刷新时调用）
    async forceUpdateFileList() {
        try {
            console.log('🔄 强制检查文件列表更新...');
            
            // 检测是否在静态托管环境中（如GitHub Pages）
            const isStaticHosting = this.detectStaticHostingEnvironment();
            
            if (isStaticHosting) {
                console.log('📡 检测到静态托管环境，使用files.json作为主要数据源');
                await this.handleStaticHostingEnvironment();
            } else {
                console.log('🖥️ 检测到本地开发环境，使用目录扫描');
                await this.handleLocalEnvironment();
            }
            
        } catch (error) {
            console.error('❌ 强制更新文件列表失败:', error);
            // 降级到使用现有的 files.json
            await this.fallbackToExistingFilesList();
        }
    }
    
    // 检测是否在静态托管环境中
    detectStaticHostingEnvironment() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // 检测常见的静态托管域名
        const staticHostingDomains = [
            'github.io',
            'netlify.app',
            'vercel.app',
            'surge.sh',
            'firebase.app',
            'pages.dev'
        ];
        
        // 如果是 file:// 协议，则是本地文件
        if (protocol === 'file:') {
            return false;
        }
        
        // 如果是 localhost 或 127.0.0.1，则是本地开发
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return false;
        }
        
        // 检查是否匹配静态托管域名
        return staticHostingDomains.some(domain => hostname.includes(domain));
    }
    
    // 处理静态托管环境
    async handleStaticHostingEnvironment() {
        try {
            // 优先从 files.json 获取文件列表
            const response = await fetch('js/files.json');
            if (response.ok) {
                const fileData = await response.json();
                if (fileData.files && Array.isArray(fileData.files)) {
                    const markdownFiles = fileData.files.map(file => file.filename);
                    console.log(`✅ 从 files.json 加载了 ${markdownFiles.length} 个文件`);
                    
                    // 验证文件是否真实存在（可选，避免过多请求）
                    const validFiles = await this.validateFiles(markdownFiles.slice(0, 3)); // 只验证前3个文件
                    if (validFiles.length > 0) {
                        this.cacheFileList(markdownFiles);
                        console.log('📋 静态托管环境下文件列表已更新');
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('无法从 files.json 获取文件列表:', error);
        }
        
        // 如果 files.json 不可用，使用缓存
        await this.fallbackToExistingFilesList();
    }
    
    // 处理本地开发环境
    async handleLocalEnvironment() {
        // 实时扫描Vault目录获取最新文件列表
        const currentFiles = await this.scanVaultDirectory();
        
        if (currentFiles.length === 0) {
            console.warn('⚠️ 未发现任何Markdown文件，尝试使用files.json');
            await this.fallbackToExistingFilesList();
            return;
        }
        
        console.log(`📁 发现 ${currentFiles.length} 个Markdown文件:`, currentFiles);
        
        // 检查是否需要更新files.json
        const needsUpdate = await this.checkIfFileListNeedsUpdate(currentFiles);
        
        if (needsUpdate) {
            console.log('🔄 检测到文件变更，自动更新files.json...');
            await this.updateFileListSilently(currentFiles);
            console.log('✅ files.json已更新');
        } else {
            console.log('✅ 文件列表无变化，无需更新');
        }
        
        // 更新本地缓存
        this.cacheFileList(currentFiles);
    }
    
    // 降级处理：使用现有的files.json或缓存
    async fallbackToExistingFilesList() {
        try {
            // 尝试从 files.json 获取
            const response = await fetch('js/files.json');
            if (response.ok) {
                const fileData = await response.json();
                if (fileData.files && Array.isArray(fileData.files)) {
                    const markdownFiles = fileData.files.map(file => file.filename);
                    console.log(`📄 降级使用 files.json，加载了 ${markdownFiles.length} 个文件`);
                    this.cacheFileList(markdownFiles);
                    return;
                }
            }
        } catch (error) {
            console.warn('无法从 files.json 获取文件列表:', error);
        }
        
        // 最后尝试从缓存获取
        const cachedFiles = this.getCachedFileList();
        if (cachedFiles && cachedFiles.length > 0) {
            console.log(`💾 使用本地缓存，加载了 ${cachedFiles.length} 个文件`);
        } else {
            console.error('❌ 无法获取任何文件列表！');
        }
    }
    
    // 验证文件是否存在（用于静态托管环境）
    async validateFiles(filenames) {
        const validFiles = [];
        for (const filename of filenames) {
            try {
                const response = await fetch(`Vault/${filename}`, { method: 'HEAD' });
                if (response.ok) {
                    validFiles.push(filename);
                }
            } catch (error) {
                console.warn(`文件验证失败: ${filename}`);
            }
        }
        return validFiles;
    }
    
    // 直接扫描Vault目录
    async scanVaultDirectory() {
        try {
            const response = await fetch('Vault/');
            if (response.ok) {
                const htmlText = await response.text();
                const markdownFiles = this.parseDirectoryListing(htmlText);
                return markdownFiles;
            }
        } catch (error) {
            console.warn('目录扫描失败:', error);
        }
        return [];
    }
    
    // 检查文件列表是否需要更新
    async checkIfFileListNeedsUpdate(currentFiles) {
        try {
            const response = await fetch('js/files.json');
            if (!response.ok) {
                console.log('files.json不存在，需要创建');
                return true;
            }
            
            const existingData = await response.json();
            const existingFiles = existingData.files ? existingData.files.map(f => f.filename) : [];
            
            return this.compareFileLists(currentFiles, existingFiles);
        } catch (error) {
            console.warn('检查文件列表时出错:', error);
            return true; // 出错时默认需要更新
        }
    }
      // 静默更新文件列表（不弹出下载提示）
    async updateFileListSilently(files) {
        try {
            const fileListData = await this.generateUpdatedFileListData(files);
            
            // 将更新的数据存储到临时存储中，供开发者参考
            const jsonString = JSON.stringify(fileListData, null, 2);
            
            // 在控制台输出最新的files.json内容
            console.log('📄 最新的files.json内容:');
            console.log(jsonString);
            
            // 可选：存储到localStorage中供后续使用
            localStorage.setItem('latest_files_json', jsonString);
            
            // 不再显示文件列表同步的弹窗提示
            
        } catch (error) {
            console.error('静默更新文件列表失败:', error);
        }
    }
      // 显示静默更新提示方法已移除 - 不再需要文件列表同步的弹窗提示
    
    // 动态获取Markdown文件列表
    async getMarkdownFileList() {
        try {
            console.log('正在动态扫描 Vault 目录...');
            
            // 首先尝试实时扫描目录（确保获取最新文件列表）
            try {
                const response = await fetch('Vault/');
                if (response.ok) {
                    const htmlText = await response.text();
                    const markdownFiles = this.parseDirectoryListing(htmlText);                    if (markdownFiles.length > 0) {
                        console.log(`通过实时目录扫描找到 ${markdownFiles.length} 个文件`);
                        
                        // 检查是否需要更新 files.json
                        await this.checkAndUpdateFileList(markdownFiles);
                        
                        // 缓存到 localStorage
                        this.cacheFileList(markdownFiles);
                        return markdownFiles;
                    }
                }
            } catch (error) {
                console.warn('无法通过目录扫描获取文件列表，尝试缓存数据');
            }
            
            // 如果目录扫描失败，尝试从 files.json 获取
            try {
                const response = await fetch('js/files.json');
                if (response.ok) {
                    const fileData = await response.json();
                    if (fileData.files && Array.isArray(fileData.files)) {
                        const markdownFiles = fileData.files.map(file => file.filename);
                        console.log(`从 files.json 加载了 ${markdownFiles.length} 个文件`);
                        return markdownFiles;
                    }
                }
            } catch (error) {
                console.warn('无法从 files.json 获取文件列表，尝试本地缓存');
            }
            
            // 最后尝试从 localStorage 获取缓存
            try {
                const cachedFiles = this.getCachedFileList();
                if (cachedFiles && cachedFiles.length > 0) {
                    console.log(`从本地缓存加载了 ${cachedFiles.length} 个文件`);
                    return cachedFiles;
                }
            } catch (error) {
                console.warn('无法从本地缓存获取文件列表');            }
            
            // 如果所有方法都失败，返回空数组
            console.warn('无法获取文件列表，将显示空的文章列表');
            return [];
            
        } catch (error) {
            console.error('获取文件列表失败:', error);
            return [];
        }
    }
    
    // 解析目录列表HTML
    parseDirectoryListing(htmlText) {
        const markdownFiles = [];
        // 匹配 .md 文件链接
        const mdFileRegex = /<a[^>]*href=["']([^"']*\.md)["'][^>]*>/gi;
        let match;
        
        while ((match = mdFileRegex.exec(htmlText)) !== null) {
            const filename = match[1];
            // 排除路径前缀，只保留文件名
            const cleanFilename = filename.replace(/^.*\//, '');
            if (cleanFilename && !markdownFiles.includes(cleanFilename)) {
                markdownFiles.push(cleanFilename);
            }        }
        
        return markdownFiles;
    }
    
    // 缓存文件列表到 localStorage
    cacheFileList(files) {
        try {
            const cacheData = {
                files: files,
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem('blog_file_cache', JSON.stringify(cacheData));
            console.log('文件列表已缓存到本地存储');
        } catch (error) {
            console.warn('无法缓存文件列表:', error);
        }
    }
    
    // 从 localStorage 获取缓存的文件列表
    getCachedFileList() {
        try {
            const cached = localStorage.getItem('blog_file_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                // 检查缓存是否过期（24小时）
                const maxAge = 24 * 60 * 60 * 1000; // 24小时
                if (Date.now() - cacheData.timestamp < maxAge) {
                    return cacheData.files;
                } else {
                    console.log('本地缓存已过期，清除缓存');
                    localStorage.removeItem('blog_file_cache');
                }
            }        } catch (error) {
            console.warn('读取本地缓存失败:', error);
        }
        
        return null;
    }
    
    // 生成更新的 files.json 数据
    async generateUpdatedFileListData(files) {
        const fileListData = {
            generated: new Date().toISOString(),
            generator: 'blog.js (browser)',
            version: '1.0',
            totalFiles: files.length,
            files: []
        };
        
        // 尝试获取每个文件的详细信息
        for (const filename of files) {
            try {
                const response = await fetch(`Vault/${filename}`, { method: 'HEAD' });
                if (response.ok) {
                    const lastModified = response.headers.get('Last-Modified');
                    const contentLength = response.headers.get('Content-Length');
                    
                    fileListData.files.push({
                        filename: filename,
                        size: contentLength ? parseInt(contentLength) : 0,
                        modified: lastModified || new Date().toISOString(),
                        created: lastModified || new Date().toISOString()
                    });
                } else {
                    // 如果无法获取详细信息，至少包含文件名
                    fileListData.files.push({
                        filename: filename,
                        size: 0,
                        modified: new Date().toISOString(),
                        created: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.warn(`无法获取文件 ${filename} 的信息:`, error);
                fileListData.files.push({
                    filename: filename,
                    size: 0,
                    modified: new Date().toISOString(),
                    created: new Date().toISOString()
                });
            }
        }
        
        return fileListData;
    }
    
    // 提供下载更新的 files.json 的功能
    async downloadUpdatedFileList(files) {
        try {
            const fileListData = await this.generateUpdatedFileListData(files);
            const jsonString = JSON.stringify(fileListData, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'files.json';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📥 已生成最新的 files.json 文件，请下载并替换 js/files.json');
            
            // 显示提示信息
            this.showUpdateNotification();
        } catch (error) {
            console.error('生成文件列表失败:', error);
        }
    }
    
    // 显示文件更新提示
    showUpdateNotification() {
        // 创建提示元素
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
        `;
        notification.innerHTML = `
            <strong>📥 文件列表已更新</strong><br>
            已下载最新的 files.json，请替换 js/files.json 文件
        `;
        
        document.body.appendChild(notification);
        
        // 5秒后自动消失
        setTimeout(() => {            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    // 检查并更新文件列表
    async checkAndUpdateFileList(currentFiles) {
        try {
            // 尝试获取现有的 files.json
            const response = await fetch('js/files.json');
            if (response.ok) {
                const existingData = await response.json();
                const existingFiles = existingData.files ? existingData.files.map(f => f.filename) : [];
                
                // 比较文件列表
                const hasChanges = this.compareFileLists(currentFiles, existingFiles);
                
                if (hasChanges) {
                    console.log('🔄 检测到文件列表变更，准备更新 files.json');
                    await this.downloadUpdatedFileList(currentFiles);
                } else {
                    console.log('✅ 文件列表无变化');
                }
            } else {
                console.log('📝 首次创建 files.json');
                await this.downloadUpdatedFileList(currentFiles);
            }
        } catch (error) {
            console.warn('检查文件列表时出错:', error);
            // 如果检查失败，仍然生成新的文件列表
            await this.downloadUpdatedFileList(currentFiles);
        }
    }
    
    // 比较两个文件列表是否有差异
    compareFileLists(current, existing) {
        if (current.length !== existing.length) {
            return true;
        }
        
        // 排序后比较
        const sortedCurrent = [...current].sort();
        const sortedExisting = [...existing].sort();
        
        for (let i = 0; i < sortedCurrent.length; i++) {
            if (sortedCurrent[i] !== sortedExisting[i]) {
                return true;
            }
        }
          return false;
    }
    
    // 加载所有Markdown文件
    async loadArticles() {
        // 使用之前在 forceUpdateFileList 中已经获取并缓存的文件列表
        let markdownFiles = this.getCachedFileList();
        
        // 如果缓存中没有文件列表，则通过动态扫描获取
        if (!markdownFiles || markdownFiles.length === 0) {
            console.log('缓存中没有文件列表，重新获取...');
            markdownFiles = await this.getMarkdownFileList();
        } else {
            console.log(`使用已缓存的文件列表: ${markdownFiles.length} 个文件`);
        }
          if (markdownFiles.length === 0) {
            console.log('没有找到 Markdown 文件');
            this.articles = [];
            return;
        }
        
        const loadPromises = markdownFiles.map(async (filename) => {
            try {
                const response = await fetch(`Vault/${filename}`);
                if (response.ok) {
                    const content = await response.text();
                    return this.parseMarkdownFile(filename, content);
                } else {
                    console.warn(`无法加载文件: ${filename}`);
                    return null;
                }
            } catch (error) {
                console.warn(`加载文件 ${filename} 时出错:`, error);
                return null;
            }
        });        const results = await Promise.all(loadPromises);
        this.articles = results.filter(article => article !== null);
        this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`✅ 成功加载了 ${this.articles.length} 篇文章`);
        
        // 构建搜索索引
        if (typeof buildSearchIndex === 'function') {
            buildSearchIndex(this.articles);
        }

    }// 解析Markdown文件
    parseMarkdownFile(filename, content) {
        const title = this.extractTitle(content, filename);
        const category = CategoryUtil.extractCategory(filename);
        const date = new Date().toISOString().split('T')[0];
        const excerpt = this.extractExcerpt(content);

        return {
            id: filename.replace('.md', ''),
            title,
            filename,
            content,
            category,
            date,
            excerpt
        };
    }

    // 提取标题
    extractTitle(content, filename) {
        // 获取文档的第一行作为标题
        const lines = content.split('\n');
        
        for (let line of lines) {
            const trimmedLine = line.trim();
            
            // 跳过空行
            if (trimmedLine === '') {
                continue;
            }
            
            // 如果第一行是标题格式（# 开头），提取标题内容
            if (trimmedLine.startsWith('#')) {
                return trimmedLine.replace(/^#+\s*/, '').trim();
            }
            
            // 否则直接使用第一行非空内容作为标题
            return trimmedLine;
        }
        
        // 如果文档为空，使用文件名作为后备标题
        return filename.replace('.md', '').replace(/-/g, ' ');
    }    // 提取分类函数已移至 category.js

    // 提取摘要
    extractExcerpt(content) {
        const text = content
            .replace(/^#+\s+.+$/gm, '')
            .replace(/\$\$[\s\S]*?\$\$/g, '[数学公式]')
            .replace(/\$[^$\n]+\$/g, '[公式]')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[.*?\]\(.*?\)/g, '$1')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`(.+?)`/g, '$1')
            .replace(/\n+/g, ' ')
            .trim();
        
        return text.length > 150 ? text.substring(0, 150) + '...' : text;
    }

    // 渲染侧边栏
    renderSidebar() {
        this.renderArticleList();
        this.renderCategoryList();
    }

    // 渲染文章列表
    renderArticleList() {
        const articleList = document.getElementById('article-list');
        
        if (this.articles.length === 0) {
            articleList.innerHTML = '<li class="error">暂无文章</li>';
            return;
        }

        const html = this.articles.map(article => `
            <li>
                <a href="#" class="article-link" onclick="blog.showArticle('${article.id}')">
                    ${article.title}
                </a>
            </li>
        `).join('');

        articleList.innerHTML = html;
    }

    // 渲染分类列表
    renderCategoryList() {
        const categories = [...new Set(this.articles.map(article => article.category))];
        const categoryList = document.getElementById('category-list');

        if (categories.length === 0) {
            categoryList.innerHTML = '<li class="error">暂无分类</li>';
            return;
        }

        const html = categories.map(category => {
            const count = this.articles.filter(article => article.category === category).length;
            return `
                <li>
                    <a href="#" class="category-link" onclick="blog.filterByCategory('${category}')">
                        ${category} (${count})
                    </a>
                </li>
            `;
        }).join('');

        categoryList.innerHTML = html;
    }
    
    // 渲染首页视图
    renderHomeView() {
        const recentList = document.getElementById('recent-list');
        // 显示全部文章而不只是前5篇
        const recentArticles = this.articles;

        if (recentArticles.length === 0) {
            recentList.innerHTML = '<div class="error">暂无文章</div>';
            return;
        }        const html = recentArticles.map(article => `
            <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                <h4>${article.title}</h4>
                <p>${article.excerpt}</p>
            </div>
        `).join('');

        recentList.innerHTML = html;
    }

    // 显示文章
    async showArticle(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (!article) {
            this.showError('文章未找到');
            return;
        }

        this.currentArticle = article;
        this.switchView('article');
        
        // 更新侧边栏活跃状态
        document.querySelectorAll('.article-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[onclick="blog.showArticle('${articleId}')"]`)?.classList.add('active');

        // 渲染Markdown内容
        try {
            const contentDiv = document.getElementById('article-content');
            contentDiv.innerHTML = '<div class="loading">正在渲染文章...</div>';
            
            // 预处理Markdown内容（修复标题格式）
            let processedContent = this.preprocessMarkdown(article.content);
            
            // 预处理KaTeX数学公式
            processedContent = this.preprocessMath(processedContent);
            
            // 配置marked.js选项
            marked.setOptions({
                gfm: true,
                breaks: false,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false            });
            
            // 使用marked.js渲染Markdown
            const htmlContent = marked.parse(processedContent);
            contentDiv.innerHTML = htmlContent;
            
            // 处理图片路径
            this.processImages(contentDiv);
            
            // 处理表格 - 添加横向滚动容器
            this.processTables(contentDiv);
            
            // 渲染KaTeX数学公式
            this.renderMath(contentDiv);
              // 生成目录
            this.generateTableOfContents(contentDiv);
            
            // 显示目录切换按钮（在移动端）
            this.updateTocButtonVisibility(true);
            
        } catch (error) {
            console.error('渲染文章失败:', error);            this.showError('文章渲染失败');
        }
    }
    
    // 预处理Markdown内容（修复标题格式和Obsidian图片语法）
    preprocessMarkdown(content) {
        // 1. 处理 Obsidian 图片语法
        content = this.processObsidianImages(content);
        
        // 2. 确保标题前有空行（除了文档开头）
        // 匹配标题行（# ## ### 等）
        const lines = content.split('\n');
        const processedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const currentLine = lines[i];
            const previousLine = i > 0 ? lines[i - 1] : '';
            
            // 检查当前行是否是标题
            const isHeading = /^#{1,6}\s+/.test(currentLine.trim());
            
            if (isHeading && i > 0) {
                // 检查前一行是否为空
                const prevLineIsEmpty = previousLine.trim() === '';
                
                // 如果前一行不为空，添加一个空行
                if (!prevLineIsEmpty) {
                    processedLines.push('');
                }
            }
            
            processedLines.push(currentLine);
        }
        
        return processedLines.join('\n');
    }

    // 处理 Obsidian 图片语法
    processObsidianImages(content) {
        // 匹配 Obsidian 格式图片引用: ![[attachments/filename.png]] 或 ![[filename.png]]
        const obsidianImageRegex = /!\[\[(attachments\/)?([^\]]+\.(png|jpg|jpeg|gif|svg|webp|bmp|tiff))\]\]/gi;
          return content.replace(obsidianImageRegex, (match, attachmentsPath, filename, extension) => {
            // 构建图片路径
            let imagePath;
            
            if (attachmentsPath) {
                // 如果已经包含 attachments/ 路径
                imagePath = BlogConfig.getAttachmentPath(filename);
            } else {
                // 如果只有文件名，添加 attachments/ 前缀
                imagePath = BlogConfig.getAttachmentPath(filename);
            }
            
            // 处理文件名中的空格，进行 URL 编码
            imagePath = imagePath.replace(/\s+/g, '%20');
            
            // 生成图片的 alt 文本（使用文件名，去掉扩展名）
            const altText = filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
            
            // 转换为标准 Markdown 图片语法
            return `![${altText}](${imagePath})`;
        });
    }

    // 预处理数学公式
    preprocessMath(content) {
        // 创建一个临时标记来保护块级公式
        const blockMathPlaceholders = [];
        let placeholderIndex = 0;
        
        // 先处理块级数学公式 $$...$$ 并用占位符替换
        content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
            const placeholder = `__BLOCK_MATH_${placeholderIndex}__`;
            blockMathPlaceholders.push({
                placeholder,
                content: `<div class="math-block">${formula}</div>`
            });
            placeholderIndex++;
            return placeholder;
        });
        
        // 然后处理行内数学公式 $...$ (现在不会与块级公式冲突)
        content = content.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
            return `<span class="math-inline">${formula}</span>`;
        });
        
        // 最后恢复块级公式
        blockMathPlaceholders.forEach(item => {
            content = content.replace(item.placeholder, item.content);
        });
        
        return content;
    }

    // 渲染KaTeX数学公式
    renderMath(container) {
        // 检查KaTeX是否加载
        if (typeof katex === 'undefined') {
            console.warn('KaTeX未加载，跳过数学公式渲染');
            return;
        }

        // 渲染行内数学公式
        const inlineMath = container.querySelectorAll('.math-inline');
        inlineMath.forEach(element => {
            try {
                const formula = element.textContent;
                katex.render(formula, element, {
                    displayMode: false,
                    throwOnError: false,
                    errorColor: '#e74c3c'
                });
            } catch (error) {
                console.warn('行内数学公式渲染失败:', error);
                element.innerHTML = `<span class="katex-error">数学公式错误: ${element.textContent}</span>`;
            }
        });

        // 渲染块级数学公式
        const blockMath = container.querySelectorAll('.math-block');
        blockMath.forEach(element => {
            try {
                const formula = element.textContent;
                katex.render(formula, element, {
                    displayMode: true,
                    throwOnError: false,
                    errorColor: '#e74c3c'
                });
            } catch (error) {
                console.warn('块级数学公式渲染失败:', error);
                element.innerHTML = `<div class="katex-error">数学公式错误: ${element.textContent}</div>`;
            }
        });

        // 使用auto-render处理剩余的数学公式（备用方案）
        if (typeof renderMathInElement !== 'undefined') {
            try {
                renderMathInElement(container, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false,
                    errorColor: '#e74c3c'
                });        } catch (error) {
                console.warn('auto-render数学公式渲染失败:', error);
            }
        }
    }

    // 生成目录
    generateTableOfContents(container) {
        const tocContainer = document.getElementById('table-of-contents');
        if (!tocContainer) return;

        // 查找所有标题元素
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        if (headings.length === 0) {
            tocContainer.innerHTML = '<div class="toc-placeholder">本文章无标题结构</div>';
            return;
        }

        // 为每个标题添加ID（如果没有的话）
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
        });

        // 生成目录HTML
        let tocHTML = '<ul>';
        let currentLevel = 0;

        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            const text = heading.textContent.trim();
            const id = heading.id;

            // 处理层级变化
            if (level > currentLevel) {
                // 需要增加层级
                for (let i = currentLevel; i < level - 1; i++) {
                    tocHTML += '<ul>';
                }
                if (currentLevel > 0) {
                    tocHTML += '<ul>';
                }
            } else if (level < currentLevel) {
                // 需要减少层级
                for (let i = level; i < currentLevel; i++) {
                    tocHTML += '</ul></li>';
                }
            } else if (currentLevel > 0) {
                // 同级，关闭上一个li
                tocHTML += '</li>';
            }

            // 添加当前标题
            tocHTML += `<li><a href="#${id}" class="toc-h${level}" onclick="return blog.scrollToHeading('${id}')">${text}</a>`;
            currentLevel = level;
        });

        // 关闭所有未关闭的标签
        for (let i = 1; i < currentLevel; i++) {
            tocHTML += '</ul></li>';
        }
        if (currentLevel > 0) {
            tocHTML += '</li>';
        }
        tocHTML += '</ul>';
        
        tocContainer.innerHTML = tocHTML;

        // 更新目录计数
        this.updateTocCount(headings.length);

        // 显示阅读进度条
        this.showReadingProgress();

        // 监听滚动事件，高亮当前标题
        this.setupTocScrollSpy(headings);
    }

    // 滚动到指定标题
    scrollToHeading(headingId) {
        const heading = document.getElementById(headingId);
        if (heading) {
            // 计算偏移量（考虑固定头部）
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = heading.offsetTop;
            const offsetPosition = elementPosition - headerHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // 更新目录高亮
            this.updateTocActiveState(headingId);
        }
        return false; // 阻止默认锚点跳转
    }

    // 设置目录滚动监听
    setupTocScrollSpy(headings) {
        if (this.scrollSpyHandler) {
            window.removeEventListener('scroll', this.scrollSpyHandler);
        }        this.scrollSpyHandler = () => {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const scrollPosition = window.scrollY + headerHeight + 50;

            // 计算阅读进度
            this.updateReadingProgress();

            // 更新返回顶部按钮
            this.updateBackToTopButton();

            let activeHeading = null;
            
            // 找到当前可见的标题
            for (let i = headings.length - 1; i >= 0; i--) {
                if (headings[i].offsetTop <= scrollPosition) {
                    activeHeading = headings[i];
                    break;
                }
            }

            if (activeHeading) {
                this.updateTocActiveState(activeHeading.id);
            }
        };

        window.addEventListener('scroll', this.scrollSpyHandler, { passive: true });
    }

    // 更新目录高亮状态
    updateTocActiveState(activeId) {
        // 移除所有active类
        document.querySelectorAll('.toc-nav a').forEach(link => {
            link.classList.remove('active');
        });

        // 添加active类到当前标题
        const activeLink = document.querySelector(`.toc-nav a[href="#${activeId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // 清理目录
    clearTableOfContents() {
        const tocContainer = document.getElementById('table-of-contents');
        if (tocContainer) {
            tocContainer.innerHTML = '<div class="toc-placeholder">阅读文章时将显示目录</div>';
        }

        // 重置目录计数
        this.updateTocCount(0);

        // 隐藏阅读进度条
        this.hideReadingProgress();

        // 移除滚动监听
        if (this.scrollSpyHandler) {
            window.removeEventListener('scroll', this.scrollSpyHandler);
            this.scrollSpyHandler = null;
        }
    }    // 更新目录计数
    updateTocCount(count) {
        const tocCount = document.getElementById('toc-count');
        
        if (tocCount) {
            if (count > 0) {
                tocCount.textContent = count;
                tocCount.style.display = 'inline-block';
            } else {
                tocCount.style.display = 'none';
            }
        }
    }

    // 返回顶部
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 更新返回顶部按钮显示状态
    updateBackToTopButton() {
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            const scrollTop = window.scrollY;
            const showThreshold = 300;
              if (scrollTop > showThreshold) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }
    
    // 处理图片路径（增强版，集成 ImageFixUtil）
    processImages(container) {
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');            if (src && !src.startsWith('http') && !src.startsWith('/')) {
                let newSrc = src;
                
                // 基本路径处理
                if (src.startsWith('attachments/')) {
                    newSrc = `${BlogConfig.contentDir}/${src}`;
                } else if (!src.startsWith(`${BlogConfig.contentDir}/`)) {
                    newSrc = BlogConfig.getAttachmentPath(src);
                }
                
                // 使用 ImageFixUtil 进一步优化路径
                if (typeof ImageFixUtil !== 'undefined') {
                    newSrc = ImageFixUtil.fixImagePath(newSrc);
                }
                
                img.setAttribute('src', newSrc);
                
                // 添加加载错误处理
                if (!img.hasAttribute('data-error-handled')) {
                    this.addImageErrorHandler(img);
                    img.setAttribute('data-error-handled', 'true');
                }
            }
        });
        
        // 如果 ImageFixUtil 可用，执行额外的图片修复
        if (typeof ImageFixUtil !== 'undefined') {
            ImageFixUtil.scanAndFixImages();
        }
    }

    // 为图片添加错误处理
    addImageErrorHandler(img) {
        const originalSrc = img.getAttribute('src');
        
        img.addEventListener('error', (e) => {            if (!img.hasAttribute('data-error-retry')) {
                img.setAttribute('data-error-retry', 'true');
                
                // 尝试替代路径
                const filename = originalSrc.split('/').pop();
                const alternativePaths = [
                    BlogConfig.getAttachmentPath(filename),
                    `${BlogConfig.attachmentsDir}/${filename}`,
                    BlogConfig.getAttachmentPath(encodeURIComponent(filename))
                ];
                
                // 尝试第一个替代路径
                if (alternativePaths.length > 0) {
                    const newPath = alternativePaths[0];
                    if (newPath !== originalSrc) {
                        console.log(`图片加载失败，尝试替代路径: "${originalSrc}" -> "${newPath}"`);
                        img.src = newPath;
                        return;
                    }
                }
            }
            
            // 如果重试失败，显示错误占位符
            this.showImageErrorPlaceholder(img, originalSrc);
        }, { once: true });
    }

    // 显示图片错误占位符
    showImageErrorPlaceholder(img, originalSrc) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error-placeholder';
        errorDiv.innerHTML = `
            <div style="
                border: 2px dashed #e74c3c;
                padding: 20px;
                background: #fdf2f2;
                color: #e74c3c;
                border-radius: 8px;
                text-align: center;
                font-family: monospace;
                font-size: 12px;
                margin: 20px 0;
            ">
                <div style="margin-bottom: 10px;">
                    <strong>❌ 图片加载失败</strong>
                </div>
                <div style="word-break: break-all; margin-bottom: 10px;">
                    路径: ${originalSrc}
                </div>
                <div style="font-size: 11px;">
                    请检查图片文件是否存在于正确位置
                </div>
            </div>
        `;
        
        if (img.parentNode) {
            img.parentNode.replaceChild(errorDiv, img);
        }
    }

    // 处理表格 - 添加横向滚动容器
    processTables(container) {
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
            // 检查表格是否已经被容器包装
            if (!table.parentElement.classList.contains('table-container')) {
                // 创建表格容器
                const tableContainer = document.createElement('div');
                tableContainer.classList.add('table-container');
                
                // 将表格包装在容器中
                table.parentNode.insertBefore(tableContainer, table);
                tableContainer.appendChild(table);            }
        });
    }
    
    // 按分类过滤
    filterByCategory(category) {
        const filteredArticles = this.articles.filter(article => article.category === category);
        this.showCategoryView(filteredArticles, category);
    }    // 显示分类视图
    showCategoryView(articles, category) {        this.switchView('category');
        this.clearActiveLinks();
        this.clearTableOfContents();
        
        const contentDiv = document.getElementById('category-content');
        
        const html = `
            <h1>分类: ${category}</h1>
            <p class="category-description">共 ${articles.length} 篇文章</p>
            <div class="article-grid">
                ${articles.map(article => `
                    <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    // 显示过滤后的文章
    showFilteredArticles(articles, title) {
        this.switchView('article');
        const contentDiv = document.getElementById('article-content');
        
        const html = `
            <h1>${title}</h1>
            <div class="article-grid">
                ${articles.map(article => `
                    <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                        <div class="date">${article.date}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }
      // 显示首页
    showHome() {
        this.switchView('home');
        this.clearActiveLinks();
        this.clearTableOfContents();
    }// 显示关于页面
    showAbout() {
        this.switchView('about');
        this.clearActiveLinks();
        this.clearTableOfContents();
    }
    
    // 切换视图
    switchView(viewName) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');
        
        // 更新body的class来控制布局和目录显示
        document.body.className = document.body.className.replace(/view-\w+/g, '');
        document.body.classList.add(`view-${viewName}`);
        
        this.currentView = viewName;
    }

    // 清除活跃链接
    clearActiveLinks() {
        document.querySelectorAll('.article-link').forEach(link => {
            link.classList.remove('active');
        });
    }

    // 显示错误信息
    showError(message) {
        const contentDiv = document.getElementById('article-content');
        contentDiv.innerHTML = `<div class="error">${message}</div>`;
        this.switchView('article');
    }
    
    // 搜索功能
    search(query) {
        if (!query.trim()) {
            this.showHome();
            return;
        }

        const results = this.articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase())
        );

        this.showSearchView(results, query);
    }    // 显示搜索视图
    showSearchView(articles, query) {
        this.switchView('search');
        this.clearActiveLinks();
        this.clearTableOfContents();
        
        const contentDiv = document.getElementById('search-content');
        
        const html = `
            <h1>搜索结果: "${query}"</h1>
            <p class="search-description">找到 ${articles.length} 篇相关文章</p>
            <div class="article-grid">
                ${articles.length > 0 ? articles.map(article => `
                    <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                        <div class="date">${article.date}</div>
                        <div class="category-tag">${article.category}</div>
                    </div>
                `).join('') : '<div class="no-results">没有找到相关文章</div>'}
            </div>
        `;
        
        contentDiv.innerHTML = html;
    }

    // 更新阅读进度
    updateReadingProgress() {
        const progressContainer = document.getElementById('reading-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (!progressContainer || !progressFill || !progressPercentage) return;

        // 计算页面总高度和当前滚动位置
        const articleContent = document.getElementById('article-content');
        if (!articleContent) return;

        const headerHeight = document.querySelector('.header').offsetHeight;
        const windowHeight = window.innerHeight;
        const documentHeight = articleContent.offsetHeight;
        const scrollTop = window.scrollY;

        // 计算可阅读区域
        const readableHeight = documentHeight - windowHeight + headerHeight;
        const scrollProgress = Math.max(0, scrollTop - headerHeight);
        
        // 计算进度百分比
        let percentage = 0;
        if (readableHeight > 0) {
            percentage = Math.min(100, Math.max(0, (scrollProgress / readableHeight) * 100));
        }

        // 更新进度条和百分比显示
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }

    // 显示阅读进度条
    showReadingProgress() {
        const progressContainer = document.getElementById('reading-progress');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }    // 隐藏阅读进度条
    hideReadingProgress() {
        const progressContainer = document.getElementById('reading-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }    // 初始化响应式侧边栏
    initResponsiveSidebar() {
        this.setupSidebarToggle();
        this.setupResponsiveBreakpoints();
        
        // 防抖处理窗口大小变化
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 150); // 150ms防抖
        });
        
        // 初始检查
        this.handleWindowResize();
    }// 设置侧边栏切换功能
    setupSidebarToggle() {
        // 获取已存在的侧边栏切换按钮
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            // 移除可能已存在的事件监听器，避免重复绑定
            toggleBtn.removeEventListener('click', this.toggleSidebarHandler);
            
            // 创建绑定的事件处理函数
            this.toggleSidebarHandler = () => {
                this.toggleSidebar();
            };
            
            // 绑定新的点击事件
            toggleBtn.addEventListener('click', this.toggleSidebarHandler);
            
            console.log('侧边栏切换按钮事件已绑定');
        } else {
            console.warn('未找到侧边栏切换按钮');
        }
    }// 切换侧边栏遮罩层
    toggleSidebarOverlay() {
        let overlay = document.getElementById('sidebar-overlay');
        
        // 创建遮罩层（如果不存在）
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
            document.body.appendChild(overlay);
        }
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('mobile-visible')) {
            overlay.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
        }
    }// 关闭侧边栏
    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-visible');
        }
        if (overlay) {
            overlay.classList.remove('visible');
        }
    }    // 初始化侧边栏状态
    initSidebarState() {
        // 确保响应式断点已设置
        if (!this.breakpoints) {
            this.setupResponsiveBreakpoints();
        }
        
        // 应用初始状态
        this.applySidebarState();
        
        console.log(`侧边栏初始状态: ${this.sidebarHidden ? '隐藏' : '显示'}`);
    }    // 应用侧边栏状态
    applySidebarState() {
        const body = document.body;
        const width = window.innerWidth;
        
        // 只有在桌面端才应用sidebar-hidden状态
        if (width > this.breakpoints.tablet) {
            if (this.sidebarHidden) {
                body.classList.add('sidebar-hidden');
                console.log('应用桌面端侧边栏隐藏状态');
            } else {
                body.classList.remove('sidebar-hidden');
                console.log('显示桌面端侧边栏');
            }
        } else {
            // 移动端和平板端强制清除sidebar-hidden状态
            body.classList.remove('sidebar-hidden');
            console.log('清除非桌面端的sidebar-hidden状态');
        }
    }    // 切换侧边栏显示/隐藏（智能检测屏幕大小）
    toggleSidebar() {
        const width = window.innerWidth;
        
        console.log(`切换侧边栏，当前屏幕宽度: ${width}px`);
        
        if (width <= this.breakpoints.tablet) {
            // 移动端和平板端：使用浮动侧边栏逻辑
            console.log('使用移动端侧边栏逻辑');
            this.toggleMobileSidebar();
        } else {
            // 桌面端：使用隐藏侧边栏逻辑
            console.log('使用桌面端侧边栏逻辑');
            this.toggleDesktopSidebar();
        }
    }

    // 切换移动端浮动侧边栏
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('mobile-visible');
            this.toggleSidebarOverlay();
        }
    }    // 切换桌面端侧边栏隐藏状态
    toggleDesktopSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
        
        // 保存状态到localStorage
        localStorage.setItem('sidebar-hidden', this.sidebarHidden.toString());
        
        // 应用状态
        this.applySidebarState();
        
        console.log(`侧边栏${this.sidebarHidden ? '已隐藏' : '已显示'}`);
    }

    // 切换侧边栏遮罩层（移动端）
    toggleSidebarOverlay() {
        let overlay = document.getElementById('sidebar-overlay');
        
        // 创建遮罩层（如果不存在）
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
            document.body.appendChild(overlay);
        }
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('mobile-visible')) {
            overlay.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
        }
    }    // 设置响应式断点
    setupResponsiveBreakpoints() {
        this.breakpoints = {
            mobile: 767,
            tablet: 899,
            smallDesktop: 1023,
            desktop: 1199
        };
    }    // 处理窗口大小变化
    handleWindowResize() {
        const width = window.innerWidth;
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const body = document.body;
        
        // 清理防止状态冲突
        this.closeSidebar(); // 清除移动端浮动状态
        this.clearAllSidebarStates(); // 清除所有状态类
        
        if (width <= this.breakpoints.mobile) {
            // 移动端：显示切换按钮，侧边栏变为浮动
            if (toggleBtn) {
                toggleBtn.style.display = 'block';
            }
            body.classList.add('mobile-layout');
            body.classList.remove('tablet-layout', 'desktop-layout');
        } else if (width <= this.breakpoints.tablet) {
            // 平板端：显示切换按钮，侧边栏变为浮动
            if (toggleBtn) {
                toggleBtn.style.display = 'block';
            }
            body.classList.add('tablet-layout');
            body.classList.remove('mobile-layout', 'desktop-layout');
        } else {
            // 桌面端：显示切换按钮，支持侧边栏隐藏功能
            if (toggleBtn) {
                toggleBtn.style.display = 'block';
            }
            body.classList.add('desktop-layout');
            body.classList.remove('mobile-layout', 'tablet-layout');
            
            // 只在桌面端应用侧边栏隐藏状态
            setTimeout(() => {
                this.applySidebarState();
            }, 100); // 延迟应用，避免与CSS过渡冲突
        }
        
        // 同时检查目录按钮的显示
        this.updateTocButtonVisibility();
    }
    
    // 清除所有侧边栏状态类
    clearAllSidebarStates() {
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        
        // 清除桌面端隐藏状态
        body.classList.remove('sidebar-hidden');
        
        // 清除移动端可见状态
        if (sidebar) {
            sidebar.classList.remove('mobile-visible');
        }
        
        // 清除遮罩层
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
        }
    }

    // 切换目录侧边栏显示状态
    toggleTocSidebar() {
        const tocSidebar = document.querySelector('.toc-sidebar');
        if (tocSidebar) {
            tocSidebar.classList.toggle('mobile-visible');
            
            // 添加目录遮罩层
            this.toggleTocOverlay();
        }
    }

    // 切换目录遮罩层
    toggleTocOverlay() {
        let overlay = document.getElementById('toc-overlay');
        
        // 创建遮罩层（如果不存在）
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'toc-overlay';
            overlay.className = 'toc-overlay';
            overlay.addEventListener('click', () => {
                this.closeTocSidebar();
            });
            document.body.appendChild(overlay);
        }
        
        const tocSidebar = document.querySelector('.toc-sidebar');
        if (tocSidebar && tocSidebar.classList.contains('mobile-visible')) {
            overlay.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
        }
    }

    // 关闭目录侧边栏
    closeTocSidebar() {
        const tocSidebar = document.querySelector('.toc-sidebar');
        const overlay = document.getElementById('toc-overlay');
        
        if (tocSidebar) {
            tocSidebar.classList.remove('mobile-visible');
        }
        if (overlay) {
            overlay.classList.remove('visible');
        }
    }

    // 更新目录切换按钮的显示状态
    updateTocButtonVisibility(isArticlePage = false) {
        const tocToggleBtn = document.getElementById('toc-toggle');
        const width = window.innerWidth;
        
        if (!tocToggleBtn) return;
        
        // 只在文章页面且屏幕较小时显示目录切换按钮
        if (isArticlePage && width <= 899) {
            tocToggleBtn.style.display = 'block';
        } else {
            tocToggleBtn.style.display = 'none';
            // 同时关闭可能打开的目录栏
            this.closeTocSidebar();
        }
    }
}

// 全局函数，供HTML调用
function showHome() {
    blog.showHome();
}

function showAbout() {
    blog.showAbout();
}

function toggleTocSidebar() {
    if (blog) {
        blog.toggleTocSidebar();
    }
}

// 初始化博客应用
let blog;
document.addEventListener('DOMContentLoaded', () => {
    blog = new BlogApp();
    initTheme(); // 初始化主题
    
    // 初始化图片修复工具
    if (typeof ImageFixUtil !== 'undefined') {
        ImageFixUtil.init({
            debug: BlogConfig.debug.enabled,
            imageBaseDir: BlogConfig.getAttachmentsDirPath() + '/',
            autoFix: true,
            checkInterval: 3000 // 3秒检查一次
        });
        console.log('✅ ImageFixUtil 已集成到博客系统');
    } else {
        console.warn('⚠️ ImageFixUtil 未加载，图片处理功能受限');
    }
});

// 添加键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl+K 或 Cmd+K 打开搜索
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            const query = prompt('请输入搜索关键词:');
            if (query) {
                if (typeof searchEngine !== 'undefined' && searchEngine) {
                    searchEngine.performSearch(query);
                } else {
                    blog.search(query);
                }
            }
        }
    }
});





// 添加清除缓存功能
function clearBlogCache() {
    try {
        localStorage.removeItem(BlogConfig.cache.filesKey);
        console.log('博客缓存已清除');
        alert('缓存已清除，页面将重新加载');
        location.reload();
    } catch (error) {
        console.error('清除缓存失败:', error);
        alert('清除缓存失败: ' + error.message);
    }
}
