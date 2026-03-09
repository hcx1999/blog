import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { InlineMath, BlockMath } from 'react-katex';
import { Copy, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import { imageMap } from '../utils/vault';

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

  // 预处理：将数学公式和图片提取出来并替换为占位符
  const preprocessContent = (text: string) => {
    const mathBlocks: { type: 'block' | 'inline'; formula: string; placeholder: string }[] = [];
    const imageBlocks: { url: string; alt: string; placeholder: string }[] = [];
    let result = text;
    let counter = 0;

    // 先处理 Obsidian 图片格式 ![[image.png]]
    result = result.replace(/!\[\[([^\]]+)\]\]/g, (_match, imageName) => {
      const placeholder = `OBSIDIAN_IMAGE_${counter++}`;
      const imageUrl = imageMap.get(imageName) || imageMap.get(imageName.replace(/\s+/g, '%20')) || '';
      imageBlocks.push({ url: imageUrl, alt: imageName, placeholder });
      return placeholder;
    });

    // 处理行间公式 $$...$$（支持多行）
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
      const placeholder = `MATH_BLOCK_${counter++}`;
      mathBlocks.push({ type: 'block', formula: formula.trim(), placeholder });
      return placeholder;
    });

    // 处理行内公式 $...$（不匹配 $$）
    // 使用更宽松的正则，允许更多字符
    result = result.replace(/\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_match, formula) => {
      const placeholder = `MATH_INLINE_${counter++}`;
      mathBlocks.push({ type: 'inline', formula: formula.trim(), placeholder });
      return placeholder;
    });

    return { processedText: result, mathBlocks, imageBlocks };
  };

  const { processedText, mathBlocks, imageBlocks } = preprocessContent(content);

  // 处理文本节点，将占位符替换为对应组件
  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      let result: React.ReactNode[] = [node];
      
      // 处理图片占位符
      imageBlocks.forEach((block, index) => {
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          
          const parts = item.split(block.placeholder);
          if (parts.length === 1) return [item];
          
          return parts.reduce<React.ReactNode[]>((acc, part, i) => {
            if (i > 0) {
              if (block.url) {
                acc.push(
                  <img
                    key={`img-${index}-${i}`}
                    src={block.url}
                    alt={block.alt}
                    loading="lazy"
                    className="max-w-full h-auto rounded-lg shadow-sm my-4"
                  />
                );
              } else {
                acc.push(
                  <span key={`img-${index}-${i}`} className="text-red-500 text-sm">
                    [图片未找到: {block.alt}]
                  </span>
                );
              }
            }
            if (part) acc.push(part);
            return acc;
          }, []);
        });
      });
      
      // 处理数学公式占位符
      mathBlocks.forEach((block, index) => {
        result = result.flatMap(item => {
          if (typeof item !== 'string') return [item];
          
          const parts = item.split(block.placeholder);
          if (parts.length === 1) return [item];
          
          return parts.reduce<React.ReactNode[]>((acc, part, i) => {
            if (i > 0) {
              if (block.type === 'block') {
                acc.push(
                  <div key={`math-${index}-${i}`} className="my-6 flex justify-center">
                    <BlockMath math={block.formula} />
                  </div>
                );
              } else {
                acc.push(<InlineMath key={`math-${index}-${i}`} math={block.formula} />);
              }
            }
            if (part) acc.push(part);
            return acc;
          }, []);
        });
      });
      
      return result.length === 1 ? result[0] : result;
    }
    
    if (Array.isArray(node)) {
      return node.map((child, index) => (
        <React.Fragment key={index}>{processNode(child)}</React.Fragment>
      ));
    }
    
    return node;
  };

  // 生成标题ID
  const generateId = (children: React.ReactNode) => {
    if (typeof children === 'string') {
      return children.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
    }
    return undefined;
  };

  return (
    <div className="prose-custom">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 id={generateId(children)} className="text-3xl font-bold mt-8 mb-4" {...props}>
              {processNode(children)}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={generateId(children)} className="text-2xl font-bold mt-6 mb-3" {...props}>
              {processNode(children)}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={generateId(children)} className="text-xl font-bold mt-5 mb-2" {...props}>
              {processNode(children)}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={generateId(children)} className="text-lg font-bold mt-4 mb-2" {...props}>
              {processNode(children)}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 id={generateId(children)} className="text-base font-bold mt-3 mb-2" {...props}>
              {processNode(children)}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 id={generateId(children)} className="text-sm font-bold mt-3 mb-2" {...props}>
              {processNode(children)}
            </h6>
          ),
          p: ({ children, ...props }) => (
            <p {...props}>{processNode(children)}</p>
          ),
          li: ({ children, ...props }) => (
            <li {...props}>{processNode(children)}</li>
          ),
          span: ({ children, ...props }) => (
            <span {...props}>{processNode(children)}</span>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props}>{processNode(children)}</strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props}>{processNode(children)}</em>
          ),
          a: ({ children, ...props }) => (
            <a {...props}>{processNode(children)}</a>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
              {processNode(children)}
            </td>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold" {...props}>
              {processNode(children)}
            </th>
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
              {processNode(children)}
            </blockquote>
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
        }}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};
