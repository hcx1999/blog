import React from 'react';
import { Code, Terminal } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import 'highlight.js/styles/github.css';
import type { Notebook, NotebookOutput } from '../types';

interface NotebookRendererProps {
  content: string;
  articlePath?: string;
}

export const NotebookRenderer: React.FC<NotebookRendererProps> = ({ content, articlePath }) => {
  const [notebook, setNotebook] = React.useState<Notebook | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const parsed = JSON.parse(content) as Notebook;
      setNotebook(parsed);
    } catch {
      setError('Failed to parse notebook');
    }
  }, [content]);

  React.useEffect(() => {
    if (notebook) {
      setTimeout(() => {
        document.querySelectorAll('code.language-python').forEach((el) => {
          hljs.highlightElement(el as HTMLElement);
        });
      }, 100);
    }
  }, [notebook]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  if (!notebook) {
    return <div className="p-4">Loading notebook...</div>;
  }

  const getSource = (source: string | string[]): string => {
    return Array.isArray(source) ? source.join('') : source;
  };

  const renderOutput = (output: NotebookOutput, index: number) => {
    if (output.output_type === 'stream') {
      return (
        <div key={index} className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
          {output.text || ''}
        </div>
      );
    }

    if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
      const data = output.data;

      if (data?.['image/png']) {
        return (
          <div key={index} className="mt-2">
            <img
              src={`data:image/png;base64,${data['image/png']}`}
              alt="Notebook output"
              className="max-w-full h-auto rounded"
            />
          </div>
        );
      }

      if (data?.['image/jpeg']) {
        return (
          <div key={index} className="mt-2">
            <img
              src={`data:image/jpeg;base64,${data['image/jpeg']}`}
              alt="Notebook output"
              className="max-w-full h-auto rounded"
            />
          </div>
        );
      }

      if (data?.['image/svg+xml']) {
        const svgContent = Array.isArray(data['image/svg+xml']) ? data['image/svg+xml'].join('') : data['image/svg+xml'];
        return (
          <div
            key={index}
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(svgContent) }}
          />
        );
      }

      if (data?.['text/html']) {
        const htmlContent = Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html'];
        return (
          <div
            key={index}
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
          />
        );
      }

      if (data?.['text/plain']) {
        return (
          <div key={index} className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm">
            {data['text/plain']}
          </div>
        );
      }
    }

    if (output.output_type === 'error') {
      return (
        <div key={index} className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-sm font-mono">
          {output.ename}: {output.evalue}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {notebook.cells.map((cell, cellIndex) => {
        if (cell.cell_type === 'markdown') {
          return (
            <div key={cellIndex} className="prose-custom">
              <MarkdownRenderer content={getSource(cell.source)} articlePath={articlePath} />
            </div>
          );
        }

        if (cell.cell_type === 'code') {
          return (
            <div key={cellIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <Code className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-mono">In [{cellIndex + 1}]:</span>
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono">
                <code className="language-python">{getSource(cell.source)}</code>
              </pre>
              {cell.outputs && cell.outputs.length > 0 && (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                    <Terminal className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-mono">Out [{cellIndex + 1}]:</span>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    {cell.outputs.map((output, outputIndex) => renderOutput(output, outputIndex))}
                  </div>
                </>
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
