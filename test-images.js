// 测试图片处理功能
console.log('🧪 开始测试图片处理功能...');

function testImageProcessing() {
    // 等待博客应用加载
    setTimeout(() => {
        if (typeof blog === 'undefined') {
            console.error('❌ 博客应用未加载');
            return;
        }
        
        console.log('✅ 博客应用已加载');
        
        // 查找包含图片的文章
        const articlesWithImages = blog.articles.filter(article => 
            article.content.includes('![[attachments/') || 
            article.content.includes('![')
        );
        
        console.log(`📄 找到 ${articlesWithImages.length} 篇包含图片的文章:`);
        articlesWithImages.forEach(article => {
            console.log(`  - ${article.title}`);
        });
        
        if (articlesWithImages.length > 0) {
            // 测试第一篇包含图片的文章
            const testArticle = articlesWithImages[0];
            console.log(`\n🔍 测试文章: ${testArticle.title}`);
            
            // 显示文章
            blog.showArticle(testArticle.id);
            
            // 等待文章渲染完成
            setTimeout(() => {
                console.log('\n📄 文章已显示，开始检查图片...');
                checkImages();
            }, 2000);
        }
        
    }, 2000);
}

function checkImages() {
    const images = document.querySelectorAll('.article-content img');
    console.log(`🖼️ 找到 ${images.length} 个图片元素`);
    
    images.forEach((img, index) => {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        
        console.log(`📷 图片 ${index + 1}:`);
        console.log(`  - src: ${src}`);
        console.log(`  - alt: ${alt}`);
        
        // 检查图片是否正确编码
        if (src && src.includes('Vault/attachments/')) {
            console.log(`  - ✅ 路径包含 Vault/attachments/`);
            
            // 检查是否正确处理了空格
            if (src.includes('%20')) {
                console.log(`  - ✅ 空格已正确编码为 %20`);
            } else if (src.includes(' ')) {
                console.log(`  - ⚠️ 路径包含未编码的空格`);
            }
        } else {
            console.log(`  - ❌ 路径不包含 Vault/attachments/`);
        }
        
        // 检查图片加载状态
        if (img.complete) {
            if (img.naturalWidth === 0) {
                console.log(`  - ❌ 图片加载失败`);
            } else {
                console.log(`  - ✅ 图片加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
            }
        } else {
            console.log(`  - ⏳ 图片正在加载...`);
            
            // 监听加载完成事件
            img.addEventListener('load', () => {
                console.log(`  - ✅ 图片 ${index + 1} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
            });
            
            img.addEventListener('error', () => {
                console.log(`  - ❌ 图片 ${index + 1} 加载失败`);
            });
        }
    });
    
    console.log('\n🎉 图片检查完成！');
}

// 测试 Obsidian 图片语法转换
function testObsidianSyntax() {
    console.log('\n🔍 测试 Obsidian 图片语法转换...');
    
    const testCases = [
        '![[attachments/Pasted image 20250421173342.png]]',
        '![[Pasted image 20250422171543.png]]',
        '![[attachments/test image.png]]',
        '![[test.jpg]]'
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`📝 测试用例 ${index + 1}: ${testCase}`);
        
        if (typeof blog !== 'undefined' && blog.processObsidianImages) {
            const result = blog.processObsidianImages(testCase);
            console.log(`  - 转换结果: ${result}`);
            
            // 检查是否正确转换
            if (result.startsWith('![') && result.includes('](attachments/')) {
                console.log(`  - ✅ 转换成功`);
            } else {
                console.log(`  - ❌ 转换失败`);
            }
        } else {
            console.log(`  - ❌ processObsidianImages 方法不可用`);
        }
    });
}

// 页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testImageProcessing);
} else {
    testImageProcessing();
}

// 导出测试函数
window.imageTest = {
    testImageProcessing,
    checkImages,
    testObsidianSyntax
};

console.log('💡 图片测试脚本已加载。');
console.log('💡 可以使用以下函数进行手动测试:');
console.log('   - window.imageTest.testImageProcessing() - 完整测试');
console.log('   - window.imageTest.checkImages() - 检查当前页面图片');
console.log('   - window.imageTest.testObsidianSyntax() - 测试语法转换');
