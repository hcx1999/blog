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
    if (typeof filename !== 'string' || filename.trim() === '') {
        return '其他';
    }

    let safeName = filename;

    // 尝试解码 URI 编码的文件名，忽略解码错误
    try {
        safeName = decodeURIComponent(filename);
    } catch (_) {
        // 保持原始文件名
    }

    // 仅保留文件名部分并去掉扩展名
    const basename = safeName
        .split(/[\\/]/)
        .pop()
        .replace(/\.[^.]+$/, '')
        .trim();

    if (!basename) {
        return '其他';
    }

    // 统一化字符串，兼容全角字符并去除 BOM
    const normalized = basename
        .replace(/\uFEFF/g, '')
        .replace(/[_]+/g, ' ')
        .normalize('NFKC');

    // 提取第一个“单词”：连续的字母、数字或汉字
    const match = normalized.match(/^[\p{L}\p{N}\+\-]+/u);
    let firstWord = match ? match[0] : normalized.split(/\s+/).filter(Boolean)[0];

    if (!firstWord) {
        return '其他';
    }

    // ASCII 单词做基础格式化
    if (/^[a-z]+$/.test(firstWord)) {
        return firstWord.toUpperCase();
    }
    if (/^[A-Z]+$/.test(firstWord)) {
        return firstWord;
    }
    if (/^[A-Za-z]+$/.test(firstWord)) {
        return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }

    return firstWord;
}

// 将函数导出，使其可在其他脚本中使用
window.CategoryUtil = {
    extractCategory
};