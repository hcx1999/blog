// 主题切换功能
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const lightTheme = document.getElementById('prism-light-theme');
    const darkTheme = document.getElementById('prism-dark-theme');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
        // 切换到浅色代码主题
        if (lightTheme) lightTheme.disabled = false;
        if (darkTheme) darkTheme.disabled = true;
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
        // 切换到深色代码主题
        if (lightTheme) lightTheme.disabled = true;
        if (darkTheme) darkTheme.disabled = false;
    }
    
    // 重新高亮所有代码块以适应新主题
    setTimeout(() => {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }, 100);
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const lightTheme = document.getElementById('prism-light-theme');
    const darkTheme = document.getElementById('prism-dark-theme');
    
    if (!themeToggle) return; // 防止在页面未完全加载时出错
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        // 设置深色代码主题
        if (lightTheme) lightTheme.disabled = true;
        if (darkTheme) darkTheme.disabled = false;
    } else {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
        // 设置浅色代码主题
        if (lightTheme) lightTheme.disabled = false;
        if (darkTheme) darkTheme.disabled = true;
    }
}

// 博客应用主类
class BlogApp {
    constructor(pageType) {
        this.pageType = pageType || document.body.getAttribute('data-page') || 'home';
        this.articles = [];
        this.currentView = this.pageType;
        this.currentArticle = null;
        this.assetBasePath = this.computeAssetBasePath();
        this.pageBasePath = this.computePageBasePath();
        this.checkProtocol(); // 检查协议
    }

    computeAssetBasePath() {
        const path = window.location.pathname;
        const pagesIndex = path.indexOf('/pages/');

        if (pagesIndex === -1) {
            return '';
        }

        const depth = this.calculatePagesDepth(path);
        return '../'.repeat(depth + 1);
    }

    computePageBasePath() {
        const path = window.location.pathname;
        const pagesIndex = path.indexOf('/pages/');

        if (pagesIndex === -1) {
            return 'pages/';
        }

        const depth = this.calculatePagesDepth(path);
        return depth === 0 ? '' : '../'.repeat(depth);
    }

    calculatePagesDepth(path) {
        const pagesSegment = '/pages/';
        const pagesIndex = path.indexOf(pagesSegment);

        if (pagesIndex === -1) {
            return 0;
        }

        const suffix = path.slice(pagesIndex + pagesSegment.length);
        if (!suffix) {
            return 0;
        }

        const segments = suffix.split('/').filter(Boolean);
        if (segments.length === 0) {
            return 0;
        }

        if (segments[segments.length - 1].includes('.')) {
            return segments.length - 1;
        }

        return segments.length;
    }

    resolveAssetPath(relativePath) {
        if (/^(?:[a-z]+:)?\/\//i.test(relativePath) || relativePath.startsWith('../') || relativePath.startsWith('/')) {
            return relativePath;
        }
        return `${this.assetBasePath}${relativePath}`;
    }

    resolvePagePath(page) {
        if (/^(?:[a-z]+:)?\/\//i.test(page) || page.startsWith('../') || page.startsWith('/')) {
            return page;
        }
        const normalized = this.normalizePagePath(page);
        return `${this.pageBasePath}${normalized}`;
    }

    normalizePagePath(page) {
        if (!page) {
            return '';
        }

        const cleaned = page.replace(/^\.\//, '');

        const mapping = {
            'index.html': '',
            'about.html': 'about/',
            'category.html': 'category/',
            'article.html': 'article/',
            'search.html': 'search/'
        };

        if (mapping.hasOwnProperty(cleaned)) {
            return mapping[cleaned];
        }

        if (!cleaned.includes('.') && !cleaned.endsWith('/')) {
            return `${cleaned}/`;
        }

        return cleaned;
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
    }

    async init(pageType) {
        if (pageType) {
            this.pageType = pageType;
        } else if (!this.pageType) {
            this.pageType = document.body.getAttribute('data-page') || 'home';
        }

        console.log('🚀 博客系统初始化开始...');
        console.log('📋 步骤 1: 强制更新文件列表...');
        
        // 每次刷新都先检查并更新文件列表
        await this.forceUpdateFileList();
        
        console.log('📋 步骤 2: 加载文章内容...');
        await this.loadArticles();
        
        console.log('📋 步骤 3: 渲染侧边栏...');
        this.renderSidebar();

    console.log('📋 步骤 4: 渲染页面内容...');
    this.renderPageContent();
        
        // 设置全局滚动监听（确保返回顶部按钮在所有页面都能工作）
        this.setupGlobalScrollListener();
        
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
            const response = await fetch(this.resolveAssetPath('js/files.json'));
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
            const response = await fetch(this.resolveAssetPath('js/files.json'));
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
                const response = await fetch(this.resolveAssetPath(`Vault/${filename}`), { method: 'HEAD' });
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
            const response = await fetch(this.resolveAssetPath('Vault/'));
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
            const response = await fetch(this.resolveAssetPath('js/files.json'));
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
                const response = await fetch(this.resolveAssetPath('Vault/'));
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
                const response = await fetch(this.resolveAssetPath('js/files.json'));
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
                const response = await fetch(this.resolveAssetPath(`Vault/${filename}`), { method: 'HEAD' });
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
            const response = await fetch(this.resolveAssetPath('js/files.json'));
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
                const response = await fetch(this.resolveAssetPath(`Vault/${filename}`));
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
        
        // 更新统计信息
        this.updateStatistics();
        
        // 构建搜索索引
        if (typeof buildSearchIndex === 'function') {
            buildSearchIndex(this.articles);
        }

    }    // 更新统计信息
    updateStatistics() {
        // 更新文章数量
        const articleCountElement = document.getElementById('article-count');
        if (articleCountElement) {
            this.animateCounter(articleCountElement, this.articles.length);
        }

        // 更新分类数量
        const categories = [...new Set(this.articles.map(article => article.category))];
        const categoryCountElement = document.getElementById('category-count');
        if (categoryCountElement) {
            this.animateCounter(categoryCountElement, categories.length);
        }

        console.log(`📊 统计信息已更新: ${this.articles.length} 篇文章, ${categories.length} 个分类`);
    }

    // 数字递增动画
    animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const increment = targetValue > startValue ? 1 : -1;
        const duration = 800; // 动画持续时间
        const steps = Math.abs(targetValue - startValue);
        const stepDuration = steps > 0 ? duration / steps : 0;

        if (steps === 0) {
            element.textContent = targetValue;
            return;
        }

        // 添加动画类
        element.classList.add('updating');
        
        let currentValue = startValue;
        const timer = setInterval(() => {
            currentValue += increment;
            element.textContent = currentValue;
            
            if (currentValue === targetValue) {
                clearInterval(timer);
                element.classList.remove('updating');
                element.classList.add('count-animation');
                
                // 移除动画类
                setTimeout(() => {
                    element.classList.remove('count-animation');
                }, 600);
            }
        }, stepDuration);
    }

    // 解析Markdown文件
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
    }    // 渲染侧边栏
    renderSidebar() {
        this.renderArticleList();
        this.renderCategoryList();
        // 确保统计信息保持更新
        this.updateStatistics();
    }

    // 根据页面类型渲染内容
    renderPageContent() {
        const viewName = this.pageType || 'home';

        switch (viewName) {
            case 'home':
                this.renderHomeView();
                this.switchView('home');
                break;
            case 'article':
                this.prepareArticlePage();
                break;
            case 'category':
                this.prepareCategoryPage();
                break;
            case 'search':
                this.prepareSearchPage();
                break;
            case 'about':
                this.switchView('about');
                this.clearTableOfContents();
                break;
            default:
                this.switchView(viewName);
                break;
        }
    }

    // 准备文章页面
    prepareArticlePage() {
        this.switchView('article');
        const articleId = this.getQueryParam('id');
        const articleFilename = this.getQueryParam('file');

        if (articleId || articleFilename) {
            this.showArticle(articleId || articleFilename, {
                stayOnPage: true,
                filename: articleFilename || undefined
            });
        } else {
            const contentDiv = document.getElementById('article-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<div class="article-placeholder">请选择一篇文章阅读。</div>';
            }
            this.clearTableOfContents();
        }
    }

    // 准备分类页面
    prepareCategoryPage() {
        this.switchView('category');
        const category = this.getQueryParam('name');

        if (category) {
            const filteredArticles = this.articles.filter(article => article.category === category);
            this.showCategoryView(filteredArticles, category, { stayOnPage: true });
        } else {
            this.renderCategoryOverview();
            this.clearTableOfContents();
        }
    }

    // 分类总览
    renderCategoryOverview() {
        const contentDiv = document.getElementById('category-content');
        if (!contentDiv) return;

        const categories = [...new Set(this.articles.map(article => article.category))];

        const html = `
            <h1>所有分类</h1>
            <div class="article-grid">
                ${categories.map(category => {
                    const count = this.articles.filter(article => article.category === category).length;
                    return `
                        <div class="recent-item" onclick="blog.filterByCategory('${category}')">
                            <h4>${category}</h4>
                            <p>${count} 篇文章</p>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        contentDiv.innerHTML = html;
    }

    // 准备搜索页面
    prepareSearchPage() {
        this.switchView('search');
        this.clearTableOfContents();

        const query = this.getQueryParam('q');
        const searchInput = document.getElementById('search-input');
        if (searchInput && query) {
            searchInput.value = query;
        }

        if (query && typeof searchEngine !== 'undefined' && searchEngine) {
            searchEngine.performSearch(query, { stayOnPage: true });
        } else {
            const contentDiv = document.getElementById('search-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<div class="search-placeholder">输入关键词开始搜索。</div>';
            }
        }
    }

    // 获取URL参数
    getQueryParam(name) {
        try {
            const params = new URLSearchParams(window.location.search);
            const value = params.get(name);
            return value ? decodeURIComponent(value) : null;
        } catch (error) {
            console.warn('解析URL参数失败:', error);
            return null;
        }
    }

    // 渲染文章列表
    renderArticleList() {
        const articleList = document.getElementById('article-list');
        if (!articleList) {
            return;
        }
        
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
        if (!categoryList) {
            return;
        }

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
        const homeContent = document.getElementById('home-content');
        if (!homeContent) {
            console.warn('首页容器不存在，跳过渲染');
            return;
        }

        this.clearTableOfContents();
        // 显示全部文章而不只是前5篇
        const recentArticles = this.articles;

        if (recentArticles.length === 0) {
            homeContent.innerHTML = '<div class="error">暂无文章</div>';
            return;
        }
        
        const html = `
            <h1>所有文章</h1>
            <p class="category-description">共 ${recentArticles.length} 篇文章</p>
            <div class="article-grid">
                ${recentArticles.map(article => `
                    <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                    </div>
                `).join('')}
            </div>
        `;

        homeContent.innerHTML = html;
    }

    findArticleByIdentifiers(id, filename) {
        if (!Array.isArray(this.articles) || this.articles.length === 0) {
            return null;
        }

        const candidates = new Set();

        if (typeof id === 'string' && id.trim()) {
            const trimmedId = id.trim();
            candidates.add(trimmedId);
            candidates.add(trimmedId.replace(/\.md$/i, ''));
        }

        if (typeof filename === 'string' && filename.trim()) {
            const trimmedFilename = filename.trim();
            candidates.add(trimmedFilename);
            candidates.add(trimmedFilename.replace(/\.md$/i, ''));
        }

        for (const key of candidates) {
            if (!key) continue;
            const found = this.articles.find(article => {
                const filename = typeof article.filename === 'string' ? article.filename : '';
                const filenameWithoutExt = filename.replace(/\.md$/i, '');
                return article.id === key || filename === key || filenameWithoutExt === key;
            });
            if (found) {
                return found;
            }
        }

        return null;
    }

    async loadSingleArticle(filename) {
        if (!filename || typeof filename !== 'string') {
            return null;
        }

        const normalizedFilename = filename.trim();
        if (!normalizedFilename) {
            return null;
        }

        // 如果文章已经存在则直接返回
        const existing = this.findArticleByIdentifiers(normalizedFilename, normalizedFilename);
        if (existing) {
            return existing;
        }

        try {
            const response = await fetch(this.resolveAssetPath(`Vault/${encodeURIComponent(normalizedFilename)}`));
            if (!response.ok) {
                console.warn(`无法按需加载文章文件: ${normalizedFilename}`);
                return null;
            }

            const content = await response.text();
            const article = this.parseMarkdownFile(normalizedFilename, content);

            this.articles.push(article);
            this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.renderSidebar();

            if (typeof buildSearchIndex === 'function') {
                buildSearchIndex(this.articles);
            }

            return article;
        } catch (error) {
            console.error('按需加载文章失败:', error);
            return null;
        }
    }

    // 显示文章
    async showArticle(articleIdentifier, options = {}) {
        let article = this.findArticleByIdentifiers(articleIdentifier, options.filename);
        if (!article && options.filename) {
            article = await this.loadSingleArticle(options.filename);
        }
        if (!article) {
            this.showError('文章未找到');
            return;
        }

        const stayOnPage = options.stayOnPage || this.pageType === 'article';

        if (!stayOnPage) {
            const params = new URLSearchParams({ id: article.id });
            if (article.filename) {
                params.set('file', article.filename);
            }
            window.location.href = `${this.resolvePagePath('article.html')}?${params.toString()}`;
            return;
        }

        this.currentArticle = article;
        this.switchView('article');
        this.highlightActiveArticleLink(article.id);

        await this.renderArticleContent(article);
    }

    highlightActiveArticleLink(articleId) {
        const links = document.querySelectorAll('.article-link');
        if (links.length === 0) return;

        links.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`[onclick="blog.showArticle('${articleId}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async renderArticleContent(article) {
        const contentDiv = document.getElementById('article-content');
        if (!contentDiv) {
            console.error('文章容器未找到');
            return;
        }

        try {
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
                smartypants: false
            });

            // 使用marked.js渲染Markdown
            const htmlContent = marked.parse(processedContent);
            contentDiv.innerHTML = htmlContent;

            // 处理图片路径
            this.processImages(contentDiv);

            // 处理表格 - 添加横向滚动容器
            this.processTables(contentDiv);

            // 渲染KaTeX数学公式
            this.renderMath(contentDiv);

            // 高亮代码块
            this.highlightCodeBlocks(contentDiv);

            // 生成目录
            this.generateTableOfContents(contentDiv);
        } catch (error) {
            console.error('渲染文章失败:', error);
            this.showError('文章渲染失败');
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
        }    }

    // 高亮代码块
    highlightCodeBlocks(container) {
        // 检查 Prism 是否加载
        if (typeof Prism === 'undefined') {
            console.warn('Prism.js未加载，跳过代码高亮');
            return;
        }

        // 查找所有代码块
        const codeBlocks = container.querySelectorAll('pre code');
        
        codeBlocks.forEach(codeBlock => {
            // 获取父级 pre 元素
            const preElement = codeBlock.parentElement;
            
            // 尝试从类名中提取语言信息
            let language = 'text';
            const classNames = codeBlock.className.split(' ');
            
            for (const className of classNames) {
                if (className.startsWith('language-')) {
                    language = className.replace('language-', '');
                    break;
                }
            }
            
            // 如果没有找到语言，尝试从内容中推断
            if (language === 'text') {
                language = this.detectLanguage(codeBlock.textContent);
            }
            
            // 设置语言类
            codeBlock.className = `language-${language}`;
            preElement.className = `language-${language}`;
            
            // 添加语言标签
            this.addLanguageLabel(preElement, language);
            
            // 高亮代码
            try {
                Prism.highlightElement(codeBlock);
            } catch (error) {
                console.warn('代码高亮失败:', error);
            }
        });
    }

    // 检测代码语言
    detectLanguage(code) {
        const trimmedCode = code.trim();
        
        // JavaScript/TypeScript
        if (trimmedCode.includes('function') || trimmedCode.includes('=>') || 
            trimmedCode.includes('const ') || trimmedCode.includes('let ') ||
            trimmedCode.includes('var ') || trimmedCode.includes('console.log')) {
            if (trimmedCode.includes('interface ') || trimmedCode.includes(': string') ||
                trimmedCode.includes(': number') || trimmedCode.includes('type ')) {
                return 'typescript';
            }
            return 'javascript';
        }
        
        // Python
        if (trimmedCode.includes('def ') || trimmedCode.includes('import ') ||
            trimmedCode.includes('print(') || trimmedCode.includes('if __name__')) {
            return 'python';
        }
        
        // HTML
        if (trimmedCode.includes('<html') || trimmedCode.includes('<!DOCTYPE') ||
            (trimmedCode.includes('<') && trimmedCode.includes('>'))) {
            return 'html';
        }
        
        // CSS
        if (trimmedCode.includes('{') && trimmedCode.includes('}') &&
            (trimmedCode.includes(':') || trimmedCode.includes('.'))) {
            return 'css';
        }
        
        // JSON
        if ((trimmedCode.startsWith('{') && trimmedCode.endsWith('}')) ||
            (trimmedCode.startsWith('[') && trimmedCode.endsWith(']'))) {
            try {
                JSON.parse(trimmedCode);
                return 'json';
            } catch (e) {
                // 不是有效的JSON
            }
        }
        
        // Shell/Bash
        if (trimmedCode.includes('#!/bin/bash') || trimmedCode.includes('$ ') ||
            trimmedCode.includes('cd ') || trimmedCode.includes('ls ') ||
            trimmedCode.includes('npm ') || trimmedCode.includes('git ')) {
            return 'bash';
        }
        
        // SQL
        if (trimmedCode.toUpperCase().includes('SELECT ') || 
            trimmedCode.toUpperCase().includes('INSERT ') ||
            trimmedCode.toUpperCase().includes('UPDATE ') ||
            trimmedCode.toUpperCase().includes('DELETE ')) {
            return 'sql';
        }
        
        return 'text';
    }    // 添加语言标签和复制按钮
    addLanguageLabel(preElement, language) {
        // 检查是否已经有标签
        if (preElement.querySelector('.code-language-label')) {
            return;
        }
        
        // 创建语言标签
        const label = document.createElement('span');
        label.className = 'code-language-label';
        label.textContent = language.toUpperCase();
        
        // 创建复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<span>📋</span><span>复制</span>';
        copyBtn.title = '复制代码';
        
        // 添加复制功能
        copyBtn.addEventListener('click', () => {
            this.copyCodeToClipboard(preElement, copyBtn);
        });
        
        // 将元素添加到 pre 元素中
        preElement.style.position = 'relative';
        preElement.appendChild(label);
        preElement.appendChild(copyBtn);
        
        // 标记该代码块有语言标签
        if (language !== 'text') {
            preElement.classList.add('has-language-label');
        }
    }

    // 复制代码到剪贴板
    async copyCodeToClipboard(preElement, copyBtn) {
        try {
            const codeElement = preElement.querySelector('code');
            if (!codeElement) return;
            
            // 获取代码文本（去除高亮标记）
            let codeText = codeElement.textContent || codeElement.innerText;
            
            // 使用现代 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(codeText);
            } else {
                // 降级方案：使用传统方法
                const textArea = document.createElement('textarea');
                textArea.value = codeText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            // 显示复制成功状态
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✅</span><span>已复制</span>';
            copyBtn.classList.add('copied');
            
            // 2秒后恢复原状
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('copied');
            }, 2000);
            
        } catch (error) {
            console.error('复制失败:', error);
            
            // 显示复制失败状态
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>❌</span><span>复制失败</span>';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        }
    }

    // 生成目录
    generateTableOfContents(container) {
        const tocContainer = document.getElementById('table-of-contents');
        if (!tocContainer) return;

        const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));

        if (headings.length === 0) {
            tocContainer.innerHTML = '<div class="toc-placeholder">本文章无标题结构</div>';
            return;
        }

        const tocItems = headings.map((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1), 10);
            const id = heading.id || `heading-${index}`;
            heading.id = id;

            return {
                element: heading,
                level,
                id,
                text: heading.textContent.trim(),
                renderedText: this.renderMarkdownForToc(heading.textContent.trim()),
                children: []
            };
        });

        const baseLevel = Math.min(...tocItems.map(item => item.level));
        const root = { level: baseLevel - 1, children: [] };
        const stack = [root];

        tocItems.forEach(item => {
            const node = { ...item, children: [] };

            while (stack.length && node.level <= stack[stack.length - 1].level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1];
            parent.children.push(node);
            stack.push(node);
        });

        const buildList = (nodes, depth = 0) => {
            const ul = document.createElement('ul');
            ul.classList.add('toc-list');
            if (depth > 0) {
                ul.classList.add('toc-sublist');
            }

            nodes.forEach(node => {
                const li = document.createElement('li');
                li.classList.add('toc-item', `toc-level-${node.level}`);

                const link = document.createElement('a');
                link.href = `#${node.id}`;
                link.classList.add(`toc-h${node.level}`);
                link.innerHTML = node.renderedText;
                link.addEventListener('click', event => {
                    event.preventDefault();
                    this.scrollToHeading(node.id);
                });

                li.appendChild(link);

                if (node.children.length > 0) {
                    li.appendChild(buildList(node.children, depth + 1));
                }

                ul.appendChild(li);
            });

            return ul;
        };

        const tocFragment = document.createDocumentFragment();
        tocFragment.appendChild(buildList(root.children));

        tocContainer.innerHTML = '';
        tocContainer.appendChild(tocFragment);

        this.updateTocCount(headings.length);
        this.showReadingProgress();
        this.setupTocScrollSpy(headings);
    }

    // 为目录渲染基本的Markdown语法
    renderMarkdownForToc(text) {
        if (!text) return '';
        
        // 处理基本的Markdown语法
        return text
            // 处理粗体 **text** 或 __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // 处理斜体 *text* 或 _text_ (但要避免与粗体冲突)
            .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
            .replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>')
            // 处理行内代码 `code`
            .replace(/`([^`]+?)`/g, '<code>$1</code>')
            // 处理删除线 ~~text~~
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            // 处理高亮 ==text== (非标准但Obsidian支持)
            .replace(/==(.*?)==/g, '<mark>$1</mark>')
            // 转义剩余的HTML标签（安全考虑）
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // 恢复我们处理过的标签
            .replace(/&lt;(\/?(strong|em|code|del|mark))&gt;/g, '<$1>');
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

            const scrollContainer = document.querySelector('.toc-sidebar');
            if (scrollContainer) {
                const linkRect = activeLink.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                const buffer = 24;

                if (linkRect.top < containerRect.top + buffer || linkRect.bottom > containerRect.bottom - buffer) {
                    activeLink.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
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
    
    // 设置全局滚动监听（确保返回顶部按钮在所有页面都能工作）
    setupGlobalScrollListener() {
        // 移除现有的全局滚动监听（如果存在）
        if (this.globalScrollHandler) {
            window.removeEventListener('scroll', this.globalScrollHandler);
        }
        
        // 创建全局滚动处理函数
        this.globalScrollHandler = () => {
            // 始终更新返回顶部按钮状态
            this.updateBackToTopButton();
        };
        
        // 添加全局滚动监听
        window.addEventListener('scroll', this.globalScrollHandler, { passive: true });
        
        // 初始化时也检查一次按钮状态
        this.updateBackToTopButton();
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
        if (!category) return;

        if (this.pageType !== 'category') {
            const params = new URLSearchParams({ name: category });
            window.location.href = `${this.resolvePagePath('category.html')}?${params.toString()}`;
            return;
        }

        const filteredArticles = this.articles.filter(article => article.category === category);
        this.showCategoryView(filteredArticles, category, { stayOnPage: true });
    }

    // 显示分类视图
    showCategoryView(articles, category, options = {}) {
        const stayOnPage = options.stayOnPage || this.pageType === 'category';
        if (!stayOnPage) {
            const params = new URLSearchParams({ name: category });
            window.location.href = `${this.resolvePagePath('category.html')}?${params.toString()}`;
            return;
        }

        this.switchView('category');
        this.clearActiveLinks();
        this.clearTableOfContents();
        
        const contentDiv = document.getElementById('category-content');
        if (!contentDiv) {
            return;
        }
        
        const html = `
            <h1>分类: ${category}</h1>
            <p class="category-description">共 ${articles.length} 篇文章</p>
            ${articles.length > 0 ? `
                <div class="article-grid">
                    ${articles.map(article => `
                        <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                            <h4>${article.title}</h4>
                            <p>${article.excerpt}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="no-results">该分类下暂无文章</div>'}
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
        if (this.pageType !== 'home') {
            window.location.href = this.resolvePagePath('index.html');
            return;
        }

        this.switchView('home');
        this.clearActiveLinks();
        this.renderHomeView();
    }

    // 显示关于页面
    showAbout() {
        if (this.pageType !== 'about') {
            window.location.href = this.resolvePagePath('about.html');
            return;
        }

        this.switchView('about');
        this.clearActiveLinks();
        this.clearTableOfContents();
    }
    
    // 切换视图
    switchView(viewName) {
        const targetView = document.getElementById(`${viewName}-view`);
        if (!targetView) {
            console.warn(`视图 ${viewName} 不存在，当前页面类型: ${this.pageType}`);
            return;
        }

        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        targetView.classList.add('active');

        this.updateBodyViewClass(viewName);
        this.currentView = viewName;
    }

    updateBodyViewClass(viewName) {
        const classesToRemove = Array.from(document.body.classList).filter(cls => cls.startsWith('view-'));
        classesToRemove.forEach(cls => document.body.classList.remove(cls));
        document.body.classList.add(`view-${viewName}`);
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
        if (contentDiv) {
            contentDiv.innerHTML = `<div class="error">${message}</div>`;
        }
        this.switchView('article');
    }
    
    // 搜索功能
    search(query) {
        if (!query.trim()) {
            if (this.pageType !== 'home') {
                window.location.href = this.resolvePagePath('index.html');
            } else {
                this.showHome();
            }
            return;
        }

        if (this.pageType !== 'search') {
            const params = new URLSearchParams({ q: query.trim() });
            window.location.href = `${this.resolvePagePath('search.html')}?${params.toString()}`;
            return;
        }

        if (typeof searchEngine !== 'undefined' && searchEngine) {
            searchEngine.performSearch(query, { stayOnPage: true });
            return;
        }

        const results = this.articles.filter(article => 
            article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.content.toLowerCase().includes(query.toLowerCase()) ||
            article.category.toLowerCase().includes(query.toLowerCase())
        );

        this.showSearchView(results, query, { stayOnPage: true });
    }    // 显示搜索视图
    showSearchView(articles, query, options = {}) {
        const stayOnPage = options.stayOnPage || this.pageType === 'search';
        if (!stayOnPage) {
            const params = new URLSearchParams({ q: query.trim() });
            window.location.href = `${this.resolvePagePath('search.html')}?${params.toString()}`;
            return;
        }

        this.switchView('search');
        this.clearActiveLinks();
        this.clearTableOfContents();
        
        const contentDiv = document.getElementById('search-content');
        if (!contentDiv) {
            return;
        }
        
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
    }

    // 隐藏阅读进度条
    hideReadingProgress() {
        const progressContainer = document.getElementById('reading-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
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

// 初始化博客应用
let blog;
document.addEventListener('DOMContentLoaded', () => {
    const pageType = document.body.getAttribute('data-page') || 'home';

    if (typeof initTheme === 'function') {
        initTheme();
    }

    blog = new BlogApp(pageType);

    if (typeof initSearch === 'function') {
        initSearch();
    }

    blog.init(pageType);
    
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
