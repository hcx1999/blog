import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { NotebookRenderer } from '../components/NotebookRenderer';
import { TableOfContents } from '../components/TableOfContents';
import { extractTOC } from '../utils/toc';
import type { TOCItem, NotebookCell } from '../types';
import { FileText } from 'lucide-react';

const extractNotebookTOC = (content: string): TOCItem[] => {
  try {
    const notebook = JSON.parse(content) as { cells?: NotebookCell[] };
    const toc: TOCItem[] = [];
    const idCounts = new Map<string, number>();
    
    notebook.cells?.forEach((cell: NotebookCell) => {
      if (cell.cell_type === 'markdown') {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        const lines = source.split('\n');
        
        lines.forEach((line: string) => {
          const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();
            const baseId = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
            
            const count = idCounts.get(baseId) || 0;
            idCounts.set(baseId, count + 1);
            
            const id = count > 0 ? `${baseId}-${count}` : baseId;
            
            toc.push({ id, text, level });
          }
        });
      }
    });
    
    return toc;
  } catch {
    return [];
  }
};

export const ArticlePage: React.FC = () => {
  const { path } = useParams<{ path: string }>();
  const { posts } = useAppContext();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const decodedPath = path ? decodeURIComponent(path) : '';
  const post = posts.find(p => p.id === decodedPath);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500 dark:text-gray-400">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">文章未找到</p>
      </div>
    );
  }

  const tocItems = post.type === 'markdown' 
    ? extractTOC(post.content) 
    : extractNotebookTOC(post.content);

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0" ref={contentRef}>
        <article className="max-w-3xl mx-auto">
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          </header>

          <div className="article-content">
            {post.type === 'markdown' ? (
              <MarkdownRenderer content={post.content} />
            ) : (
              <NotebookRenderer content={post.content} />
            )}
          </div>
        </article>
      </div>

      <aside className="hidden lg:block w-56 flex-shrink-0">
        <TableOfContents items={tocItems} contentRef={contentRef} />
      </aside>
    </div>
  );
};
