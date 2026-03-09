import { visit } from 'unist-util-visit';

export default function remarkMathFix() {
  return (tree, file) => {
    const source = String(file);
    
    visit(tree, 'inlineMath', (node, index, parent) => {
      if (node.position) {
        const start = node.position.start.offset || 0;
        const end = node.position.end.offset || 0;
        const raw = source.slice(start, end);
        
        if (raw.startsWith('$$') && raw.endsWith('$$')) {
          const innerValue = raw.slice(2, -2);
          parent.children[index] = {
            type: 'math',
            meta: null,
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
          };
        }
      }
    });
  };
}
