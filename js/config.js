// 博客系统配置文件
const BlogConfig = {
    // 内容目录配置
    contentDir: 'Vault',
    
    // 附件目录配置
    attachmentsDir: 'attachments',
      // 缓存设置
    cache: {
        // 本地存储键名
        filesKey: 'markdown_files_cache',
        // 缓存有效期（毫秒）
        maxAge: 86400000, // 24小时
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