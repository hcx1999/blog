/**
 * 移动端UI增强脚本
 * 用于优化移动端的导航、侧边栏和目录体验
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端增强功能（现在仅限于文章页面的目录切换）
    initializeMobileUI();
});

/**
 * 初始化移动端UI增强功能
 */
function initializeMobileUI() {
    // 创建目录切换按钮（仅在文章页面）
    if (document.body.classList.contains('view-article')) {
        createTocToggleButton();
    }
}

// 侧边栏折叠功能已被移除

/**
 * 创建目录切换按钮（仅用于文章页面）
 */
function createTocToggleButton() {
    const tocToggle = document.createElement('button');
    tocToggle.className = 'mobile-toggle-btn toc-toggle';
    tocToggle.innerHTML = '目录 <i class="fas fa-list"></i>';
    tocToggle.addEventListener('click', function() {
        toggleElement('.toc-sidebar');
    });
    
    // 将按钮添加到DOM
    const contentHeader = document.querySelector('.content > header');
    if (contentHeader) {
        contentHeader.appendChild(tocToggle);
    } else {
        // 如果找不到文章标题，添加到内容顶部
        const content = document.querySelector('.content');
        if (content) {
            content.insertBefore(tocToggle, content.firstChild);
        }
    }
    
    // 为移动端添加样式
    addMobileStyles();
}

/**
 * 切换目录的显示状态
 */
function toggleElement(selector) {
    // 仅用于目录切换
    if (selector === '.toc-sidebar') {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.toggle('mobile-hidden');
        }
    }
}

/**
 * 添加移动端所需的样式
 */
function addMobileStyles() {
    // 创建样式元素
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        /* 移动端UI增强样式 */
        .mobile-hidden {
            display: none !important;
        }
        
        .mobile-toggle-btn {
            position: fixed;
            z-index: 1100;
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            background: var(--accent-gradient);
            color: white;
            font-size: 14px;
            box-shadow: var(--shadow-md);
            transition: var(--transition);
        }
        
        .mobile-toggle-btn:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
        }
        
        .toc-toggle {
            bottom: 16px;
            right: 16px;
        }
        
        /* 在移动端显示时的目录样式 */
        @media (max-width: 768px) {
            .toc-sidebar:not(.mobile-hidden) {
                display: block !important;
                position: fixed;
                top: 56px;
                left: 0;
                right: 0;
                width: 100%;
                z-index: 1000;
                box-shadow: var(--shadow-lg);
                max-height: 60vh;
                overflow-y: auto;
                padding: 16px;
            }
        }
    `;
    
    // 添加到文档
    document.head.appendChild(styleEl);
}