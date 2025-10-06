#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VAULT_DIR = 'Vault';
const OUTPUT_FILE = 'scripts/files.json';
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
                // 跳过隐藏目录和特殊目录
                if (item.startsWith('.') || item === 'attachments') {
                    console.log(`跳过目录: ${item}`);
                    continue;
                }
                
                // 递归扫描子目录
                files.push(...scanDirectory(fullPath, baseDir));
            } else if (stat.isFile() && item.endsWith('.md')) {
                // 计算相对于基础目录的路径
                const relativePath = path.relative(baseDir, fullPath);
                
                // 只保留文件名，不包含路径
                const filename = path.basename(fullPath);
                
                files.push({
                    filename: filename,
                    size: stat.size,
                    modified: stat.mtime.toISOString(),
                    created: stat.birthtime.toISOString()
                });
                
                console.log(`找到文件: ${filename} (${stat.size} bytes)`);
            }
        }
    } catch (error) {
        console.error(`扫描目录 ${dir} 时出错:`, error.message);
    }
    
    return files;
}

/**
 * 生成文件列表JSON
 */
function generateFileList() {
    console.log(`开始扫描 ${VAULT_DIR} 目录...`);
    
    // 检查输入目录是否存在
    if (!fs.existsSync(VAULT_DIR)) {
        console.error(`错误: 目录 ${VAULT_DIR} 不存在`);
        process.exit(1);
    }
    
    // 扫描文件
    const files = scanDirectory(VAULT_DIR);
    
    // 按文件名排序
    files.sort((a, b) => a.filename.localeCompare(b.filename));
    
    // 生成输出数据
    const output = {

        generated: new Date().toISOString(),
        generator: 'generate-file-list.js',
        version: '1.0',
        totalFiles: files.length,
        files: files
    };
    
    // 确保输出目录存在
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`创建输出目录: ${outputDir}`);
    }
    
    // 写入文件
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n✅ 成功生成文件列表: ${OUTPUT_FILE}`);
        console.log(`📊 统计信息:`);
        console.log(`   - 总文件数: ${files.length}`);
        console.log(`   - 生成时间: ${output.generated}`);
        console.log(`   - 输出大小: ${fs.statSync(OUTPUT_FILE).size} bytes`);
        
        if (files.length > 0) {
            console.log(`\n📝 文件列表:`);
            files.forEach((file, index) => {
                const sizeKB = (file.size / 1024).toFixed(1);
                console.log(`   ${index + 1}. ${file.filename} (${sizeKB} KB)`);
            });
        }
    } catch (error) {
        console.error(`写入文件失败:`, error.message);
        process.exit(1);
    }
}

// 主程序
if (require.main === module) {
    console.log('🔍 Markdown 文件列表生成器');
    console.log('================================');
    generateFileList();
    console.log('\n🎉 完成！');
}

module.exports = {
    scanDirectory,
    generateFileList
};
