import type { TOCItem } from '../types';

export const extractTOC = (content: string): TOCItem[] => {
  const toc: TOCItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
    toc.push({ id, text, level });
  }

  return toc;
};
