import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { imageMap } from '../utils/vault';
import remarkMathFix from '../utils/remarkMathFix';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const preprocessContent = (text: string) => {
    let result = text;
    result = result.replace(/!\[\[([^\]]+)\]\]/g, (_match, imageName) => {
      const imageUrl = imageMap.get(imageName) || imageMap.get(imageName.replace(/\s+/g, '%20')) || '';
      if (imageUrl) {
        return `![${imageName}](${imageUrl})`;
      }
      return `*[图片未找到: ${imageName}]*`;
    });
    return result;
  };

  const processedText = preprocessContent(content);

  const generateId = (children: React.ReactNode) => {
    if (typeof children === 'string') {
      return children.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
    }
    return undefined;
  };

  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkMathFix]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 id={generateId(children)} className="text-3xl font-bold mt-8 mb-4" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={generateId(children)} className="text-2xl font-bold mt-6 mb-3" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={generateId(children)} className="text-xl font-bold mt-5 mb-2" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={generateId(children)} className="text-lg font-bold mt-4 mb-2" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 id={generateId(children)} className="text-base font-bold mt-3 mb-2" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 id={generateId(children)} className="text-sm font-bold mt-3 mb-2" {...props}>
              {children}
            </h6>
          ),
          pre: ({ node, ...props }) => {
            let codeText = '';
            try {
              const codeElement = node?.children?.[0] as any;
              if (codeElement?.children?.[0]?.value) {
                codeText = codeElement.children[0].value;
              }
            } catch {
            }
            return (
              <div className="relative group">
                <pre {...props} className="rounded-lg" />
                <button
                  onClick={() => copyCode(codeText)}
                  className={cn(
                    "absolute top-2 right-2 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                    "bg-gray-700 hover:bg-gray-600 text-white"
                  )}
                >
                  {copiedCode === codeText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            );
          },
          code: ({ className, children, ...props }) => {
            return (
              <code className={cn(className, className?.includes('language-') ? '' : 'px-1.5 py-0.5 rounded text-sm')} {...props}>
                {children}
              </code>
            );
          },
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              {...props}
            />
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary-500 pl-4 py-1 my-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
              {children}
            </td>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold" {...props}>
              {children}
            </th>
          ),
        }}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};
