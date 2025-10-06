// 搜索功能模块
class SearchEngine {
    constructor() {
        this.searchIndex = [];
        this.currentQuery = '';
        this.isSearchMode = false;
        this._tempElement = document.createElement('div');
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
    }

    // 执行搜索
    performSearch(query) {
        if (!query || query.length < 1) {
            return;
        }

        this.currentQuery = query;
        this.isSearchMode = true;
        
        console.log(`🔍 搜索查询: "${query}"`);
        
        const results = this.searchArticles(query);
        this.displaySearchResults(query, results);
        
        // 切换到搜索视图
        blog.switchView('search');
        
        // 更新URL（可选）
        // history.pushState({ view: 'search', query: query }, '', `#search?q=${encodeURIComponent(query)}`);
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
                const snippet = this.buildHighlightedSnippet(result, query);

                html += `
                    <div class="search-result-item" onclick="blog.showArticle('${result.id}')">
                        <div class="search-result-category">${this.escapeHtml(result.category)}</div>
                        <div class="search-result-title">${highlightedTitle}</div>
                            <div class="search-result-excerpt">${snippet}</div>
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
            if (!term) continue;
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="search-highlight">$1</mark>');
        }

        return highlightedText;
    }

    buildHighlightedSnippet(result, query) {
        const maxSnippetLength = 160;
        const margin = 40;
        const rawTerms = query.split(/\s+/).filter(Boolean);

        let contentText = result.content || '';
        if (!contentText && result.excerpt) {
            contentText = result.excerpt;
        }

    const plainText = this.stripHtml(contentText).replace(/\s+/g, ' ').trim();

        if (!plainText || rawTerms.length === 0) {
            return this.highlightSearchTerms(result.excerpt || '', query);
        }

        const lowerPlain = plainText.toLowerCase();

        let bestRange = null;

        rawTerms.forEach(term => {
            const lowerTerm = term.toLowerCase();
            if (!lowerTerm) return;

            let index = lowerPlain.indexOf(lowerTerm);
            while (index !== -1) {
                let start = Math.max(index - margin, 0);
                let end = Math.min(index + lowerTerm.length + margin, plainText.length);

                if (end - start > maxSnippetLength) {
                    const excess = end - start - maxSnippetLength;
                    start += Math.floor(excess / 2);
                    end = start + maxSnippetLength;
                }

                const snippetText = plainText.slice(start, end);
                const matchCount = this.countMatches(snippetText, rawTerms);

                if (!bestRange || matchCount > bestRange.matchCount || (matchCount === bestRange.matchCount && snippetText.length < bestRange.text.length)) {
                    bestRange = {
                        start,
                        end,
                        text: snippetText,
                        matchCount
                    };
                }

                index = lowerPlain.indexOf(lowerTerm, index + lowerTerm.length);
            }
        });

        let snippet;

        if (bestRange) {
            snippet = bestRange.text.trim();
            const leadingEllipsis = bestRange.start > 0 ? '…' : '';
            const trailingEllipsis = bestRange.end < plainText.length ? '…' : '';
            snippet = `${leadingEllipsis}${snippet}${trailingEllipsis}`;
        } else {
            snippet = plainText.slice(0, maxSnippetLength).trim();
            if (plainText.length > maxSnippetLength) {
                snippet = `${snippet}…`;
            }
        }

        return this.highlightSearchTerms(snippet, query);
    }

    countMatches(text, terms) {
        if (!text) return 0;

        const lowerText = text.toLowerCase();
        return terms.reduce((count, term) => {
            const loweredTerm = term.toLowerCase();
            if (!loweredTerm) return count;
            let idx = lowerText.indexOf(loweredTerm);
            while (idx !== -1) {
                count++;
                idx = lowerText.indexOf(loweredTerm, idx + loweredTerm.length);
            }
            return count;
        }, 0);
    }

    stripHtml(html) {
        if (!html) return '';
        this._tempElement.innerHTML = html;
        return this._tempElement.textContent || this._tempElement.innerText || '';
    }

    // 清除搜索
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
        showHome();
    }

    // HTML转义
    escapeHtml(text) {
        this._tempElement.textContent = text == null ? '' : text;
        return this._tempElement.innerHTML;
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
    if (typeof SearchEngine !== 'undefined') {
        searchEngine = new SearchEngine();
        console.log('🔍 搜索功能已初始化');
    } else {
        console.error('❌ SearchEngine 类未定义');
    }
}

// 执行搜索（全局函数，供HTML调用）
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchEngine) {
        const query = searchInput.value.trim();
        if (query) {
            searchEngine.performSearch(query);
        }
    }
}

// 清除搜索（全局函数，供HTML调用）
function clearSearch() {
    if (searchEngine) {
        searchEngine.clearSearch();
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
    window.performSearch = performSearch;
    window.clearSearch = clearSearch;
    window.buildSearchIndex = buildSearchIndex;
}