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
class BlogApp {
    constructor() {
        this.articles = [];
        this.currentView = 'home';
        this.currentArticle = null;
        this.checkProtocol(); // 检查协议
        this.init();
    }
    
    // 检查当前访问协议
    checkProtocol() {
        if (window.location.protocol === 'file:') {
            console.warn('⚠️ 检测到file://协议访问，这可能导致功能异常');
            this.showProtocolWarning();
        }
    }
    
    // 显示协议警告
    showProtocolWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            color: white;
            padding: 12px 20px;
            text-align: center;
            z-index: 10000;
            font-size: 14px;
            border-bottom: 3px solid rgba(255,255,255,0.3);
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        warningDiv.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto;">
                <strong>⚠️ 协议警告：</strong>
                当前使用file://协议访问，博客功能可能无法正常工作。
                <br>
                <strong>建议解决方案：</strong>
                启动HTTP服务器访问此页面，例如使用 
                <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; margin: 0 4px;">python -m http.server 8000</code>
                或 
                <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px; margin: 0 4px;">npx serve .</code>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="margin-left: 15px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer;">
                    知道了
                </button>
            </div>
        `;
        
        document.body.insertBefore(warningDiv, document.body.firstChild);
        
        // 调整页面内容的顶部边距，避免被警告栏遮挡
        document.body.style.paddingTop = '70px';
    }
    
    async init() {
        await this.loadArticles();
        this.renderSidebar();
        this.renderHomeView();
        // 设置初始的body class
        document.body.classList.add('view-home');
    }
    
    // 加载所有Markdown文件
    async loadArticles() {
        let markdownFiles = [];
        
        try {
            console.log('开始加载文章...');
            
            // 首先尝试从文件索引获取文件列表
            try {
                markdownFiles = await this.getMarkdownFileList();
                
                // 验证我们有一个有效的数组
                if (Array.isArray(markdownFiles) && markdownFiles.length > 0) {
                    console.log(`成功获取动态文件列表: ${markdownFiles.length} 个文件`);
                } else {
                    console.warn('动态文件列表为空，尝试使用备用方案');
                    markdownFiles = await this.getFallbackFileList();
                }
            } catch (error) {
                console.warn('无法获取动态文件列表，使用备用方案', error);
                // 备用方案：使用备用方法获取文件列表
                markdownFiles = await this.getFallbackFileList();
            }

            // 确保 markdownFiles 始终是一个数组，即使是空数组
            if (!Array.isArray(markdownFiles)) {
                console.warn('文件列表无效，使用空数组');
                markdownFiles = [];
            }

            console.log(`找到 ${markdownFiles.length} 个 Markdown 文件:`, markdownFiles);

            // 缓存文件列表到本地存储
            if (markdownFiles.length > 0) {                try {
                    localStorage.setItem(BlogConfig.cache.filesKey, JSON.stringify({
                        files: markdownFiles,
                        timestamp: Date.now(),
                        version: BlogConfig.cache.version
                    }));
                    console.log('文件列表已缓存到本地存储');
                } catch (error) {
                    console.warn('无法缓存文件列表', error);
                }
            }

            // 如果没有文件，直接返回
            if (markdownFiles.length === 0) {
                console.log('没有找到 Markdown 文件');
                this.articles = [];
                return;
            }            const loadPromises = markdownFiles.map(async (filename) => {
                try {
                    const response = await fetch(BlogConfig.getContentFilePath(filename));
                    if (response.ok) {
                        const content = await response.text();
                        return this.parseMarkdownFile(filename, content);
                    } else {
                        console.warn(`文件不存在或无法访问: ${filename} (${response.status})`);
                        return null;
                    }
                } catch (error) {
                    // 如果是file协议导致的网络错误，给出特殊提示
                    if (window.location.protocol === 'file:' && error.name === 'TypeError') {
                        console.warn(`无法加载文件 ${filename}: file:// 协议限制`);
                    } else {
                        console.warn(`无法加载文件: ${filename}`, error);
                    }
                    return null;
                }
            });

            const results = await Promise.all(loadPromises);
            this.articles = results.filter(article => article !== null);
              if (this.articles.length > 0) {
                this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
                console.log(`成功加载 ${this.articles.length} 篇文章`);
            } else {
                console.log('没有成功加载任何文章');
            }        } catch (error) {
            console.error('加载文章过程中出现错误:', error);
            
            // 如果是file协议访问导致的错误，给出特殊提示
            if (window.location.protocol === 'file:' && error.name === 'TypeError') {
                this.showError(`
                    <div style="text-align: center; padding: 20px;">
                        <h3 style="color: #e74c3c;">❌ 无法加载文章</h3>
                        <p>检测到您正在使用 <strong>file://</strong> 协议访问此博客。</p>
                        <p>由于浏览器安全限制，fetch API 无法在 file:// 协议下读取本地文件。</p>
                        <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #17a2b8; border-radius: 4px;">
                            <strong>解决方案：</strong><br>
                            1. 使用 HTTP 服务器访问此页面<br>
                            2. 在项目目录下运行：<br>
                            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 3px; margin: 0 4px;">python -m http.server 8000</code><br>
                            或<br>
                            <code style="background: #e9ecef; padding: 4px 8px; border-radius: 3px; margin: 0 4px;">npx serve .</code><br>
                            3. 然后访问 <code>http://localhost:8000</code>
                        </div>
                    </div>
                `);
            } else {
                this.showError('加载文章失败，请检查网络连接或刷新页面重试');
            }
            
            this.articles = [];
        }
    }    // 获取 Markdown 文件列表的主要方法
    async getMarkdownFileList() {
        console.log('开始获取 Markdown 文件列表...');
        
        try {
            // 方法1: 尝试通过目录遍历获取文件列表（本地服务器支持）
            const directoryFiles = await this.tryDirectoryListing();
            if (directoryFiles.length > 0) {
                console.log(`通过目录列表找到 ${directoryFiles.length} 个文件`);
                return directoryFiles;
            }
            
            // 方法2: GitHub Pages兼容 - 通过探测已知文件扩展名模式
            console.log('目录列表不可用，尝试GitHub Pages兼容模式...');
            const discoveredFiles = await this.discoverFilesForGitHubPages();
            if (discoveredFiles.length > 0) {
                console.log(`通过文件探测找到 ${discoveredFiles.length} 个文件`);
                return discoveredFiles;
            }
            
            // 如果都失败了，返回空数组
            console.log('无法获取文件列表，请检查部署配置');
            return [];
        } catch (error) {
            console.error('获取文件列表失败:', error);
            return [];
        }
    }

    // 尝试传统目录列表方法
    async tryDirectoryListing() {
        try {
            // 尝试HTML目录列表
            const response = await fetch(BlogConfig.getContentDirPath() + '/');
            if (response.ok) {
                const htmlText = await response.text();
                const markdownFiles = this.parseDirectoryListing(htmlText);
                if (markdownFiles.length > 0) {
                    return markdownFiles;
                }
            }
        } catch (error) {
            console.log('HTML目录列表不可用');
        }

        try {
            // 尝试JSON API
            const response = await fetch(BlogConfig.getContentDirPath() + '/', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                const dirContents = await response.json();
                if (Array.isArray(dirContents)) {
                    const mdFiles = dirContents
                        .filter(item => typeof item === 'string' && item.endsWith('.md'))
                        .map(file => file.replace(/^\//, ''));
                    return mdFiles;
                }
            }
        } catch (error) {
            console.log('JSON API不可用');
        }

        return [];
    }

    // GitHub Pages兼容的文件发现机制
    async discoverFilesForGitHubPages() {
        console.log('启动GitHub Pages兼容的文件发现...');
        
        // 通过sitemap.xml或robots.txt尝试发现文件
        const sitemapFiles = await this.tryDiscoverFromSitemap();
        if (sitemapFiles.length > 0) {
            return sitemapFiles;
        }

        // 尝试通过README.md中的链接发现其他文件
        const readmeFiles = await this.tryDiscoverFromReadme();
        if (readmeFiles.length > 0) {
            return readmeFiles;
        }

        // 最后尝试通过常见的GitHub默认分支API
        const githubFiles = await this.tryGitHubAPI();
        if (githubFiles.length > 0) {
            return githubFiles;
        }

        console.log('所有发现方法都失败了');
        return [];
    }

    // 尝试从sitemap.xml发现文件
    async tryDiscoverFromSitemap() {
        try {
            const response = await fetch('/sitemap.xml');
            if (response.ok) {
                const xmlText = await response.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                const urls = xmlDoc.querySelectorAll('url loc');
                
                const mdFiles = [];
                urls.forEach(url => {
                    const urlText = url.textContent;
                    const match = urlText.match(/\/Vault\/([^\/]+\.md)$/);
                    if (match) {
                        mdFiles.push(match[1]);
                    }
                });
                
                return mdFiles;
            }
        } catch (error) {
            console.log('sitemap.xml不可用');
        }
        return [];
    }

    // 尝试从README.md发现其他文件
    async tryDiscoverFromReadme() {
        try {
            const response = await fetch('README.md');
            if (response.ok) {
                const readmeContent = await response.text();
                const mdFiles = [];
                
                // 查找Markdown链接模式
                const linkRegex = /\[([^\]]+)\]\((?:\.\/)?Vault\/([^)]+\.md)\)/g;
                let match;
                while ((match = linkRegex.exec(readmeContent)) !== null) {
                    mdFiles.push(match[2]);
                }
                
                // 查找直接提到的.md文件
                const fileRegex = /(?:^|\s)([\w\-\u4e00-\u9fa5]+\.md)(?:\s|$)/gm;
                while ((match = fileRegex.exec(readmeContent)) !== null) {
                    if (!mdFiles.includes(match[1])) {
                        mdFiles.push(match[1]);
                    }
                }
                
                return mdFiles;
            }
        } catch (error) {
            console.log('README.md不可用');
        }
        return [];
    }

    // 尝试使用GitHub API发现文件
    async tryGitHubAPI() {
        try {
            // 检查是否在GitHub Pages环境
            const hostname = window.location.hostname;
            if (hostname.includes('github.io')) {
                const pathParts = window.location.pathname.split('/');
                const repoName = pathParts[1];
                const username = hostname.split('.')[0];
                
                if (username && repoName) {
                    const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/Vault`;
                    const response = await fetch(apiUrl);
                    
                    if (response.ok) {
                        const contents = await response.json();
                        const mdFiles = contents
                            .filter(item => item.type === 'file' && item.name.endsWith('.md'))
                            .map(item => item.name);
                        
                        console.log(`通过GitHub API找到 ${mdFiles.length} 个文件`);
                        return mdFiles;
                    }
                }
            }
        } catch (error) {
            console.log('GitHub API不可用:', error);
        }
        return [];
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
            }
        }
          return markdownFiles;
    }
    // 获取备用文件列表
    async getFallbackFileList() {
        // 尝试从本地存储获取之前缓存的文件列表
        try {
            const cachedFiles = localStorage.getItem(BlogConfig.cache.filesKey);
            if (cachedFiles) {
                const cache = JSON.parse(cachedFiles);
                // 检查缓存是否在24小时内且版本号匹配
                if (cache.timestamp && 
                   (Date.now() - cache.timestamp) < BlogConfig.cache.duration && 
                   (!cache.version || cache.version === BlogConfig.cache.version)) {
                    console.log('使用本地缓存的文件列表:', cache.files.length, '个文件');
                    return cache.files;
                } else {
                    console.log('缓存已过期或版本不匹配，不使用缓存');
                }
            }
        } catch (error) {
            console.warn('无法读取缓存的文件列表', error);
        }
          // 如果没有缓存，返回空列表
        console.log('没有可用的缓存文件列表，返回空列表');
        return [];
    }    
    // 手动刷新文章列表
    async refreshArticles() {
        console.log('正在刷新文章列表...');
        
        // 更新按钮样式，显示加载状态
        const refreshBtn = document.getElementById('refresh-articles-btn');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '⏳';
            refreshBtn.disabled = true;
            refreshBtn.style.animation = 'spin 1s linear infinite';
        }
          // 清除本地缓存，确保重新获取文件列表
        try {
            localStorage.removeItem(BlogConfig.cache.filesKey);
        } catch (e) {
            // 忽略缓存清除错误
        }
        
        try {
            // 重新加载文章
            await this.loadArticles();
            this.renderSidebar();
            
            // 如果当前在首页，更新首页显示
            if (this.currentView === 'home') {
                this.renderHomeView();
            }
            
            // 显示成功消息
            this.showNotification(`文章列表刷新成功，已加载 ${this.articles.length} 篇文章`, 'success');
            
            console.log('文章列表刷新完成');
            return true;
        } catch (error) {
            console.error('刷新文章列表失败:', error);
            this.showNotification('刷新文章列表失败', 'error');
            return false;
        } finally {
            // 恢复按钮状态
            if (refreshBtn) {
                refreshBtn.innerHTML = '🔄';
                refreshBtn.disabled = false;
                refreshBtn.style.animation = '';
            }
        }
    }
    
    // 显示通知消息
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // 设置不同类型的颜色
        let bgColor = '#2196f3'; // 默认蓝色
        if (type === 'success') bgColor = '#4caf50';
        if (type === 'error') bgColor = '#f44336';
        if (type === 'warning') bgColor = '#ff9800';
        
        // 设置通知样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background-color: ${bgColor};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(-20px);
        `;
        
        notification.textContent = message;
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 动画效果
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 解析Markdown文件
    parseMarkdownFile(filename, content) {
        const title = this.extractTitle(content, filename);
        const category = this.extractCategory(filename);
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
    }

    // 提取分类
    extractCategory(filename) {
        if (filename.includes('AI') || filename.includes('神经网络') || filename.includes('人工智能')) return 'AI';
        if (filename.includes('JavaScript') || filename.includes('ECMAScript') || filename.includes('js')) return 'JavaScript';
        if (filename.includes('Linux')) return 'Linux';
        if (filename.includes('数学') || filename.includes('Math')) return 'Math';
        return '其他';
    }

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
    }    // 渲染首页视图
    renderHomeView() {
        const recentList = document.getElementById('recent-list');
        // 显示全部文章而不只是前5篇
        const recentArticles = this.articles;

        if (recentArticles.length === 0) {
            recentList.innerHTML = '<div class="error">暂无文章</div>';
            return;
        }

        const html = recentArticles.map(article => `
            <div class="recent-item" onclick="blog.showArticle('${article.id}')">
                <h4>${article.title}</h4>
                <p>${article.excerpt}</p>
                <div class="date">${article.date}</div>
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
            
            // 生成目录
            this.generateTableOfContents(contentDiv);
            
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
            let imagePath;            if (attachmentsPath) {
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
                });
            } catch (error) {
                console.warn('auto-render数学公式渲染失败:', error);
            }
        }    }

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
        tocHTML += '</ul>';        tocContainer.innerHTML = tocHTML;

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
        if (activeLink) {            activeLink.classList.add('active');
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
    }

    // 切换目录折叠状态
    toggleTocCollapse() {
        const tocWrapper = document.querySelector('.toc-wrapper');
        const collapseBtn = document.getElementById('toc-collapse-btn');
        
        if (tocWrapper && collapseBtn) {
            const isCollapsed = tocWrapper.classList.toggle('collapsed');
            collapseBtn.textContent = isCollapsed ? '📋' : '📄';
            collapseBtn.title = isCollapsed ? '展开目录' : '折叠目录';
        }
    }

    // 更新目录计数
    updateTocCount(count) {
        const tocCount = document.getElementById('toc-count');
        const collapseBtn = document.getElementById('toc-collapse-btn');
        
        if (tocCount) {
            if (count > 0) {
                tocCount.textContent = count;
                tocCount.style.display = 'inline-block';
                if (collapseBtn) {
                    collapseBtn.style.display = 'block';
                }
            } else {
                tocCount.style.display = 'none';
                if (collapseBtn) {
                    collapseBtn.style.display = 'none';
                }
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
                backToTopBtn.classList.remove('visible');            }
        }
    }
    
    // 处理图片路径（增强版，集成 ImageFixUtil）
    processImages(container) {
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
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
        
        img.addEventListener('error', (e) => {
            if (!img.hasAttribute('data-error-retry')) {
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
                tableContainer.appendChild(table);
            }
        });
    }// 按分类过滤
    filterByCategory(category) {
        const filteredArticles = this.articles.filter(article => article.category === category);
        this.showCategoryView(filteredArticles, category);
    }

    // 显示分类视图
    showCategoryView(articles, category) {
        this.switchView('category');
        this.clearActiveLinks();
        this.clearTableOfContents();
        closeMobileTableOfContents();
        
        const contentDiv = document.getElementById('category-content');
        
        const html = `
            <h1>分类: ${category}</h1>
            <p class="category-description">共 ${articles.length} 篇文章</p>
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
    }    // 显示首页
    showHome() {
        this.switchView('home');
        this.clearActiveLinks();
        this.clearTableOfContents();
        closeMobileTableOfContents();
    }

    // 显示关于页面
    showAbout() {
        this.switchView('about');
        this.clearActiveLinks();
        this.clearTableOfContents();
        closeMobileTableOfContents();
    }    // 切换视图
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
    }    // 搜索功能
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
    }

    // 显示搜索视图
    showSearchView(articles, query) {
        this.switchView('search');
        this.clearActiveLinks();
        this.clearTableOfContents();
        closeMobileTableOfContents();
        
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
        const query = prompt('请输入搜索关键词:');
        if (query) {
            blog.search(query);
        }
    }
});

// 目录切换功能
function toggleTableOfContents() {
    const tocSidebar = document.querySelector('.toc-sidebar');
    const tocOverlay = document.getElementById('toc-overlay');
    
    if (tocSidebar && tocOverlay) {
        const isVisible = tocSidebar.classList.contains('mobile-visible');
        
        if (isVisible) {
            closeMobileTableOfContents();
        } else {
            tocSidebar.classList.add('mobile-visible');
            tocOverlay.classList.add('visible');
        }
    }
}

// 关闭移动端目录
function closeMobileTableOfContents() {
    const tocSidebar = document.querySelector('.toc-sidebar');
    const tocOverlay = document.getElementById('toc-overlay');
    
    if (tocSidebar && tocOverlay) {
        tocSidebar.classList.remove('mobile-visible');
        tocOverlay.classList.remove('visible');
    }
}

// 点击页面其他区域时隐藏目录
document.addEventListener('click', function(e) {
    const tocSidebar = document.querySelector('.toc-sidebar');
    const tocToggle = document.getElementById('toc-toggle');
    
    if (tocSidebar && tocToggle && 
        !tocSidebar.contains(e.target) && 
        !tocToggle.contains(e.target) &&
        tocSidebar.classList.contains('mobile-visible')) {
        closeMobileTableOfContents();
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
