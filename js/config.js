// 博客系统配置文件
function computeContentBasePath() {
    const path = window.location.pathname;
    const pagesSegment = '/pages/';
    const pagesIndex = path.indexOf(pagesSegment);

    if (pagesIndex === -1) {
        return '';
    }

    const suffix = path.slice(pagesIndex + pagesSegment.length);
    const segments = suffix.split('/').filter(Boolean);

    if (segments.length > 0 && segments[segments.length - 1].includes('.')) {
        segments.pop();
    }

    return '../'.repeat(segments.length + 1);
}

const contentBasePath = computeContentBasePath();

const BlogConfig = {
    // 内容目录配置
    contentDir: `${contentBasePath}Vault`,
    
    // 附件目录配置
    attachmentsDir: 'attachments',    // 缓存设置
    cache: {
        // 本地存储键名
        filesKey: 'markdown_files_cache',
        // 缓存有效期（毫秒）
        duration: 86400000, // 24小时
        // 当前版本号 - 修改此版本号会强制清除旧缓存
        version: '2.0'
    },
    
    // 调试设置
    debug: {
        enabled: false,
        verbose: false
    },
    
    // 获取内容文件路径
    getContentFilePath: function(filename) {
        return `${this.contentDir}/${filename}`;
    },
    
    // 获取附件路径
    getAttachmentPath: function(filename) {
        return `${this.contentDir}/${this.attachmentsDir}/${filename}`;
    },
    
    // 获取内容目录根路径
    getContentDirPath: function() {
        return this.contentDir;
    },
      // 获取附件目录根路径
    getAttachmentsDirPath: function() {
        return `${this.contentDir}/${this.attachmentsDir}`;
    }
};

// 防止配置被意外修改
Object.freeze(BlogConfig);