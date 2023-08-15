import { compileTsCode } from './compile-ts-code.js';

describe('compileTsCode', () => {
  it('should compile ts code into js code and type-defs', () => {
    const tsCode = `
      const a: number = 5;
      console.log(a);
    `;
    const { jsCode, typeDefs } = compileTsCode(tsCode);
    expect(jsCode).toBe('var a = 5;\nconsole.log(a);\n');
    expect(typeDefs).toBe('declare const a: number;\n');
  });
});
