import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';

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

  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h1 id={id} className="text-3xl font-bold mt-8 mb-4" {...props} />;
          },
          h2: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h2 id={id} className="text-2xl font-bold mt-6 mb-3" {...props} />;
          },
          h3: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h3 id={id} className="text-xl font-bold mt-5 mb-2" {...props} />;
          },
          h4: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h4 id={id} className="text-lg font-bold mt-4 mb-2" {...props} />;
          },
          h5: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h5 id={id} className="text-base font-bold mt-3 mb-2" {...props} />;
          },
          h6: ({ ...props }) => {
            const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') || '';
            return <h6 id={id} className="text-sm font-bold mt-3 mb-2" {...props} />;
          },
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
          img: ({ ...props }) => (
            <img
              loading="lazy"
              className="max-w-full h-auto rounded-lg shadow-sm my-4"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary-500 pl-4 py-1 my-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
              {...props}
            />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
