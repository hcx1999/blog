// 搜索功能模块
class SearchEngine {
    constructor() {
        this.searchIndex = [];
        this.currentQuery = '';
        this.isSearchMode = false;
        this.initSearchEvents();
    }

    // 初始化搜索事件监听
    initSearchEvents() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchClear = document.getElementById('search-clear');

        if (searchInput) {
            // 输入事件
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this.handleSearchInput(query);
            });

            // 回车搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                }
            });

            // 失焦时如果有内容则搜索
            searchInput.addEventListener('blur', (e) => {
                const query = e.target.value.trim();
                if (query && query !== this.currentQuery) {
                    this.performSearch(query);
                }
            });
        }
    }

    // 处理搜索输入
    handleSearchInput(query) {
        const searchClear = document.getElementById('search-clear');
        
        if (query.length > 0) {
            searchClear.style.display = 'block';
        } else {
            searchClear.style.display = 'none';
            if (this.isSearchMode) {
                this.clearSearch();
            }
        }
    }

    // 建立搜索索引
    buildSearchIndex(articles) {
        this.searchIndex = articles.map(article => ({
            id: article.id,
            title: article.title,
            content: article.content,
            category: article.category,
            excerpt: article.excerpt,
            filename: article.filename,
            // 创建搜索用的文本内容
            searchText: this.normalizeSearchText([
                article.title,
                article.content,
                article.category,
                article.excerpt
            ].join(' '))
        }));
        
        console.log(`🔍 搜索索引已建立，包含 ${this.searchIndex.length} 篇文章`);
    }

    // 标准化搜索文本
    normalizeSearchText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 保留中英文字符和数字
            .replace(/\s+/g, ' ')
            .trim();
    }    // 执行搜索
    performSearch(query, updateHistory = true) {
        if (!query || query.length < 1) {
            return;
        }

        this.currentQuery = query;
        this.isSearchMode = true;
        
        console.log(`🔍 搜索查询: "${query}"`);
        
        // 更新搜索输入框的内容
        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value !== query) {
            searchInput.value = query;
        }
        
        // 显示清除按钮
        const searchClear = document.getElementById('search-clear');
        if (searchClear) {
            searchClear.style.display = 'inline-block';
        }
        
        const results = this.searchArticles(query);
        this.displaySearchResults(query, results);
        
        // 切换到搜索视图
        blog.switchView('search');
        
        // 更新URL路由
        if (updateHistory && blog) {
            blog.updateRoute({ type: 'search', params: { q: query } });
        }
    }

    // 搜索文章
    searchArticles(query) {
        const normalizedQuery = this.normalizeSearchText(query);
        const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
        
        if (queryTerms.length === 0) {
            return [];
        }

        const results = [];

        for (const item of this.searchIndex) {
            let score = 0;
            let matchedTerms = 0;
            const matches = [];

            for (const term of queryTerms) {
                // 标题匹配（权重最高）
                if (this.normalizeSearchText(item.title).includes(term)) {
                    score += 10;
                    matchedTerms++;
                    matches.push({ type: 'title', term });
                }

                // 分类匹配（权重高）
                if (this.normalizeSearchText(item.category).includes(term)) {
                    score += 8;
                    matchedTerms++;
                    matches.push({ type: 'category', term });
                }

                // 内容匹配（权重中等）
                if (item.searchText.includes(term)) {
                    score += 3;
                    matchedTerms++;
                    matches.push({ type: 'content', term });
                }

                // 摘要匹配（权重较低）
                if (this.normalizeSearchText(item.excerpt).includes(term)) {
                    score += 2;
                    matchedTerms++;
                    matches.push({ type: 'excerpt', term });
                }
            }

            // 只有匹配到查询词的文章才加入结果
            if (matchedTerms > 0) {
                results.push({
                    ...item,
                    score,
                    matchedTerms,
                    matches,
                    relevance: matchedTerms / queryTerms.length // 相关度百分比
                });
            }
        }

        // 按评分排序
        results.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.relevance - a.relevance;
        });

        console.log(`🔍 找到 ${results.length} 个搜索结果`);
        return results;
    }

    // 显示搜索结果
    displaySearchResults(query, results) {
        const searchContent = document.getElementById('search-content');
        
        if (!searchContent) {
            console.error('搜索内容容器未找到');
            return;
        }

        let html = `
            <div class="search-header">
                <h2>搜索结果</h2>
                <div class="search-stats">
                    搜索 "<strong>${this.escapeHtml(query)}</strong>" 找到 ${results.length} 个结果
                </div>
            </div>
        `;

        if (results.length === 0) {
            html += `
                <div class="search-no-results">
                    <h3>😔 没有找到相关结果</h3>
                    <p>尝试使用不同的关键词，或者检查拼写是否正确</p>
                </div>
            `;
        } else {
            html += '<div class="search-results">';
            
            for (const result of results) {
                const highlightedTitle = this.highlightSearchTerms(result.title, query);
                const highlightedExcerpt = this.highlightSearchTerms(result.excerpt, query);
                
                html += `
                    <div class="search-result-item" onclick="blog.showArticle('${result.id}')">
                        <div class="search-result-category">${this.escapeHtml(result.category)}</div>
                        <div class="search-result-title">${highlightedTitle}</div>
                        <div class="search-result-excerpt">${highlightedExcerpt}</div>
                    </div>
                `;
            }
            
            html += '</div>';
        }

        searchContent.innerHTML = html;
    }

    // 高亮搜索词
    highlightSearchTerms(text, query) {
        if (!text || !query) return this.escapeHtml(text);
        
        const normalizedQuery = this.normalizeSearchText(query);
        const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);
        
        let highlightedText = this.escapeHtml(text);
        
        for (const term of queryTerms) {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
        }
        
        return highlightedText;
    }    // 清除搜索
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        if (searchClear) {
            searchClear.style.display = 'none';
        }
        
        this.currentQuery = '';
        this.isSearchMode = false;
        
        // 返回首页
        blog.switchView('home');
        blog.showHome(); // 这会自动更新路由
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 正则表达式转义
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 获取当前搜索状态
    getSearchState() {
        return {
            query: this.currentQuery,
            isSearchMode: this.isSearchMode,
            indexSize: this.searchIndex.length
        };
    }
}

// 全局搜索引擎实例
let searchEngine = null;

// 初始化搜索功能
function initSearch() {
    console.log('🔍 开始初始化搜索功能');
    if (typeof SearchEngine !== 'undefined') {
        searchEngine = new SearchEngine();
        console.log('✅ 搜索功能已初始化');
        
        // 如果博客对象已经存在且有文章数据，立即建立索引
        if (blog && blog.articles && blog.articles.length > 0) {
            console.log('🔍 检测到博客数据，立即建立搜索索引');
            searchEngine.buildSearchIndex(blog.articles);
        }
    } else {
        console.error('❌ SearchEngine 类未定义');
    }
}

// 延迟初始化搜索功能（等待博客数据加载）
function initSearchWithBlog() {
    console.log('🔍 尝试与博客数据同步初始化搜索');
    if (!searchEngine) {
        initSearch();
    }
    
    if (searchEngine && blog && blog.articles && blog.articles.length > 0) {
        console.log('🔍 建立搜索索引，包含', blog.articles.length, '篇文章');
        searchEngine.buildSearchIndex(blog.articles);
    } else {
        console.warn('⚠️ 搜索索引建立失败：缺少必要数据');
    }
}

// 执行搜索（全局函数，供HTML调用）
function performSearch() {
    console.log('🔍 performSearch() 被调用');
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
        console.error('❌ 搜索输入框未找到');
        return;
    }

    const query = searchInput.value.trim();
    if (!query) {
        console.warn('⚠️ 搜索查询为空');
        return;
    }

    // 使用通用初始化等待函数处理搜索
    if (typeof waitForBlogInitialization === 'function') {
        waitForBlogInitialization('search', { query });
    } else {
        // 降级处理（如果waitForBlogInitialization不可用）
        if (searchEngine) {
            console.log('🔍 使用搜索引擎执行搜索:', query);
            searchEngine.performSearch(query);
        } else if (typeof initSearch === 'function') {
            console.warn('⚠️ 搜索引擎未初始化，尝试初始化后再搜索');
            initSearch();
            setTimeout(() => {
                if (searchEngine) {
                    searchEngine.performSearch(query);
                } else if (blog) {
                    blog.search(query);
                }
            }, 200);
        } else if (blog) {
            console.log('🔍 使用博客内置搜索功能:', query);
            blog.search(query);
        } else {
            console.error('❌ 搜索功能不可用');
            alert('搜索功能暂时不可用，请稍后再试');
        }
    }
}

// 清除搜索（全局函数，供HTML调用）
function clearSearch() {
    console.log('🧹 clearSearch() 被调用');
    
    // 先清空搜索框
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (searchClear) {
        searchClear.style.display = 'none';
    }
    
    // 使用通用初始化等待函数处理清除搜索
    if (typeof waitForBlogInitialization === 'function') {
        waitForBlogInitialization('clearSearch');
    } else {
        // 降级处理（如果waitForBlogInitialization不可用）
        if (searchEngine) {
            searchEngine.clearSearch();
        } else if (blog) {
            blog.showHome();
        } else {
            console.warn('⚠️ 博客对象和搜索引擎均未初始化，无法完全清除搜索');
            setTimeout(() => {
                if (blog) {
                    blog.showHome();
                }
            }, 500);
        }
    }
}

// 为博客应用构建搜索索引
function buildSearchIndex(articles) {
    if (searchEngine && articles) {
        searchEngine.buildSearchIndex(articles);
    }
}

// 导出给其他模块使用
if (typeof window !== 'undefined') {
    window.searchEngine = searchEngine;
    window.initSearch = initSearch;
    window.initSearchWithBlog = initSearchWithBlog;
    window.performSearch = performSearch;
    window.clearSearch = clearSearch;
    window.buildSearchIndex = buildSearchIndex;
}