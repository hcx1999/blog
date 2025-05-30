/**
 * 博客分类工具
 * 根据文件名提取文章分类
 */

/**
 * 根据文件名提取文章分类
 * @param {string} filename - Markdown文件名
 * @returns {string} - 分类名称
 */
function extractCategory(filename) {
    if (filename.includes('AI')) return 'AI';
    if (filename.includes('js')) return 'JavaScript';
    if (filename.includes('Linux')) return 'Linux';
    if (filename.includes('Math')) return 'Math';
    if (filename.includes('Python')) return 'Python';
    if (filename.includes('C++')) return 'C&C++';
    if (filename.includes('AI')) return 'AI';
    return '其他';
}

// 将函数导出，使其可在其他脚本中使用
window.CategoryUtil = {
    extractCategory
};