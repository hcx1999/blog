import katex from 'katex';

const TestKaTeX = () => {
  const testFormulas = [
    { name: 'Simple fraction', formula: '\\frac{1}{2}' },
    { name: 'Greek letter', formula: '\\alpha + \\beta' },
    { name: 'Sum', formula: '\\sum_{i=1}^{n} i' },
    { name: 'Integral', formula: '\\int_0^1 x^2 dx' },
  ];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">KaTeX Test</h2>
      {testFormulas.map(({ name, formula }) => {
        let html = '';
        try {
          html = katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
          });
        } catch (e) {
          html = `<span style="color: red;">Error: ${String(e)}</span>`;
        }
        return (
          <div key={name} className="mb-2">
            <span className="font-mono text-sm text-gray-500">{name}: </span>
            <span dangerouslySetInnerHTML={{ __html: html }} />
            <span className="ml-2 text-xs text-gray-400">({formula})</span>
          </div>
        );
      })}
    </div>
  );
};

export default TestKaTeX;
