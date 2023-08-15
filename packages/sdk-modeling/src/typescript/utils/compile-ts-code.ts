import ts from 'typescript';

export function compileTsCode(tsCode: string): { jsCode: string; typeDefs: string } {
  const jsCode = ts.transpileModule(tsCode, { compilerOptions: { module: ts.ModuleKind.ES2015 } });

  return { jsCode: jsCode.outputText, typeDefs: getTypeDefs(tsCode) };
}

function getTypeDefs(tsCode: string): string {
  const options = {
    emitDeclarationOnly: true,
    declaration: true,
  };

  let dts = '';
  const host = ts.createCompilerHost(options);
  host.writeFile = (_, contents) => (dts = contents);
  host.readFile = () => tsCode;

  const program = ts.createProgram([''], options, host);
  program.emit();

  return dts;
}
