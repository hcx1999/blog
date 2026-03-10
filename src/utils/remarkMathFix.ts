import { visit } from 'unist-util-visit';
import type { Node, Parent } from 'unist';
import type { VFile } from 'vfile';

import type { Data } from 'unist';

interface MathNode extends Node {
  type: 'math';
  value: string;
  data?: Data;
}

interface InlineMathNode extends Node {
  type: 'inlineMath';
  value: string;
  data?: Data;
}

export default function remarkMathFix() {
  return (tree: Node, file: VFile) => {
    const source = String(file);
    
    visit(tree, 'inlineMath', (node: InlineMathNode, index: number | undefined, parent: Parent | undefined) => {
      if (node.position && index !== undefined && parent) {
        const start = node.position.start.offset || 0;
        const end = node.position.end.offset || 0;
        const raw = source.slice(start, end);
        
        if (raw.startsWith('$$') && raw.endsWith('$$')) {
          const innerValue = raw.slice(2, -2);
          parent.children[index] = {
            type: 'math',
            value: innerValue,
            data: {
              hName: 'pre',
              hChildren: [
                {
                  type: 'element',
                  tagName: 'code',
                  properties: { className: ['language-math', 'math-display'] },
                  children: [{ type: 'text', value: innerValue }]
                }
              ]
            }
          } as MathNode;
        }
      }
    });
  };
}
