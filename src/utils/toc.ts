import type { TOCItem } from '../types';

export const extractTOC = (content: string): TOCItem[] => {
  const toc: TOCItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const idCounts = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseId = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
    
    const count = idCounts.get(baseId) || 0;
    idCounts.set(baseId, count + 1);
    
    const id = count > 0 ? `${baseId}-${count}` : baseId;
    toc.push({ id, text, level });
  }

  return toc;
};
