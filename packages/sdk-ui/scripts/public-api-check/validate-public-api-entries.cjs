// @ts-check

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

/**
 * @typedef {{
 *  entry: string;
 *  requiredTag: string;
 * }} ExportEntry
 */

/**
 * @typedef {{
 *  barrelPath: string;
 *  requiredTag: string;
 *  exportName: string;
 *  file: string;
 *  line: number;
 *  reason: string;
 * }} Violation
 */

/**
 * @param {string} filePath
 * @returns {string}
 */
const normalizePath = (filePath) => filePath.split(path.sep).join('/');

/**
 * Creates a TypeScript program from the package root tsconfig.
 *
 * @param {string} packageRoot
 * @returns {import('typescript').Program}
 */
function createProgram(packageRoot) {
  const tsConfigPath = path.join(packageRoot, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    throw new Error(`Cannot find tsconfig.json at ${tsConfigPath}`);
  }

  const parsedConfig = ts.getParsedCommandLineOfConfigFile(
    tsConfigPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic(diagnostic) {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      },
    },
  );

  if (!parsedConfig) {
    throw new Error(`Cannot parse ${tsConfigPath}`);
  }

  return ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
    projectReferences: parsedConfig.projectReferences,
  });
}

/**
 * Returns whether a declaration (or any of its owners) has the required JSDoc tag.
 *
 * @param {import('typescript').Node} node
 * @param {string} requiredTag
 * @returns {boolean}
 */
function hasRequiredTag(node, requiredTag) {
  const normalizedTag = requiredTag.replace(/^@/, '');
  /** @type {import('typescript').Node | undefined} */
  let current = node;
  while (current) {
    const tags = ts.getJSDocTags(current);
    if (tags.some((tag) => tag.tagName?.text === normalizedTag)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Resolves alias symbols to the final declaration.
 *
 * @param {import('typescript').Symbol | undefined} symbol
 * @param {import('typescript').TypeChecker} checker
 * @returns {import('typescript').Declaration | undefined}
 */
function resolveDeclaration(symbol, checker) {
  if (!symbol) {
    return undefined;
  }
  const resolvedSymbol =
    (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
  return resolvedSymbol.valueDeclaration || resolvedSymbol.declarations?.[0];
}

/**
 * @param {import('typescript').ExportDeclaration} statement
 * @returns {boolean}
 */
function isWildcardExport(statement) {
  if (!statement.moduleSpecifier) {
    return false;
  }
  if (!statement.exportClause) {
    return true;
  }
  return ts.isNamespaceExport(statement.exportClause);
}

/**
 * @param {import('typescript').ExportDeclaration} statement
 * @returns {readonly import('typescript').ExportSpecifier[]}
 */
function getNamedExportSpecifiers(statement) {
  if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
    return [];
  }
  return statement.exportClause.elements;
}

/**
 * Resolves module symbol from export declaration module specifier.
 *
 * @param {import('typescript').ExportDeclaration} statement
 * @param {import('typescript').TypeChecker} checker
 * @returns {import('typescript').Symbol | undefined}
 */
function resolveModuleSymbol(statement, checker) {
  if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
    return undefined;
  }
  const moduleSpecifierSymbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
  if (!moduleSpecifierSymbol) {
    return undefined;
  }
  return (moduleSpecifierSymbol.flags & ts.SymbolFlags.Alias) !== 0
    ? checker.getAliasedSymbol(moduleSpecifierSymbol)
    : moduleSpecifierSymbol;
}

/**
 * Groups violations by report heading while preserving insertion order.
 *
 * @param {readonly Violation[]} violations
 * @returns {Map<string, Violation[]>}
 */
function groupViolationsForReport(violations) {
  /** @type {Map<string, Violation[]>} */
  const violationsByHeading = new Map();

  for (const violation of violations) {
    const heading = violation.reason.replace(/\.$/, '');
    const current = violationsByHeading.get(heading) || [];
    current.push(violation);
    violationsByHeading.set(heading, current);
  }

  return violationsByHeading;
}

/**
 * Prints a readable report grouped by required tag.
 *
 * @param {readonly Violation[]} violations
 */
function printViolationsReport(violations) {
  console.error(`Public API check failed. Total violation(s): ${violations.length}`);

  const grouped = groupViolationsForReport(violations);
  for (const [heading, groupedViolations] of grouped) {
    console.error('');
    console.error(`${heading} (${groupedViolations.length} violation(s)):`);
    for (const violation of groupedViolations) {
      console.error(`- "${violation.exportName}" (${violation.file}:${violation.line})`);
    }
  }
}

/**
 * Validate one exports entry barrel file against required tag policy.
 *
 * @param {import('typescript').Program} program
 * @param {string} packageRoot
 * @param {string} barrelPath
 * @param {string} requiredTag
 * @returns {Violation[]}
 */
function validatePublicApiEntry(program, packageRoot, barrelPath, requiredTag) {
  const absoluteBarrelPath = path.resolve(packageRoot, barrelPath);
  const sourceFile = program.getSourceFile(absoluteBarrelPath);

  if (!sourceFile) {
    throw new Error(
      `Barrel file ${barrelPath} is not part of TypeScript program. Check tsconfig include/rootDir.`,
    );
  }

  const checker = program.getTypeChecker();
  /** @type {Violation[]} */
  const violations = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) {
      continue;
    }

    if (isWildcardExport(statement)) {
      const line = ts.getLineAndCharacterOfPosition(sourceFile, statement.getStart()).line + 1;
      violations.push({
        barrelPath,
        requiredTag,
        exportName: '*',
        file: normalizePath(sourceFile.fileName),
        line,
        reason: 'Wildcard exports are forbidden. Use named exports only.',
      });
      continue;
    }

    const moduleSymbol = resolveModuleSymbol(statement, checker);
    if (!moduleSymbol) {
      const line = ts.getLineAndCharacterOfPosition(sourceFile, statement.getStart()).line + 1;
      violations.push({
        barrelPath,
        requiredTag,
        exportName: '<unknown>',
        file: normalizePath(sourceFile.fileName),
        line,
        reason: 'Cannot resolve module symbol.',
      });
      continue;
    }

    const exportsByName = new Map(
      checker.getExportsOfModule(moduleSymbol).map((symbol) => [symbol.getName(), symbol]),
    );

    for (const specifier of getNamedExportSpecifiers(statement)) {
      const sourceName = specifier.propertyName?.text || specifier.name.text;
      const exportedAs = specifier.name.text;
      const symbol = exportsByName.get(sourceName);
      const declaration = resolveDeclaration(symbol, checker);

      if (!declaration) {
        const line = ts.getLineAndCharacterOfPosition(sourceFile, specifier.getStart()).line + 1;
        violations.push({
          barrelPath,
          requiredTag,
          exportName: exportedAs,
          file: normalizePath(sourceFile.fileName),
          line,
          reason: `Cannot resolve declaration for "${sourceName}".`,
        });
        continue;
      }

      if (hasRequiredTag(declaration, requiredTag)) {
        continue;
      }

      const declarationFile = declaration.getSourceFile();
      const line =
        ts.getLineAndCharacterOfPosition(declarationFile, declaration.getStart()).line + 1;
      violations.push({
        barrelPath,
        requiredTag,
        exportName: exportedAs,
        file: normalizePath(declarationFile.fileName),
        line,
        reason: `Missing required tag ${requiredTag}.`,
      });
    }
  }

  return violations;
}

/**
 * Runs export-entry validation for the configured entries from current execution folder.
 *
 * @param {readonly ExportEntry[]} exportEntries
 */
function validatePublicApiEntries(exportEntries) {
  const packageRoot = process.cwd();
  const program = createProgram(packageRoot);
  const violations = exportEntries.flatMap(({ entry, requiredTag }) =>
    validatePublicApiEntry(program, packageRoot, entry, requiredTag),
  );

  if (violations.length === 0) {
    console.log('Public API check passed.');
    return;
  }

  printViolationsReport(violations);
  process.exitCode = 1;
}

module.exports = {
  validatePublicApiEntries,
};
