import type { BlogPost, FileType, NotebookCell } from '../types';

export interface VaultFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  content?: string;
}

export interface VaultCategory {
  name: string;
  files: VaultFile[];
}

const IMPORT_MD: Record<string, string> = import.meta.glob('/vault/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const IMPORT_NB: Record<string, string> = import.meta.glob('/vault/**/*.ipynb', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const IMPORT_IMAGES: Record<string, string> = import.meta.glob('/vault/**/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true, import: 'default' }) as Record<string, string>;

// 创建图片名称到URL的映射
export const imageMap: Map<string, string> = new Map();
for (const path in IMPORT_IMAGES) {
  const fileName = path.split('/').pop() || '';
  imageMap.set(fileName, IMPORT_IMAGES[path]);
  // 也支持不带扩展名的查找
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  imageMap.set(nameWithoutExt, IMPORT_IMAGES[path]);
}

export const getVaultStructure = (): VaultFile[] => {
  const files: VaultFile[] = [];

  for (const path in IMPORT_MD) {
    const relativePath = path.replace('/vault/', '');
    const parts = relativePath.split('/');
    const fileName = parts[parts.length - 1];
    files.push({
      name: fileName.replace('.md', ''),
      path: relativePath,
      type: 'file',
      extension: 'md',
      content: IMPORT_MD[path],
    });
  }

  for (const path in IMPORT_NB) {
    const relativePath = path.replace('/vault/', '');
    const parts = relativePath.split('/');
    const fileName = parts[parts.length - 1];
    files.push({
      name: fileName.replace('.ipynb', ''),
      path: relativePath,
      type: 'file',
      extension: 'ipynb',
      content: IMPORT_NB[path],
    });
  }

  return files;
};

export const getCategoryFromPath = (path: string): string => {
  const parts = path.split('/');
  if (parts.length > 1) {
    return parts[0];
  }
  return '未分类';
};

export const loadVaultPosts = (): BlogPost[] => {
  const files = getVaultStructure();
  const posts: BlogPost[] = [];

  for (const file of files) {
    if (file.type !== 'file' || !file.content) continue;

    const fileType: FileType = file.extension === 'ipynb' ? 'notebook' : 'markdown';
    const category = getCategoryFromPath(file.path);

    let title = file.name;
    const content = file.content;

    if (fileType === 'markdown') {
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
    } else {
      try {
        const nb = JSON.parse(content) as { cells?: NotebookCell[] };
        if (nb.cells && nb.cells.length > 0) {
          const firstCell = nb.cells[0];
          if (firstCell.cell_type === 'markdown' && firstCell.source) {
            const source = Array.isArray(firstCell.source) ? firstCell.source.join('') : firstCell.source;
            const titleMatch = source.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              title = titleMatch[1];
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse notebook:', file.path, error);
      }
    }

    posts.push({
      id: file.path,
      title,
      slug: file.name.toLowerCase().replace(/\s+/g, '-'),
      content,
      type: fileType,
      category,
      tags: [category],
      createdAt: new Date().toISOString().split('T')[0],
      excerpt: content.substring(0, 100) + '...',
    });
  }

  return posts;
};

export const getVaultCategories = (): string[] => {
  const files = getVaultStructure();
  const categories = new Set<string>();

  for (const file of files) {
    const category = getCategoryFromPath(file.path);
    categories.add(category);
  }

  return Array.from(categories);
};

export const getVaultHierarchy = (): VaultCategory[] => {
  const files = getVaultStructure();
  const categoryMap = new Map<string, VaultFile[]>();

  for (const file of files) {
    const category = getCategoryFromPath(file.path);
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(file);
  }

  const result: VaultCategory[] = [];
  for (const [name, filesList] of categoryMap) {
    result.push({ name, files: filesList });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
};
