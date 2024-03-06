import { formatCode } from './format-code.js';

describe('formatCode', () => {
  it('should format TypeScript code correctly', async () => {
    const code = `const foo:string = "bar";`;
    const formattedCode = await formatCode(code, 'ts');
    expect(formattedCode).toBe(`const foo: string = 'bar';\n`);
  });

  it('should format JavaScript code correctly', async () => {
    const code = `const foo=   "bar"`;
    const formattedCode = await formatCode(code, 'js');
    expect(formattedCode).toBe(`const foo = 'bar';\n`);
  });
});
