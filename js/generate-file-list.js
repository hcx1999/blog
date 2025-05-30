#!/usr/bin/env node

/**
 * 文件列表生成器
 * 扫描 Vault 目录中的所有 .md 文件，生成 files.json
 * 使用方法：node generate-file-list.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const VAULT_DIR = '../Vault';
const OUTPUT_FILE = 'files.json';

/**
 * 递归扫描目录，查找所有 .md 文件
 * @param {string} dir - 要扫描的目录
 * @param {string} baseDir - 基础目录（用于计算相对路径）
 * @returns {Array} 文件列表
 */
function scanDirectory(dir, baseDir = dir) {
    const files = [];
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // 跳过 attachments 目录和隐藏目录
                if (item === 'attachments' || item.startsWith('.')) {
                    continue;
                }
                // 递归扫描子目录
                files.push(...scanDirectory(fullPath, baseDir));
            } else if (stat.isFile() && item.endsWith('.md')) {
                // 计算相对于 Vault 目录的路径
                const relativePath = path.relative(baseDir, fullPath);
                // 将 Windows 路径分隔符转换为 Unix 格式
                const normalizedPath = relativePath.replace(/\\/g, '/');
                
                // 获取文件信息
                const fileInfo = {
                    filename: normalizedPath,
                    size: stat.size,
                    modified: stat.mtime.toISOString(),
                    created: stat.birthtime.toISOString()
                };
                
                files.push(fileInfo);
            }
        }
    } catch (error) {
        console.error(`扫描目录 ${dir} 时出错:`, error.message);
    }
    
    return files;
}

/**
 * 生成文件列表
 */
function generateFileList() {
    console.log('🔍 开始扫描 Vault 目录...');
    
    // 检查 Vault 目录是否存在
    if (!fs.existsSync(VAULT_DIR)) {
        console.error(`❌ 目录 ${VAULT_DIR} 不存在`);
        process.exit(1);
    }
    
    // 扫描文件
    const files = scanDirectory(VAULT_DIR);
    
    if (files.length === 0) {
        console.warn('⚠️  未找到任何 .md 文件');
    } else {
        console.log(`✅ 找到 ${files.length} 个 Markdown 文件:`);
        files.forEach(file => {
            console.log(`   - ${file.filename}`);
        });
    }
    
    // 生成文件列表数据
    const fileListData = {
        generated: new Date().toISOString(),
        generator: 'generate-file-list.js',
        version: '1.0',
        totalFiles: files.length,
        files: files
    };
    
    // 确保 js 目录存在
    const jsDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(jsDir)) {
        fs.mkdirSync(jsDir, { recursive: true });
    }
    
    // 写入文件
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fileListData, null, 2), 'utf8');
        console.log(`📝 文件列表已生成: ${OUTPUT_FILE}`);
        console.log(`📊 统计信息:`);
        console.log(`   - 总文件数: ${files.length}`);
        console.log(`   - 生成时间: ${fileListData.generated}`);
    } catch (error) {
        console.error(`❌ 写入文件失败:`, error.message);
        process.exit(1);
    }
}

/**
 * 主函数
 */
function main() {
    console.log('📋 Markdown 文件列表生成器');
    console.log('================================');
    
    try {
        generateFileList();
        console.log('================================');
        console.log('🎉 生成完成！');
        console.log('');
        console.log('💡 提示：');
        console.log('   - 每次添加新的 .md 文件后都需要重新运行此脚本');
        console.log('   - 可以将此脚本添加到 package.json 或 CI/CD 流程中');
        console.log('   - 建议在部署前自动运行此脚本');
    } catch (error) {
        console.error('❌ 生成过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    scanDirectory,
    generateFileList
};
