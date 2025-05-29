/**
 * 高级图片处理实用工具
 * 用于解决Obsidian格式图片引用的渲染问题
 * 
 * 使用方式：
 * 1. 在HTML页面中引入此脚本
 * 2. 调用 ImageFixUtil.init() 开始自动修复
 * 3. 或者调用特定函数手动修复特定问题
 */
var ImageFixUtil = (function() {
    
    // 配置选项
    var config = {
        debug: true,
        imageBaseDir: 'Vault/attachments/',
        autoFix: true,
        checkInterval: 2000 // 毫秒
    };
    
    /**
     * 初始化图片修复工具
     * @param {Object} options - 配置选项
     */    function init(options) {
        // 处理默认参数值
        options = options || {};
        
        // 合并配置
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                config[key] = options[key];
            }
        }
        
        log('ImageFixUtil 初始化...');
        
        // 初始扫描
        scanAndFixImages();
        
        if (config.autoFix) {
            // 设置定时扫描
            setInterval(scanAndFixImages, config.checkInterval);
            log('已启用自动修复，检查间隔: ' + config.checkInterval + 'ms');
        }
        
        // 修复Obsidian格式的图片引用
        fixObsidianSyntax();
        
        return {
            message: '图片修复工具已初始化',
            status: 'ready'
        };
    }
    
    /**
     * 扫描并修复页面中的图片
     */    function scanAndFixImages() {
        var images = document.querySelectorAll('img');
        log('扫描到 ' + images.length + ' 张图片');
        
        var fixedCount = 0;
        
        // 将forEach转换为普通for循环
        for (var i = 0; i < images.length; i++) {
            var img = images[i];
            var index = i;
            var src = img.getAttribute('src');
            if (!src) continue;
            
            if (needsPathFix(src)) {
                var fixedPath = fixImagePath(src);
                if (fixedPath !== src) {
                    img.setAttribute('src', fixedPath);
                    fixedCount++;
                    
                    log('修复图片 #' + (index + 1) + ': "' + src + '" -> "' + fixedPath + '"');
                }
            }
            
            // 添加错误处理
            if (!img.hasAttribute('data-error-handled')) {
                addImageErrorHandler(img);
                img.setAttribute('data-error-handled', 'true');
            }
        }
        
        if (fixedCount > 0) {
            log('修复了 ' + fixedCount + ' 张图片的路径');
        }
    }
    
    /**
     * 判断图片路径是否需要修复
     * @param {string} path - 图片路径
     * @returns {boolean} 是否需要修复
     */    function needsPathFix(path) {
        if (!path) return false;
        if (path.indexOf('http') === 0) return false;
        if (path.indexOf('data:') === 0) return false;
        
        // 检查是否已经正确指向Vault/attachments目录
        if (path.indexOf('Vault/attachments/') !== -1) return false;
        
        // 检查是否需要添加attachments路径
        if (path.indexOf('attachments/') !== -1) {
            if (path.indexOf('attachments/') !== 0 && path.indexOf('/attachments/') !== 0) {
                return true;
            }
        }
        
        // 检查是否需要添加基础路径
        if (path.indexOf('attachments/') === -1) {
            return true;
        }
        
        // 检查是否包含空格但未编码
        if (path.indexOf(' ') !== -1 && !pathIsEncoded(path)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 修复图片路径
     * @param {string} path - 原始图片路径
     * @returns {string} 修复后的路径
     */    function fixImagePath(path) {
        if (!path) return path;
        
        var fixedPath = path;
        
        // 处理各种路径格式
        if (path.indexOf('attachments/') === 0) {
            fixedPath = 'Vault/' + path;
        } else if (path.indexOf('attachments/') !== -1) {
            // 提取attachments及其之后的部分
            var parts = path.split('attachments/');
            fixedPath = 'Vault/attachments/' + parts[parts.length - 1];
        } else if (path.indexOf('/') === -1) {
            // 只有文件名
            fixedPath = config.imageBaseDir + path;
        }
        
        // 处理空格等特殊字符
        if (fixedPath.indexOf(' ') !== -1 && !pathIsEncoded(fixedPath)) {
            fixedPath = encodeImagePath(fixedPath);
        }
        
        return fixedPath;
    }
    
    /**
     * 检查路径是否已编码
     * @param {string} path - 图片路径
     * @returns {boolean} 是否已编码
     */    function pathIsEncoded(path) {
        return path.indexOf('%20') !== -1 || path.indexOf('%2F') !== -1 || path.indexOf('%3A') !== -1;
    }
    
    /**
     * 对图片路径进行URL编码，但保留路径分隔符
     * @param {string} path - 要编码的路径
     * @returns {string} 编码后的路径
     */
    function encodeImagePath(path) {
        var parts = path.split('/');
        var encodedParts = [];
        
        for (var i = 0; i < parts.length; i++) {
            encodedParts.push(encodeURIComponent(parts[i]));
        }
        
        var encodedPath = encodedParts.join('/');
        return encodedPath;
    }
    
    /**
     * 添加图片加载错误处理
     * @param {HTMLImageElement} img - 图片元素
     */    function addImageErrorHandler(img) {
        var originalSrc = img.getAttribute('src');
        
        img.addEventListener('error', function() {
            if (img.hasAttribute('data-error-retry')) {
                // 已经尝试过重试，显示错误信息
                showImageError(img, originalSrc);
            } else {
                // 尝试修复路径并重试
                img.setAttribute('data-error-retry', 'true');
                
                // 尝试不同的路径格式
                var alternativePaths = generateAlternativePaths(originalSrc);
                
                // 尝试第一个替代路径
                if (alternativePaths.length > 0) {
                    var newPath = alternativePaths[0];
                    log('图片加载失败，尝试替代路径: "' + originalSrc + '" -> "' + newPath + '"');
                    img.src = newPath;
                    
                    // 保存所有替代路径，以便后续使用
                    img.setAttribute('data-alternative-paths', JSON.stringify(alternativePaths.slice(1)));
                } else {
                    showImageError(img, originalSrc);
                }
            }
        }, { once: true });
        
        // 还可以添加重试处理
        img.addEventListener('error', function() {
            if (img.hasAttribute('data-alternative-paths')) {
                try {
                    var remainingPaths = JSON.parse(img.getAttribute('data-alternative-paths'));
                    if (remainingPaths.length > 0) {
                        // 尝试下一个替代路径
                        var nextPath = remainingPaths.shift();
                        log('继续尝试替代路径: "' + nextPath + '"');
                        
                        img.src = nextPath;
                        img.setAttribute('data-alternative-paths', JSON.stringify(remainingPaths));
                        return;
                    }
                } catch (e) {
                    console.error('解析替代路径时出错:', e);
                }
            }
            
            // 如果所有替代路径都失败，显示错误信息
            showImageError(img, originalSrc);
        }, { once: true });
    }
    
    /**
     * 生成图片的替代路径
     * @param {string} originalPath - 原始路径
     * @returns {string[]} 替代路径列表
     */    function generateAlternativePaths(originalPath) {
        var paths = [];
        
        if (!originalPath) return paths;
        
        // 提取文件名
        var pathParts = originalPath.split('/');
        var fileName = pathParts[pathParts.length - 1];
        
        // 基础目录形式
        paths.push('Vault/attachments/' + fileName);
        
        // 编码形式
        if (fileName.indexOf(' ') !== -1) {
            fileName = encodeURIComponent(fileName);
            paths.push('Vault/attachments/' + fileName);
        } else if (fileName.indexOf('%20') !== -1) {
            // 如果已编码，尝试解码形式
            try {
                var decodedFileName = decodeURIComponent(fileName);
                paths.push('Vault/attachments/' + decodedFileName);
            } catch(e) {}
        }
        
        // 相对路径形式
        paths.push('attachments/' + fileName);
        
        // 尝试不同的大小写组合
        if (/[A-Z]/.test(fileName)) {
            paths.push('Vault/attachments/' + fileName.toLowerCase());
        }
        
        // 去重并过滤掉原始路径
        var uniquePaths = [];
        for (var i = 0; i < paths.length; i++) {
            if (paths[i] !== originalPath && uniquePaths.indexOf(paths[i]) === -1) {
                uniquePaths.push(paths[i]);
            }
        }
        return uniquePaths;
    }
    
    /**
     * 显示图片加载错误
     * @param {HTMLImageElement} img - 图片元素
     * @param {string} originalSrc - 原始图片路径
     */    function showImageError(img, originalSrc) {
        log('图片加载失败: "' + originalSrc + '"，显示错误占位符');
        
        // 保存原始样式和尺寸
        var originalStyle = {
            width: img.style.width || '',
            height: img.style.height || '',
            display: img.style.display || ''
        };
        
        // 创建错误占位元素
        var errorPlaceholder = document.createElement('div');
        errorPlaceholder.style.border = '2px dashed #e74c3c';
        errorPlaceholder.style.padding = '15px';
        errorPlaceholder.style.backgroundColor = '#fdf2f2';
        errorPlaceholder.style.color = '#e74c3c';
        errorPlaceholder.style.fontFamily = 'monospace';
        errorPlaceholder.style.fontSize = '12px';
        errorPlaceholder.style.width = img.clientWidth ? (img.clientWidth + 'px') : '300px';
        errorPlaceholder.style.minHeight = '60px';
        errorPlaceholder.style.display = 'flex';
        errorPlaceholder.style.flexDirection = 'column';
        errorPlaceholder.style.justifyContent = 'center';
        
        // 错误信息
        errorPlaceholder.innerHTML = 
            '<div style="margin-bottom: 10px;">' +
                '<strong>❌ 图片加载失败</strong>' +
            '</div>' +
            '<div style="font-size: 11px; word-break: break-all;">' +
                '路径: ' + originalSrc +
            '</div>' +
            '<div style="margin-top: 10px; font-size: 11px;">' +
                '<strong>可能的解决方案:</strong>' +
                '<ul style="margin: 5px 0 0 15px; padding: 0;">' +
                    '<li>确保图片文件存在于正确位置</li>' +
                    '<li>检查文件名大小写</li>' +
                    '<li>使用HTTP服务器而非file://协议</li>' +
                '</ul>' +
            '</div>' +
            '<div style="margin-top: 10px; text-align: center;">' +
                '<button style="font-size: 11px; padding: 3px 8px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;" ' +
                        'onclick="this.parentNode.parentNode.outerHTML=\'图片已移除\'">' +
                    '移除' +
                '</button>' +
            '</div>';
        
        // 替换原图片
        if (img.parentNode) {
            img.parentNode.replaceChild(errorPlaceholder, img);
        }
    }
    
    /**
     * 修复文档中的Obsidian语法图片引用
     */    function fixObsidianSyntax() {
        // 寻找所有内容元素
        var contentElements = findContentElements();
        log('找到 ' + contentElements.length + ' 个可能包含Markdown内容的元素');
        
        var fixedCount = 0;
        
        // 处理每个内容元素
        for (var i = 0; i < contentElements.length; i++) {
            var element = contentElements[i];
            var html = element.innerHTML;
            
            // 匹配Obsidian格式图片引用: ![[attachments/filename.png]]
            var regex = /!\[\[(attachments\/)?([^\]]+\.(png|jpg|jpeg|gif|svg|webp))\]\]/gi;
            
            if (regex.test(html)) {
                // 重置正则表达式状态
                regex.lastIndex = 0;
                
                // 替换所有匹配
                var newHtml = html.replace(regex, function(match, attachmentsPath, filename) {
                    // 如果已经包含attachments/路径，直接使用；否则添加attachments/前缀
                    var imagePath = attachmentsPath ? 
                        attachmentsPath + filename : 
                        'attachments/' + filename;
                    
                    // 转换为标准Markdown图片语法
                    var altText = filename.split('/').pop();
                    var result = '<img src="' + config.imageBaseDir + filename + '" alt="' + altText + '" data-obsidian-fixed="true">';
                    
                    fixedCount++;
                    return result;
                });
                
                if (html !== newHtml) {
                    element.innerHTML = newHtml;
                    log('修复了元素中的 ' + fixedCount + ' 个Obsidian图片引用');
                }
            }
        }
        
        if (fixedCount > 0) {
            log('总共修复了 ' + fixedCount + ' 个Obsidian图片引用');
        }
    }
    
    /**
     * 查找可能包含Markdown内容的元素
     * @returns {HTMLElement[]} 内容元素列表
     */    function findContentElements() {
        // 常见的内容容器选择器
        var selectors = [
            '#article-content',
            '.markdown-content',
            '.post-content',
            '.content',
            'article',
            '.markdown-body'
        ];
        
        // 尝试不同的选择器
        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i];
            var elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                // 转换为数组
                var elementsArray = [];
                for (var j = 0; j < elements.length; j++) {
                    elementsArray.push(elements[j]);
                }
                return elementsArray;
            }
        }
        
        // 如果找不到特定容器，尝试查找格式化文本块
        var contentBlocks = document.querySelectorAll('div > p, .main p, main p, section p');
        if (contentBlocks.length > 0) {
            // 转换为数组
            var blocksArray = [];
            for (var k = 0; k < contentBlocks.length; k++) {
                blocksArray.push(contentBlocks[k]);
            }
            return blocksArray;
        }
        
        // 回退到body
        return [document.body];
    }
    
    /**
     * 日志输出
     * @param {string} message - 日志消息
     */    function log(message) {
        if (config.debug) {
            console.log('[ImageFixUtil] ' + message);
        }
    }
      // 公开API
    return {
        init: init,
        fixImagePath: fixImagePath,
        scanAndFixImages: scanAndFixImages,
        fixObsidianSyntax: fixObsidianSyntax,
        encodeImagePath: encodeImagePath
    };
})();

// 如果在浏览器环境中，自动初始化
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // 等待页面完全加载，然后初始化
        setTimeout(function() {
            ImageFixUtil.init();
        }, 500);
    });
}
