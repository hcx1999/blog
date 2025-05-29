// 测试分类和搜索页面目录隐藏功能
console.log('🧪 开始测试分类和搜索页面目录隐藏功能...');

function testTocVisibility() {
    console.log('\n🔍 检查目录可见性测试...');
    
    // 等待博客应用加载
    setTimeout(() => {
        if (typeof blog === 'undefined') {
            console.error('❌ 博客应用未加载');
            return;
        }
        
        console.log('✅ 博客应用已加载');
        
        // 测试首页状态
        console.log('\n🏠 测试首页状态...');
        blog.showHome();
        checkTocState('home');
        
        // 测试分类页面
        setTimeout(() => {
            console.log('\n📂 测试分类页面...');
            if (blog.articles.length > 0) {
                const firstCategory = blog.articles[0].category;
                blog.filterByCategory(firstCategory);
                checkTocState('category');
            }
            
            // 测试搜索页面
            setTimeout(() => {
                console.log('\n🔍 测试搜索页面...');
                blog.search('JavaScript');
                checkTocState('search');
                
                // 测试文章页面
                setTimeout(() => {
                    console.log('\n📄 测试文章页面...');
                    if (blog.articles.length > 0) {
                        blog.showArticle(blog.articles[0].id);
                        checkTocState('article');
                    }
                    
                    console.log('\n🎉 所有测试完成！');
                }, 1000);
            }, 1000);
        }, 1000);
    }, 2000);
}

function checkTocState(viewType) {
    const tocSidebar = document.querySelector('.toc-sidebar');
    const tocToggle = document.querySelector('.toc-toggle');
    const bodyClasses = document.body.className;
    
    if (tocSidebar && tocToggle) {
        const tocStyle = window.getComputedStyle(tocSidebar);
        const toggleStyle = window.getComputedStyle(tocToggle);
        
        const tocVisible = tocStyle.display !== 'none';
        const toggleVisible = toggleStyle.display !== 'none';
        
        console.log(`📋 ${viewType} 页面状态:`);
        console.log(`  - Body classes: ${bodyClasses}`);
        console.log(`  - TOC 侧边栏可见: ${tocVisible ? '❌ 显示' : '✅ 隐藏'}`);
        console.log(`  - TOC 切换按钮可见: ${toggleVisible ? '❌ 显示' : '✅ 隐藏'}`);
        
        // 检查是否符合预期
        const shouldHideToc = ['home', 'about', 'category', 'search'].includes(viewType);
        const isCorrect = shouldHideToc ? (!tocVisible && !toggleVisible) : (tocVisible && toggleVisible);
        
        console.log(`  - 状态正确: ${isCorrect ? '✅' : '❌'}`);
        
        return isCorrect;
    } else {
        console.log(`❌ 无法找到目录元素`);
        return false;
    }
}

// 页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testTocVisibility);
} else {
    testTocVisibility();
}

// 提供手动测试函数
window.testTocHiding = {
    testTocVisibility,
    checkTocState,
    testCategory: () => {
        if (typeof blog !== 'undefined' && blog.articles.length > 0) {
            blog.filterByCategory(blog.articles[0].category);
            setTimeout(() => checkTocState('category'), 100);
        }
    },
    testSearch: () => {
        if (typeof blog !== 'undefined') {
            blog.search('test');
            setTimeout(() => checkTocState('search'), 100);
        }
    }
};

console.log('💡 测试脚本已加载。可以使用 window.testTocHiding 进行手动测试。');
