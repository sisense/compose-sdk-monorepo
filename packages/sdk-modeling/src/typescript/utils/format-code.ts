import * as prettier from 'prettier';

export type CodeType = 'ts' | 'js';

const prettierConfig = {
  semi: true,
  trailingComma: 'all',
  endOfLine: 'lf',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 4,
  arrowParens: 'always',
} as const;

export async function formatCode(code: string, codeType: CodeType) {
  const parser = codeType === 'ts' ? 'typescript' : 'babel';
  return prettier.format(code, { ...prettierConfig, parser });
}
