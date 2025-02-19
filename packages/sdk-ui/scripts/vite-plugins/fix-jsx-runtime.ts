/**
 * Custom plugin to replace bare "react/jsx-runtime" with fully-specified "react/jsx-runtime.js".
 * Critical for customers who use old versions of React + new versions of Webpack.
 */
export function fixJsxRuntime() {
  return {
    name: 'fix-jsx-runtime',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk') {
          // Use a regex to replace all occurrences in the generated code.
          chunk.code = chunk.code.replace(
            /(from\s+['"])react\/jsx-runtime(['"])/g,
            `$1react/jsx-runtime.js$2`,
          );
        }
      }
    },
  };
}
