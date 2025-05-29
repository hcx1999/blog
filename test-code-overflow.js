// 代码块溢出修复测试脚本
console.log('🧪 开始测试代码块溢出修复功能...');

function testCodeBlockOverflow() {
    console.log('\n🔍 代码块溢出测试开始...');
    
    // 等待博客应用加载
    setTimeout(() => {
        if (typeof blog === 'undefined') {
            console.error('❌ 博客应用未加载');
            return;
        }
        
        console.log('✅ 博客应用已加载');
        
        // 查找代码块溢出测试文章
        const testArticle = blog.articles.find(article => 
            article.title.includes('代码块溢出测试') || 
            article.filename === '代码块溢出测试.md'
        );
        
        if (!testArticle) {
            console.error('❌ 未找到代码块溢出测试文章');
            return;
        }
        
        console.log('✅ 找到测试文章:', testArticle.title);
        
        // 显示测试文章
        blog.showArticle(testArticle.id);
        
        // 等待文章渲染完成
        setTimeout(() => {
            console.log('\n📄 测试文章已显示，开始检查代码块...');
            checkCodeBlocks();
            checkTables();
            checkPageLayout();
            
            console.log('\n🎉 代码块溢出测试完成！');
        }, 2000);
        
    }, 2000);
}

function checkCodeBlocks() {
    console.log('\n🔧 检查代码块样式...');
    
    const codeBlocks = document.querySelectorAll('.article-content pre');
    console.log(`📊 找到 ${codeBlocks.length} 个代码块`);
    
    codeBlocks.forEach((block, index) => {
        const styles = window.getComputedStyle(block);
        const overflowX = styles.overflowX;
        const maxWidth = styles.maxWidth;
        const whiteSpace = styles.whiteSpace;
        
        console.log(`📋 代码块 ${index + 1}:`);
        console.log(`  - overflow-x: ${overflowX} ${overflowX === 'auto' ? '✅' : '❌'}`);
        console.log(`  - max-width: ${maxWidth} ${maxWidth === '100%' ? '✅' : '❌'}`);
        console.log(`  - white-space: ${whiteSpace} ${whiteSpace === 'pre' ? '✅' : '❌'}`);
        
        // 检查是否有横向滚动条
        if (block.scrollWidth > block.clientWidth) {
            console.log(`  - 横向滚动: ✅ 可滚动 (${block.scrollWidth}px > ${block.clientWidth}px)`);
        } else {
            console.log(`  - 横向滚动: ⚠️ 无需滚动 (${block.scrollWidth}px <= ${block.clientWidth}px)`);
        }
    });
}

function checkTables() {
    console.log('\n📊 检查表格容器...');
    
    const tableContainers = document.querySelectorAll('.article-content .table-container');
    const tables = document.querySelectorAll('.article-content table');
    
    console.log(`📊 找到 ${tableContainers.length} 个表格容器`);
    console.log(`📊 找到 ${tables.length} 个表格`);
    
    tableContainers.forEach((container, index) => {
        const styles = window.getComputedStyle(container);
        const overflowX = styles.overflowX;
        
        console.log(`📋 表格容器 ${index + 1}:`);
        console.log(`  - overflow-x: ${overflowX} ${overflowX === 'auto' ? '✅' : '❌'}`);
        
        // 检查是否有横向滚动条
        if (container.scrollWidth > container.clientWidth) {
            console.log(`  - 横向滚动: ✅ 可滚动 (${container.scrollWidth}px > ${container.clientWidth}px)`);
        } else {
            console.log(`  - 横向滚动: ⚠️ 无需滚动 (${container.scrollWidth}px <= ${container.clientWidth}px)`);
        }
    });
}

function checkPageLayout() {
    console.log('\n🎨 检查页面整体布局...');
    
    const body = document.body;
    const main = document.querySelector('.main');
    const content = document.querySelector('.content');
    
    const bodyStyles = window.getComputedStyle(body);
    const mainStyles = window.getComputedStyle(main);
    const contentStyles = window.getComputedStyle(content);
    
    console.log('📋 页面布局检查:');
    console.log(`  - body overflow-x: ${bodyStyles.overflowX}`);
    console.log(`  - main max-width: ${mainStyles.maxWidth}`);
    console.log(`  - content overflow-x: ${contentStyles.overflowX} ${contentStyles.overflowX === 'hidden' ? '✅' : '❌'}`);
    console.log(`  - content min-width: ${contentStyles.minWidth}`);
    
    // 检查页面是否有横向滚动
    const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    console.log(`  - 页面横向滚动: ${hasHorizontalScroll ? '❌ 存在' : '✅ 不存在'}`);
    
    // 检查窗口尺寸
    console.log(`  - 视窗宽度: ${window.innerWidth}px`);
    console.log(`  - 文档宽度: ${document.documentElement.scrollWidth}px`);
}

// 提供手动测试函数
function testSpecificCodeBlock(index = 0) {
    const codeBlocks = document.querySelectorAll('.article-content pre');
    if (index < codeBlocks.length) {
        const block = codeBlocks[index];
        console.log(`🔍 测试代码块 ${index + 1}:`);
        
        // 高亮显示
        block.style.border = '3px solid red';
        block.style.animation = 'pulse 1s infinite';
        
        // 滚动到代码块
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            block.style.border = '';
            block.style.animation = '';
        }, 3000);
        
        checkCodeBlocks();
    } else {
        console.log('❌ 代码块索引超出范围');
    }
}

// 页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testCodeBlockOverflow);
} else {
    testCodeBlockOverflow();
}

// 导出测试函数
window.codeBlockTest = {
    testCodeBlockOverflow,
    checkCodeBlocks,
    checkTables,
    checkPageLayout,
    testSpecificCodeBlock
};

console.log('💡 代码块溢出测试脚本已加载。');
console.log('💡 可以使用以下函数进行手动测试:');
console.log('   - window.codeBlockTest.testCodeBlockOverflow() - 完整测试');
console.log('   - window.codeBlockTest.testSpecificCodeBlock(0) - 测试特定代码块');
console.log('   - window.codeBlockTest.checkPageLayout() - 检查页面布局');

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}
`;
document.head.appendChild(style);
