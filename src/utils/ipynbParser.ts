import type { NotebookCell } from '../types';

export interface NotebookMetadata {
  kernelspec?: {
    display_name: string;
    language: string;
    name: string;
  };
  language_info?: {
    name: string;
    version: string;
  };
  [key: string]: unknown;
}

export interface Notebook {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

export function parseIpynb(content: string): string {
  try {
    const nb: Notebook = JSON.parse(content);
    let markdown = '';

    for (const cell of nb.cells) {
      if (cell.cell_type === 'markdown') {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        markdown += source + '\n\n';
      } else if (cell.cell_type === 'code') {
        const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        if (source.trim()) {
          markdown += '```python\n' + source + '\n```\n\n';
        }

        if (cell.outputs) {
          for (const output of cell.outputs) {
            if (output.data) {
              if (output.data['image/png']) {
                const base64Data = output.data['image/png'];
                const imageUrl = `data:image/png;base64,${base64Data}`;
                markdown += `![Output Image](${imageUrl})\n\n`;
              } else if (output.data['image/jpeg']) {
                const base64Data = output.data['image/jpeg'];
                const imageUrl = `data:image/jpeg;base64,${base64Data}`;
                markdown += `![Output Image](${imageUrl})\n\n`;
              } else if (output.data['image/svg+xml']) {
                const svgData = output.data['image/svg+xml'];
                markdown += `${svgData}\n\n`;
              } else if (output.data['text/plain']) {
                const text = output.data['text/plain'];
                markdown += '```\n' + text + '\n```\n\n';
              } else if (output.data['text/html']) {
                const html = output.data['text/html'];
                markdown += html + '\n\n';
              }
            }
          }
        }
      }
    }

    return markdown;
  } catch (error) {
    console.error('Error parsing ipynb file:', error);
    return content;
  }
}
