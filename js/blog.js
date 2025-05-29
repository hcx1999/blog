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
        this.init();
    }    async init() {
        await this.loadArticles();
        this.renderSidebar();
        this.renderHomeView();
        
        // 设置初始的body class
        document.body.classList.add('view-home');
    }    // 加载所有Markdown文件
    async loadArticles() {
        const markdownFiles = [
            'AI基础笔记.md',
            'AI基础作业笔记.md',
            'CAMEL.md',
            'JavaScript-tds.md',
            'JavaScript-zw.md',
            'Linux配置笔记.md',
            '数学公式测试.md',
            '目录功能测试.md',
            '代码块溢出测试.md'
        ];

        const loadPromises = markdownFiles.map(async (filename) => {
            try {
                const response = await fetch(`Vault/${filename}`);
                if (response.ok) {
                    const content = await response.text();
                    return this.parseMarkdownFile(filename, content);
                }
            } catch (error) {
                console.warn(`无法加载文件: ${filename}`, error);
                return null;
            }
        });

        const results = await Promise.all(loadPromises);
        this.articles = results.filter(article => article !== null);
        this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    }

    // 渲染首页视图
    renderHomeView() {
        const recentList = document.getElementById('recent-list');
        const recentArticles = this.articles.slice(0, 5);

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
            console.error('渲染文章失败:', error);
            this.showError('文章渲染失败');
        }
    }    // 预处理Markdown内容（修复标题格式和Obsidian图片语法）
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
                imagePath = `Vault/attachments/${filename}`;
            } else {
                // 如果只有文件名，添加 attachments/ 前缀
                imagePath = `Vault/attachments/${filename}`;
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
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }    // 清理目录
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
                backToTopBtn.classList.remove('visible');
            }
        }
    }    // 处理图片路径（增强版，集成 ImageFixUtil）

    processImages(container) {
        const images = container.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('/')) {
                let newSrc = src;
                
                // 基本路径处理
                if (src.startsWith('attachments/')) {
                    newSrc = `Vault/${src}`;
                } else if (!src.startsWith('Vault/')) {
                    newSrc = `Vault/attachments/${src}`;
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
                
                // 对图片路径进行 URL 编码以处理空格和特殊字符
                const encodedPath = this.encodeImagePath(imagePath);
                img.setAttribute('src', encodedPath);
                
                // 添加错误处理，如果图片加载失败显示占位符
                img.addEventListener('error', () => {
                    img.style.border = '2px dashed #ccc';
                    img.style.padding = '20px';
                    img.alt = `图片加载失败: ${src}`;
                    img.title = `图片路径: ${imagePath}`;
                }, { once: true });
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
                    `Vault/attachments/${filename}`,
                    `attachments/${filename}`,
                    `Vault/attachments/${encodeURIComponent(filename)}`
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
    
    // 编码图片路径以处理空格和特殊字符
    encodeImagePath(path) {
        // 分割路径和文件名
        const parts = path.split('/');
        // 对每个部分进行编码，但保留路径分隔符
        return parts.map(part => encodeURIComponent(part)).join('/');
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
            debug: true,
            imageBaseDir: 'Vault/attachments/',
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
